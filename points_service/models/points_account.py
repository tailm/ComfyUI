from decimal import Decimal

from sqlalchemy import DECIMAL, VARCHAR, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from models import Base


class PointsAccount(Base):
    __tablename__ = "points_account"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, comment="主键ID")
    user_id: Mapped[str] = mapped_column(VARCHAR(64), nullable=False, comment="用户ID")
    balance: Mapped[Decimal] = mapped_column(
        DECIMAL(10, 2), nullable=False, default=Decimal("100.00"), comment="积分余额"
    )
    status: Mapped[str] = mapped_column(
        VARCHAR(20), nullable=False, default="active", comment="账户状态"
    )
    version: Mapped[int] = mapped_column(nullable=False, default=0, comment="乐观锁版本号")
    create_time: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), comment="创建时间"
    )
    update_time: Mapped[DateTime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now(), comment="更新时间"
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
