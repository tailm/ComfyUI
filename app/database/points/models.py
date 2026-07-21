from decimal import Decimal
from datetime import datetime
from sqlalchemy import DECIMAL, VARCHAR, DateTime, func, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.database.models import Base


class PointsAccount(Base):
    __tablename__ = "points_account"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, unique=True)
    balance: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 2), nullable=False, default=Decimal("100.00")
    )
    status: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="active")
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    create_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    update_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": float(self.balance),
            "status": self.status,
            "version": self.version,
            "create_time": self.create_time.isoformat() if self.create_time else None,
            "update_time": self.update_time.isoformat() if self.update_time else None,
        }


class RechargeOrder(Base):
    __tablename__ = "recharge_order"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    order_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, unique=True)
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    points: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    payment_method: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    payment_url: Mapped[str] = mapped_column(VARCHAR(512), nullable=True)
    status: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, default="pending")
    payment_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    create_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    update_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
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


class PointsTransaction(Base):
    __tablename__ = "points_transaction"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False)
    transaction_type: Mapped[str] = mapped_column(VARCHAR(20), nullable=False)
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    balance_before: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    balance_after: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False)
    reference_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=True)
    remark: Mapped[str] = mapped_column(VARCHAR(255), nullable=True)
    create_time: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "transaction_type": self.transaction_type,
            "amount": float(self.amount),
            "balance_before": float(self.balance_before),
            "balance_after": float(self.balance_after),
            "reference_id": self.reference_id,
            "remark": self.remark,
            "create_time": self.create_time.isoformat() if self.create_time else None,
        }
