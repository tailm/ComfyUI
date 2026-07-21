from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from config import settings
from daos import PointsAccountDAO, PointsTransactionDAO
from daos.points_account_dao import PointsAccountDAO
from models.points_account import PointsAccount
from models.points_transaction import PointsTransaction
from utils.exceptions import (
    AccountNotFoundException,
    InsufficientPointsException,
)
from utils.logger import logger
from utils.metrics import init_account_counter


class PointsAccountService:
    def __init__(self, db: Session):
        self.db = db
        self.account_dao = PointsAccountDAO(db)
        self.transaction_dao = PointsTransactionDAO(db)

    def init_account(self, user_id: str) -> PointsAccount:
        """初始化积分账户（支持幂等）"""
        try:
            account = self.account_dao.get_by_user_id(user_id)
            if account:
                logger.info(f"用户{user_id}的积分账户已存在，跳过初始化")
                init_account_counter.labels(status="success").inc()
                return account

            account = self.account_dao.create(user_id, Decimal(str(settings.points.initial_balance)))
            self.transaction_dao.create(
                user_id=user_id,
                transaction_type="init",
                amount=Decimal(str(settings.points.initial_balance)),
                balance_before=Decimal("0.00"),
                balance_after=account.balance,
                remark="积分账户初始化",
            )
            logger.info(f"用户{user_id}的积分账户初始化成功，初始积分{account.balance}")
            init_account_counter.labels(status="success").inc()
            return account
        except Exception as e:
            logger.error(f"用户{user_id}的积分账户初始化失败：{e}")
            init_account_counter.labels(status="error").inc()
            raise e

    def get_balance(self, user_id: str) -> Decimal:
        """获取积分余额"""
        account = self.account_dao.get_by_user_id(user_id)
        if not account:
            logger.warning(f"用户{user_id}的积分账户不存在")
            return Decimal("0.00")
        return account.balance

    def validate_points(self, user_id: str) -> bool:
        """验证积分是否足够运行任务"""
        account = self.account_dao.get_by_user_id(user_id)
        if not account:
            logger.warning(f"用户{user_id}的积分账户不存在")
            return False

        if account.balance < 0:
            logger.warning(f"用户{user_id}的积分余额为负数，不允许运行任务")
            return False

        return True

    def deduct_points(self, user_id: str, duration: int) -> Decimal:
        """扣减积分（支持事务）"""
        try:
            account = self.account_dao.get_for_update(user_id)
            if not account:
                raise AccountNotFoundException(f"用户{user_id}的积分账户不存在")

            if account.balance < 0:
                raise InsufficientPointsException(f"用户{user_id}的积分余额为负数，不允许扣减")

            deducted_points = Decimal(str(duration))
            new_balance = account.balance - deducted_points

            balance_before = account.balance
            self.account_dao.update_with_lock(account, new_balance)
            self.transaction_dao.create(
                user_id=user_id,
                transaction_type="deduct",
                amount=-deducted_points,
                balance_before=balance_before,
                balance_after=new_balance,
                remark=f"任务运行扣减积分，运行时长{duration}秒",
            )

            logger.info(
                f"用户{user_id}扣减积分成功，扣减{deducted_points}积分，余额从{balance_before}变为{new_balance}"
            )
            return new_balance
        except Exception as e:
            logger.error(f"用户{user_id}扣减积分失败：{e}")
            raise e

    def add_points(
        self, user_id: str, points: Decimal, reference_id: str, remark: str
    ) -> Decimal:
        """增加积分（支持事务）"""
        try:
            account = self.account_dao.get_for_update(user_id)
            if not account:
                raise AccountNotFoundException(f"用户{user_id}的积分账户不存在")

            balance_before = account.balance
            new_balance = account.balance + points

            self.account_dao.update_with_lock(account, new_balance)
            self.transaction_dao.create(
                user_id=user_id,
                transaction_type="recharge",
                amount=points,
                balance_before=balance_before,
                balance_after=new_balance,
                reference_id=reference_id,
                remark=remark,
            )

            logger.info(
                f"用户{user_id}增加积分成功，增加{points}积分，余额从{balance_before}变为{new_balance}"
            )
            return new_balance
        except Exception as e:
            logger.error(f"用户{user_id}增加积分失败：{e}")
            raise e
