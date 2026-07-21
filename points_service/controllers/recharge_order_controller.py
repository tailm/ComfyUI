from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from utils import get_db
from services import RechargeOrderService, PaymentCallbackService
from utils.metrics import recharge_counter, recharge_duration
import time

recharge_order_router = APIRouter(prefix="/recharge-orders", tags=["充值订单"])


class CreateOrderRequest(BaseModel):
    userId: str = Field(..., description="用户ID")
    amount: Decimal = Field(..., gt=0, description="充值金额")
    paymentMethod: str = Field(..., description="支付方式：alipay-支付宝，wechat-微信")


class CreateOrderResponse(BaseModel):
    orderId: str
    amount: float
    points: float
    paymentMethod: str
    paymentUrl: str
    status: str
    createTime: str


class PaymentCallbackRequest(BaseModel):
    orderId: str = Field(..., description="订单号")
    paymentAmount: Decimal = Field(..., description="支付金额")
    paymentMethod: str = Field(..., description="支付方式")
    signature: str = Field(..., description="签名")


@recharge_order_router.post("", response_model=CreateOrderResponse)
def create_order(
    request: CreateOrderRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """创建充值订单"""
    try:
        start_time = time.time()
        service = RechargeOrderService(db)
        order = service.create_order(request.userId, request.amount, request.paymentMethod)
        recharge_duration.observe(time.time() - start_time)
        return CreateOrderResponse(
            orderId=order.order_id,
            amount=float(order.amount),
            points=float(order.points),
            paymentMethod=order.payment_method,
            paymentUrl=order.payment_url or "",
            status=order.status,
            createTime=order.create_time.isoformat() if order.create_time else "",
        )
    except ValueError as e:
        recharge_counter.labels(status="invalid_param").inc()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        recharge_counter.labels(status="error").inc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@recharge_order_router.post("/callback")
def payment_callback(
    request: PaymentCallbackRequest,
    db: Annotated[Session, Depends(get_db)],
):
    """支付回调"""
    try:
        service = PaymentCallbackService(db)
        service.handle_callback(
            request.orderId, request.paymentAmount, request.paymentMethod, request.signature
        )
        return {"code": 200, "message": "success"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
