from decimal import Decimal
from datetime import datetime

from sqlalchemy.orm import Session

from services import RechargeOrderService, PointsAccountService
from models.recharge_order import RechargeOrder
from utils.exceptions import (
    OrderNotFoundException,
    OrderStatusException,
    InvalidSignatureException,
    InvalidAmountException,
)
from utils.logger import logger
from utils.metrics import recharge_counter


class PaymentCallbackService:
    def __init__(self, db: Session):
        self.db = db
        self.order_service = RechargeOrderService(db)
        self.account_service = PointsAccountService(db)

    def handle_callback(
        self, order_id: str, payment_amount: Decimal, payment_method: str, signature: str
    ) -> bool:
        """处理支付回调"""
        try:
            # 验证签名
            if not self.verify_signature(signature, order_id, payment_amount, payment_method):
                raise InvalidSignatureException("签名验证失败")

            # 查询订单
            order = self.order_service.get_order(order_id)
            if not order:
                raise OrderNotFoundException(f"订单{order_id}不存在")

            # 校验金额
            if order.amount != payment_amount:
                raise InvalidAmountException(
                    f"订单金额不匹配，订单金额{order.amount}，支付金额{payment_amount}"
                )

            # 幂等性处理
            if order.status == "paid":
                logger.info(f"订单{order_id}已支付，跳过处理")
                return True

            # 处理支付成功
            return self.process_payment_success(order)
        except Exception as e:
            logger.error(f"处理支付回调失败：{e}")
            raise e

    def verify_signature(
        self, signature: str, order_id: str, payment_amount: Decimal, payment_method: str
    ) -> bool:
        """验证签名"""
        # 这里应该调用真实的支付SDK验证签名
        # 模拟签名验证
        return True

    def process_payment_success(self, order: RechargeOrder) -> bool:
        """处理支付成功逻辑"""
        try:
            # 增加用户积分
            self.account_service.add_points(
                user_id=order.user_id,
                points=order.points,
                reference_id=order.order_id,
                remark=f"充值订单{order.order_id}支付成功",
            )

            # 更新订单状态
            self.order_service.update_order_status(order.order_id, "paid")

            logger.info(f"订单{order.order_id}支付成功，用户{order.user_id}增加{order.points}积分")
            recharge_counter.labels(status="success").inc()
            return True
        except Exception as e:
            logger.error(f"处理订单{order.order_id}支付成功失败：{e}")
            recharge_counter.labels(status="error").inc()
            raise e
