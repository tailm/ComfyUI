from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from config import settings
from daos import RechargeOrderDAO
from models.recharge_order import RechargeOrder
from utils.logger import logger
from utils.metrics import recharge_counter


class RechargeOrderService:
    def __init__(self, db: Session):
        self.db = db
        self.order_dao = RechargeOrderDAO(db)

    def create_order(
        self, user_id: str, amount: Decimal, payment_method: str
    ) -> RechargeOrder:
        """创建充值订单"""
        try:
            if amount <= 0:
                raise ValueError("充值金额必须大于0")

            # 计算充值积分
            points = self.calculate_points(amount)

            # 生成订单号
            order_id = self.generate_order_id()

            # 调用支付服务创建订单（这里模拟）
            payment_url = self.mock_create_payment_order(order_id, amount, payment_method)

            # 保存订单
            order = self.order_dao.create(
                order_id=order_id,
                user_id=user_id,
                amount=amount,
                points=points,
                payment_method=payment_method,
                payment_url=payment_url,
            )

            logger.info(
                f"用户{user_id}创建充值订单成功，订单号{order_id}，充值金额{amount}元，充值积分{points}"
            )
            recharge_counter.labels(status="success").inc()
            return order
        except Exception as e:
            logger.error(f"用户{user_id}创建充值订单失败：{e}")
            recharge_counter.labels(status="error").inc()
            raise e

    def get_order(self, order_id: str) -> Optional[RechargeOrder]:
        """查询订单信息"""
        return self.order_dao.get_by_order_id(order_id)

    def update_order_status(self, order_id: str, status: str) -> bool:
        """更新订单状态"""
        order = self.order_dao.get_by_order_id(order_id)
        if not order:
            return False
        return self.order_dao.update_status(order, status)

    def calculate_points(self, amount: Decimal) -> Decimal:
        """计算充值积分（支持配置化）"""
        return amount * Decimal(str(settings.points.recharge_ratio))

    def generate_order_id(self) -> str:
        """生成订单号"""
        import uuid
        return f"RCH{uuid.uuid4().hex[:20].upper()}"

    def mock_create_payment_order(
        self, order_id: str, amount: Decimal, payment_method: str
    ) -> str:
        """模拟创建支付订单"""
        # 这里应该调用真实的支付服务SDK
        # 返回模拟的支付链接
        return f"https://payment.example.com/pay?order_id={order_id}&amount={amount}&method={payment_method}"
