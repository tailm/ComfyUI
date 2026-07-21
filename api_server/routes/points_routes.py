import logging
from decimal import Decimal
from fastapi import HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional

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
