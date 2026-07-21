import json
import logging
from decimal import Decimal
from fastapi import HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List

from aiohttp import web

from api_server.routes.config_routes import get_user_id_from_request
from comfy_api.points import (
    PointsAccountService,
    RechargeOrderService,
    PaymentCallbackService,
    InsufficientPointsException,
    AccountNotFoundException,
)

logger = logging.getLogger(__name__)


class InitAccountRequest(BaseModel):
    userId: str = Field(..., description="用户ID")


class InitAccountResponse(BaseModel):
    userId: str
    balance: float
    status: str
    createTime: Optional[str] = None
    updateTime: Optional[str] = None


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
    createTime: Optional[str] = None
    updateTime: Optional[str] = None


class CreateOrderRequest(BaseModel):
    userId: str = Field(..., description="用户ID")
    amount: float = Field(..., gt=0, description="充值金额")
    paymentMethod: str = Field(..., description="支付方式：alipay-支付宝，wechat-微信")


class CreateOrderResponse(BaseModel):
    orderId: str
    amount: float
    points: float
    paymentMethod: str
    paymentUrl: Optional[str] = None
    status: str
    createTime: Optional[str] = None


class PaymentCallbackRequest(BaseModel):
    orderId: str = Field(..., description="订单号")
    paymentAmount: float = Field(..., description="支付金额")
    paymentMethod: str = Field(..., description="支付方式")
    signature: str = Field(..., description="签名")


class GetStatsResponse(BaseModel):
    balance: float
    totalEarned: float
    totalConsumed: float


class PointsTransactionItem(BaseModel):
    id: int
    transactionType: str
    amount: float
    balanceBefore: float
    balanceAfter: float
    remark: Optional[str] = None
    createTime: str


class GetTransactionsResponse(BaseModel):
    transactions: List[PointsTransactionItem]
    page: int
    pageSize: int
    total: int
    totalPages: int


class ClaimDailyPointsResponse(BaseModel):
    amount: float
    balance: float


