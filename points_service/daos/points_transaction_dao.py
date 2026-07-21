from decimal import Decimal
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from models.points_transaction import PointsTransaction


class PointsTransactionDAO:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        user_id: str,
        transaction_type: str,
        amount: Decimal,
        balance_before: Decimal,
        balance_after: Decimal,
        reference_id: Optional[str] = None,
        remark: Optional[str] = None,
    ) -> PointsTransaction:
        """创建积分变动记录"""
        transaction = PointsTransaction(
            user_id=user_id,
            transaction_type=transaction_type,
            amount=amount,
            balance_before=balance_before,
            balance_after=balance_after,
            reference_id=reference_id,
            remark=remark,
        )
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def get_by_user_id(self, user_id: str, limit: int = 10) -> List[PointsTransaction]:
        """根据用户ID查询变动记录"""
        return list(
            self.db.scalars(
                select(PointsTransaction)
                .where(PointsTransaction.user_id == user_id)
                .order_by(PointsTransaction.create_time.desc())
                .limit(limit)
            )
        )

    def get_by_reference_id(
        self, reference_id: str
    ) -> Optional[PointsTransaction]:
        """根据关联ID查询变动记录"""
        return self.db.scalar(
            select(PointsTransaction).where(PointsTransaction.reference_id == reference_id)
        )
