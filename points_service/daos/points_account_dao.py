from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.points_account import PointsAccount


class PointsAccountDAO:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: str, balance: Decimal = Decimal("100.00")) -> PointsAccount:
        """创建积分账户"""
        account = PointsAccount(user_id=user_id, balance=balance)
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account

    def get_by_user_id(self, user_id: str) -> Optional[PointsAccount]:
        """根据用户ID查询积分账户"""
        return self.db.scalar(select(PointsAccount).where(PointsAccount.user_id == user_id))

    def update_balance(self, account: PointsAccount, new_balance: Decimal) -> bool:
        """更新积分余额（使用乐观锁）"""
        account.balance = new_balance
        account.version += 1
        self.db.commit()
        self.db.refresh(account)
        return True

    def update_with_lock(self, account: PointsAccount, new_balance: Decimal) -> bool:
        """更新积分余额（使用悲观锁）"""
        account.balance = new_balance
        self.db.commit()
        self.db.refresh(account)
        return True

    def exists_by_user_id(self, user_id: str) -> bool:
        """检查用户是否存在"""
        return self.db.scalar(
            select(PointsAccount).where(PointsAccount.user_id == user_id).limit(1)
        ) is not None

    def get_for_update(self, user_id: str) -> Optional[PointsAccount]:
        """获取积分账户（加锁）"""
        return self.db.scalar(
            select(PointsAccount).where(PointsAccount.user_id == user_id).with_for_update()
        )
