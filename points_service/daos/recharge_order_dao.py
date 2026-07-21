from decimal import Decimal
from datetime import datetime
from typing import Optional, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.recharge_order import RechargeOrder


class RechargeOrderDAO:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        order_id: str,
        user_id: str,
        amount: Decimal,
        points: Decimal,
        payment_method: str,
        payment_url: Optional[str] = None,
    ) -> RechargeOrder:
        """创建充值订单"""
        order = RechargeOrder(
            order_id=order_id,
            user_id=user_id,
            amount=amount,
            points=points,
            payment_method=payment_method,
            payment_url=payment_url,
            status="pending",
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_by_order_id(self, order_id: str) -> Optional[RechargeOrder]:
        """根据订单号查询订单"""
        return self.db.scalar(
            select(RechargeOrder).where(RechargeOrder.order_id == order_id)
        )

    def get_by_user_id(self, user_id: str, limit: int = 10) -> List[RechargeOrder]:
        """根据用户ID查询订单列表"""
        return list(
            self.db.scalars(
                select(RechargeOrder)
                .where(RechargeOrder.user_id == user_id)
                .order_by(RechargeOrder.create_time.desc())
                .limit(limit)
            )
        )

    def update_status(self, order: RechargeOrder, status: str) -> bool:
        """更新订单状态"""
        order.status = status
        self.db.commit()
        self.db.refresh(order)
        return True

    def update_payment_info(
        self, order: RechargeOrder, status: str, payment_time: datetime
    ) -> bool:
        """更新支付信息"""
        order.status = status
        order.payment_time = payment_time
        self.db.commit()
        self.db.refresh(order)
        return True
