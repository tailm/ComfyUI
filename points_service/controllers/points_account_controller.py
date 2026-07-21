from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from utils import get_db
from services import PointsAccountService, PointsCacheService
from utils import get_redis
from utils.metrics import query_balance_counter, deduct_points_counter, deduct_points_duration, query_balance_duration
from utils.exceptions import InsufficientPointsException, AccountNotFoundException
import redis
import time

points_account_router = APIRouter(prefix="/points-accounts", tags=["积分账户"])


class InitAccountRequest(BaseModel):
    userId: str = Field(..., description="用户ID")


class InitAccountResponse(BaseModel):
    userId: str
    balance: float
    status: str
    createTime: str
    updateTime: str


class ValidatePointsRequest(BaseModel):
    userId: str = Field(..., description="用户ID")


class ValidatePointsResponse(BaseModel):
    allowed: bool
    balance: float


class DeductPointsRequest(BaseModel):
    userId: str = Field(..., description="用户ID")
    duration: int = Field(..., gt=0, description="任务运行时长（秒）")


class DeductPointsResponse(BaseModel):
    userId: str
    deductedPoints: int
    balance: float


class GetBalanceResponse(BaseModel):
    userId: str
    balance: float
    status: str
    createTime: str
    updateTime: str


@points_account_router.post("/init", response_model=InitAccountResponse)
def init_account(
    request: InitAccountRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """初始化积分账户"""
    service = PointsAccountService(db)
    account = service.init_account(request.userId)
    return InitAccountResponse(
        userId=account.user_id,
        balance=float(account.balance),
        status=account.status,
        createTime=account.create_time.isoformat() if account.create_time else "",
        updateTime=account.update_time.isoformat() if account.update_time else "",
    )


@points_account_router.post("/validate", response_model=ValidatePointsResponse)
def validate_points(
    request: ValidatePointsRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """验证积分是否足够运行任务"""
    service = PointsAccountService(db)
    allowed = service.validate_points(request.userId)
    balance = service.get_balance(request.userId)
    return ValidatePointsResponse(allowed=allowed, balance=float(balance))


@points_account_router.post("/deduct", response_model=DeductPointsResponse)
def deduct_points(
    request: DeductPointsRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """扣减积分"""
    try:
        start_time = time.time()
        service = PointsAccountService(db)
        balance = service.deduct_points(request.userId, request.duration)
        deduct_points_counter.labels(status="success").inc()
        deduct_points_duration.observe(time.time() - start_time)
        return DeductPointsResponse(
            userId=request.userId,
            deductedPoints=request.duration,
            balance=float(balance),
        )
    except InsufficientPointsException:
        deduct_points_counter.labels(status="insufficient").inc()
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="积分不足")
    except AccountNotFoundException:
        deduct_points_counter.labels(status="not_found").inc()
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="积分账户不存在")
    except Exception as e:
        deduct_points_counter.labels(status="error").inc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@points_account_router.get("/{userId}", response_model=GetBalanceResponse)
def get_balance(
    userId: str,
    db: Annotated[Session, Depends(get_db)],
    redis_client: Annotated[redis.Redis, Depends(get_redis)],
):
    """查询积分余额"""
    start_time = time.time()
    try:
        cache_service = PointsCacheService(redis_client)
        service = PointsAccountService(db)

        # 先从缓存查询
        cached_balance = cache_service.get_balance_from_cache(userId)
        if cached_balance is not None:
            query_balance_counter.labels(status="cache_hit").inc()
            query_balance_duration.observe(time.time() - start_time)
            return GetBalanceResponse(
                userId=userId,
                balance=float(cached_balance),
                status="active",
                createTime="",
                updateTime="",
            )

        # 缓存未命中，查询数据库
        balance = service.get_balance(userId)
        query_balance_counter.labels(status="cache_miss").inc()

        # 更新缓存
        if balance > 0:
            cache_service.set_balance_to_cache(userId, balance)
        else:
            cache_service.set_balance_to_cache(userId, Decimal("0.00"))

        query_balance_duration.observe(time.time() - start_time)
        return GetBalanceResponse(
            userId=userId,
            balance=float(balance),
            status="active",
            createTime="",
            updateTime="",
        )
    except Exception as e:
        query_balance_counter.labels(status="error").inc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
