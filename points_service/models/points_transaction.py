from decimal import Decimal

from sqlalchemy import DECIMAL, VARCHAR, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from models import Base


class PointsTransaction(Base):
    __tablename__ = "points_transaction"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="主键ID")
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, comment="用户ID")
    transaction_type: Mapped[str] = mapped_column(VARCHAR(20), nullable=False, comment="变动类型")
    amount: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, comment="变动金额")
    balance_before: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, comment="变动前余额")
    balance_after: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=False, comment="变动后余额")
    reference_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=True, comment="关联ID")
    remark: Mapped[str] = mapped_column(VARCHAR(255), nullable=True, comment="备注")
    create_time: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
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
