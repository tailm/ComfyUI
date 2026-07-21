from decimal import Decimal
from typing import List, Optional, Tuple

from sqlalchemy import select, func
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

    def get_by_user_id_with_filter(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 10,
        type_filter: str = 'all'
    ) -> Tuple[List[PointsTransaction], int]:
        """根据用户ID查询变动记录，支持分页和筛选
        
        Args:
            user_id: 用户ID
            page: 页码，从1开始
            page_size: 每页数量
            type_filter: 类型筛选，'all'-全部，'earned'-获取，'consumed'-消耗
        
        Returns:
            (交易记录列表, 总数)
        """
        # 构建基础查询
        base_query = select(PointsTransaction).where(PointsTransaction.user_id == user_id)
        
        # 根据筛选条件添加过滤
        if type_filter == 'earned':
            # 获取：amount > 0
            base_query = base_query.where(PointsTransaction.amount > 0)
        elif type_filter == 'consumed':
            # 消耗：amount < 0
            base_query = base_query.where(PointsTransaction.amount < 0)
        
        # 查询总数
        count_query = select(func.count()).select_from(base_query.subquery())
        total = self.db.scalar(count_query) or 0
        
        # 分页查询
        offset = (page - 1) * page_size
        transactions = list(
            self.db.scalars(
                base_query
                .order_by(PointsTransaction.create_time.desc())
                .offset(offset)
                .limit(page_size)
            )
        )
        
        return transactions, total

    def get_stats_by_user_id(self, user_id: str) -> dict:
        """获取用户积分统计
        
        Args:
            user_id: 用户ID
        
        Returns:
            {
                'total_earned': 累计获取,
                'total_consumed': 累计消耗
            }
        """
        # 查询累计获取（amount > 0）
        earned_query = select(func.coalesce(func.sum(PointsTransaction.amount), 0)).where(
            PointsTransaction.user_id == user_id,
            PointsTransaction.amount > 0
        )
        total_earned = self.db.scalar(earned_query) or Decimal("0.00")
        
        # 查询累计消耗（amount < 0，取绝对值）
        consumed_query = select(func.coalesce(func.sum(func.abs(PointsTransaction.amount)), 0)).where(
            PointsTransaction.user_id == user_id,
            PointsTransaction.amount < 0
        )
        total_consumed = self.db.scalar(consumed_query) or Decimal("0.00")
        
        return {
            'total_earned': total_earned,
            'total_consumed': total_consumed
        }