async def init_account(request: web.Request):
    """初始化积分账户"""
    try:
        body = await request.json()
        req = InitAccountRequest(**body)
        service = PointsAccountService()
        account = service.init_account(req.userId)
        return web.json_response({
            "userId": account.user_id,
            "balance": float(account.balance),
            "status": account.status,
            "createTime": account.create_time.isoformat() if account.create_time else None,
            "updateTime": account.update_time.isoformat() if account.update_time else None,
        })
    except Exception as e:
        logger.error(f"初始化积分账户失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def validate_points(request: web.Request):
    """验证积分是否足够运行任务"""
    try:
        body = await request.json()
        req = ValidatePointsRequest(**body)
        service = PointsAccountService()
        allowed = service.validate_points(req.userId)
        balance = service.get_balance(req.userId)
        return web.json_response({
            "allowed": allowed,
            "balance": float(balance)
        })
    except Exception as e:
        logger.error(f"验证积分失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def deduct_points(request: web.Request):
    """扣减积分"""
    try:
        body = await request.json()
        req = DeductPointsRequest(**body)
        service = PointsAccountService()
        balance = service.deduct_points(req.userId, req.duration)
        return web.json_response({
            "userId": req.userId,
            "deductedPoints": req.duration,
            "balance": float(balance),
        })
    except InsufficientPointsException:
        raise web.HTTPForbidden(text="积分不足")
    except AccountNotFoundException:
        raise web.HTTPNotFound(text="积分账户不存在")
    except Exception as e:
        logger.error(f"扣减积分失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def get_balance(request: web.Request):
    """查询积分余额"""
    try:
        user_id = get_user_id_from_request(request)
        service = PointsAccountService()
        balance = service.get_balance(user_id)
        return web.json_response({
            "userId": user_id,
            "balance": float(balance),
            "status": "active",
            "createTime": None,
            "updateTime": None,
        })
    except Exception as e:
        logger.error(f"查询积分余额失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def create_order(request: web.Request):
    """创建充值订单"""
    try:
        body = await request.json()
        req = CreateOrderRequest(**body)
        service = RechargeOrderService()
        order = service.create_order(
            req.userId, Decimal(str(req.amount)), req.paymentMethod
        )
        return web.json_response({
            "orderId": order.order_id,
            "amount": float(order.amount),
            "points": float(order.points),
            "paymentMethod": order.payment_method,
            "paymentUrl": order.payment_url,
            "status": order.status,
            "createTime": order.create_time.isoformat() if order.create_time else None,
        })
    except Exception as e:
        logger.error(f"创建充值订单失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def payment_callback(request: web.Request):
    """支付回调"""
    try:
        body = await request.json()
        req = PaymentCallbackRequest(**body)
        service = PaymentCallbackService()
        service.handle_callback(
            req.orderId,
            Decimal(str(req.paymentAmount)),
            req.paymentMethod,
            req.signature,
        )
        return web.json_response({"code": 200, "message": "success"})
    except Exception as e:
        logger.error(f"处理支付回调失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def get_stats(request: web.Request):
    """查询积分统计"""
    try:
        user_id = get_user_id_from_request(request)
    except web.HTTPUnauthorized:
        return web.json_response({
            "balance": 0,
            "totalEarned": 0,
            "totalConsumed": 0
        })
    
    try:
        service = PointsAccountService()
        balance = service.get_balance(user_id)
        
        # 获取统计数据
        from sqlalchemy import select, func
        from app.database.db import create_session
        from app.database.points.models import PointsTransaction
        from decimal import Decimal as D
        
        session = create_session()
        try:
            # 查询累计获取（amount > 0）
            total_earned = session.scalar(
                select(func.coalesce(func.sum(PointsTransaction.amount), 0)).where(
                    PointsTransaction.user_id == user_id,
                    PointsTransaction.amount > 0
                )
            ) or D("0.00")
            
            # 查询累计消耗（amount < 0，取绝对值）
            total_consumed = session.scalar(
                select(func.coalesce(func.sum(func.abs(PointsTransaction.amount)), 0)).where(
                    PointsTransaction.user_id == user_id,
                    PointsTransaction.amount < 0
                )
            ) or D("0.00")
        finally:
            session.close()
        
        return web.json_response({
            "balance": float(balance),
            "totalEarned": float(total_earned),
            "totalConsumed": float(total_consumed)
        })
    except Exception as e:
        logger.error(f"查询积分统计失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def get_transactions(request: web.Request):
    """查询积分交易记录"""
    try:
        user_id = get_user_id_from_request(request)
    except web.HTTPUnauthorized:
        return web.json_response({
            "transactions": [],
            "page": 1,
            "pageSize": 10,
            "total": 0,
            "totalPages": 0
        })
    
    try:
        # 获取分页参数
        page = int(request.query.get('page', 1))
        page_size = int(request.query.get('pageSize', 10))
        type_filter = request.query.get('type', 'all')
        
        # 参数校验
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 10
        if type_filter not in ['all', 'earned', 'consumed']:
            type_filter = 'all'
        
        # 查询交易记录
        from sqlalchemy import select, func
        from app.database.db import create_session
        from app.database.points.models import PointsTransaction
        
        session = create_session()
        try:
            # 构建基础查询
            base_query = select(PointsTransaction).where(PointsTransaction.user_id == user_id)
            
            # 根据筛选条件添加过滤
            if type_filter == 'earned':
                base_query = base_query.where(PointsTransaction.amount > 0)
            elif type_filter == 'consumed':
                base_query = base_query.where(PointsTransaction.amount < 0)
            
            # 查询总数
            count_query = select(func.count()).select_from(base_query.subquery())
            total = session.scalar(count_query) or 0
            
            # 分页查询
            offset = (page - 1) * page_size
            transactions = list(
                session.scalars(
                    base_query
                    .order_by(PointsTransaction.create_time.desc())
                    .offset(offset)
                    .limit(page_size)
                )
            )
            
            # 计算总页数
            total_pages = (total + page_size - 1) // page_size
            
            # 转换为响应格式
            transaction_items = [
                {
                    "id": t.id,
                    "transactionType": t.transaction_type,
                    "amount": float(t.amount),
                    "balanceBefore": float(t.balance_before),
                    "balanceAfter": float(t.balance_after),
                    "remark": t.remark,
                    "createTime": t.create_time.isoformat() if t.create_time else None
                }
                for t in transactions
            ]
        finally:
            session.close()
        
        return web.json_response({
            "transactions": transaction_items,
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": total_pages
        })
    except Exception as e:
        logger.error(f"查询积分交易记录失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))


async def claim_daily_points(request: web.Request):
    """每日领取积分：每个用户每天最多领取一次，每次20积分，余额超过20不能领取"""
    try:
        user_id = get_user_id_from_request(request)
    except web.HTTPUnauthorized:
        raise web.HTTPUnauthorized(
            text=json.dumps({"error": "请先登录"}),
            content_type="application/json"
        )

    try:
        from datetime import date
        from sqlalchemy import select, func
        from app.database.db import create_session
        from app.database.points.models import PointsTransaction, PointsAccount
        from decimal import Decimal as D

        DAILY_CLAIM_AMOUNT = D("20.00")
        MAX_BALANCE_FOR_CLAIM = D("20.00")

        session = create_session()
        try:
            # 检查当前余额是否超过20
            account = session.scalar(
                select(PointsAccount).where(PointsAccount.user_id == user_id)
            )
            if not account:
                raise web.HTTPNotFound(
                    text=json.dumps({"error": "积分账户不存在"}),
                    content_type="application/json"
                )
            if account.balance > MAX_BALANCE_FOR_CLAIM:
                raise web.HTTPBadRequest(
                    text=json.dumps({"error": "积分余额超过20，无法领取每日积分"}),
                    content_type="application/json"
                )

            # 检查今天是否已领取
            today = date.today()
            already_claimed = session.scalar(
                select(func.count()).select_from(
                    select(PointsTransaction).where(
                        PointsTransaction.user_id == user_id,
                        PointsTransaction.transaction_type == "daily_claim",
                        func.date(PointsTransaction.create_time) == today
                    ).subquery()
                )
            )
            if already_claimed and already_claimed > 0:
                raise web.HTTPBadRequest(
                    text=json.dumps({"error": "今天已领取过每日积分"}),
                    content_type="application/json"
                )

            # 发放积分
            balance_before = account.balance
            balance_after = balance_before + DAILY_CLAIM_AMOUNT
            account.balance = balance_after

            transaction = PointsTransaction(
                user_id=user_id,
                transaction_type="daily_claim",
                amount=DAILY_CLAIM_AMOUNT,
                balance_before=balance_before,
                balance_after=balance_after,
                remark="每日领取积分"
            )
            session.add(transaction)
            session.commit()

            return web.json_response({
                "amount": float(DAILY_CLAIM_AMOUNT),
                "balance": float(balance_after)
            })
        except web.HTTPError:
            raise
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    except web.HTTPError:
        raise
    except Exception as e:
        logger.error(f"每日领取积分失败：{e}")
        raise web.HTTPInternalServerError(text=str(e))
