from decimal import Decimal

from sqlalchemy import DECIMAL, VARCHAR, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from models import Base


class RechargeOrder(Base):
    __tablename__ = "recharge_order"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="主键ID")
    order_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, unique=True, comment="订单号")
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, comment="用户ID")
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, comment="充值金额")
    points: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, comment="充值积分")
    payment_method: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, comment="支付方式")
    payment_url: Mapped[str] = mapped_column(VARCHAR(512), nullable=True, comment="支付链接")
    status: Mapped[str] = mapped_column(
        VARCHAR(20), nullable=False, default="pending", comment="订单状态"
    )
    payment_time: Mapped[DateTime] = mapped_column(DateTime, nullable=True, comment="支付时间")
    create_time: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )
    update_time: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now(), comment="更新时间"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "user_id": self.user_id,
            "amount": float(self.amount),
            "points": float(self.points),
            "payment_method": self.payment_method,
            "payment_url": self.payment_url,
            "status": self.status,
            "payment_time": self.payment_time.isoformat() if self.payment_time else None,
            "create_time": self.create_time.isoformat() if self.create_time else None,
            "update_time": self.update_time.isoformat() if self.update_time else None,
        }
