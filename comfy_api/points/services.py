from decimal import Decimal
from datetime import datetime
from typing import Optional
import uuid
import logging

from sqlalchemy import select
from app.database.db import create_session
from app.database.points.models import PointsAccount, RechargeOrder, PointsTransaction

from comfy_api.points.exceptions import (
    InsufficientPointsException,
    AccountNotFoundException,
    OrderNotFoundException,
    InvalidSignatureException,
    InvalidAmountException,
)

from comfy.points_config import points_config

logger = logging.getLogger(__name__)


class PointsAccountService:
    def __init__(self):
        self.session = create_session()

    def init_account(self, user_id: str) -> PointsAccount:
        """初始化积分账户（支持幂等）"""
        try:
            account = self.session.scalar(
                select(PointsAccount).where(PointsAccount.user_id == user_id)
            )
            if account:
                logger.info(f"用户{user_id}的积分账户已存在，跳过初始化")
                return account

            account = PointsAccount(
                user_id=user_id, balance=Decimal(str(points_config["points"].initial_balance))
            )
            self.session.add(account)
            self.session.commit()
            self.session.refresh(account)

            # 记录积分变动
            transaction = PointsTransaction(
                user_id=user_id,
                transaction_type="init",
                amount=Decimal(str(points_config["points"].initial_balance)),
                balance_before=Decimal("0.00"),
                balance_after=account.balance,
                remark="积分账户初始化",
            )
            self.session.add(transaction)
            self.session.commit()

            logger.info(f"用户{user_id}的积分账户初始化成功，初始积分{account.balance}")
            return account
        except Exception as e:
            logger.error(f"用户{user_id}的积分账户初始化失败：{e}")
            self.session.rollback()
            raise e
        finally:
            self.session.close()

    def get_balance(self, user_id: str) -> Decimal:
        """获取积分余额"""
        account = self.session.scalar(
            select(PointsAccount).where(PointsAccount.user_id == user_id)
        )
        if not account:
            logger.warning(f"用户{user_id}的积分账户不存在")
            return Decimal("0.00")
        return account.balance

    def validate_points(self, user_id: str) -> bool:
        """验证积分是否足够运行任务"""
        account = self.session.scalar(
            select(PointsAccount).where(PointsAccount.user_id == user_id)
        )
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
            account = self.session.scalar(
                select(PointsAccount)
                .where(PointsAccount.user_id == user_id)
                .with_for_update()
            )
            if not account:
                raise AccountNotFoundException(f"用户{user_id}的积分账户不存在")

            if account.balance < 0:
                raise InsufficientPointsException(f"用户{user_id}的积分余额为负数，不允许扣减")

            deducted_points = Decimal(str(duration))
            new_balance = account.balance - deducted_points

            balance_before = account.balance
            account.balance = new_balance
            account.version += 1

            # 记录积分变动
            transaction = PointsTransaction(
                user_id=user_id,
                transaction_type="deduct",
                amount=-deducted_points,
                balance_before=balance_before,
                balance_after=new_balance,
                remark=f"任务运行扣减积分，运行时长{duration}秒",
            )
            self.session.add(transaction)

            self.session.commit()
            self.session.refresh(account)

            logger.info(
                f"用户{user_id}扣减积分成功，扣减{deducted_points}积分，余额从{balance_before}变为{new_balance}"
            )
            return new_balance
        except Exception as e:
            logger.error(f"用户{user_id}扣减积分失败：{e}")
            self.session.rollback()
            raise e
        finally:
            self.session.close()

    def add_points(
        self, user_id: str, points: Decimal, reference_id: str, remark: str
    ) -> Decimal:
        """增加积分（支持事务）"""
        try:
            account = self.session.scalar(
                select(PointsAccount)
                .where(PointsAccount.user_id == user_id)
                .with_for_update()
            )
            if not account:
                raise AccountNotFoundException(f"用户{user_id}的积分账户不存在")

            balance_before = account.balance
            new_balance = account.balance + points

            account.balance = new_balance

            # 记录积分变动
            transaction = PointsTransaction(
                user_id=user_id,
                transaction_type="recharge",
                amount=points,
                balance_before=balance_before,
                balance_after=new_balance,
                reference_id=reference_id,
                remark=remark,
            )
            self.session.add(transaction)

            self.session.commit()
            self.session.refresh(account)

            logger.info(
                f"用户{user_id}增加积分成功，增加{points}积分，余额从{balance_before}变为{new_balance}"
            )
            return new_balance
        except Exception as e:
            logger.error(f"用户{user_id}增加积分失败：{e}")
            self.session.rollback()
            raise e
        finally:
            self.session.close()


class RechargeOrderService:
    def __init__(self):
        self.session = create_session()

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
            order = RechargeOrder(
                order_id=order_id,
                user_id=user_id,
                amount=amount,
                points=points,
                payment_method=payment_method,
                payment_url=payment_url,
                status="pending",
            )
            self.session.add(order)
            self.session.commit()
            self.session.refresh(order)

            logger.info(
                f"用户{user_id}创建充值订单成功，订单号{order_id}，充值金额{amount}元，充值积分{points}"
            )
            return order
        except Exception as e:
            logger.error(f"用户{user_id}创建充值订单失败：{e}")
            self.session.rollback()
            raise e
        finally:
            self.session.close()

    def get_order(self, order_id: str) -> Optional[RechargeOrder]:
        """查询订单信息"""
        order = self.session.scalar(
            select(RechargeOrder).where(RechargeOrder.order_id == order_id)
        )
        return order

    def update_order_status(self, order_id: str, status: str) -> bool:
        """更新订单状态"""
        try:
            order = self.session.scalar(
                select(RechargeOrder).where(RechargeOrder.order_id == order_id)
            )
            if not order:
                return False
            order.status = status
            self.session.commit()
            self.session.refresh(order)
            return True
        except Exception as e:
            logger.error(f"更新订单{order_id}状态失败：{e}")
            self.session.rollback()
            return False
        finally:
            self.session.close()

    def calculate_points(self, amount: Decimal) -> Decimal:
        """计算充值积分（按预设档位）"""
        special_prices = {
            Decimal("9.9"): Decimal("1000"),
            Decimal("19.9"): Decimal("3000"),
            Decimal("49.9"): Decimal("10000"),
            Decimal("99.9"): Decimal("25000"),
            Decimal("199"): Decimal("50000"),
            Decimal("1"): Decimal("100"),
        }
        if amount in special_prices:
            return special_prices[amount]
        return amount * Decimal(str(points_config["points"].recharge_ratio))

    def generate_order_id(self) -> str:
        """生成订单号"""
        return f"RCH{uuid.uuid4().hex[:20].upper()}"

    def mock_create_payment_order(
        self, order_id: str, amount: Decimal, payment_method: str
    ) -> str:
        """模拟创建支付订单"""
        # 这里应该调用真实的支付服务SDK
        # 返回模拟的支付链接
        return f"https://payment.example.com/pay?order_id={order_id}&amount={amount}&method={payment_method}"


class PaymentCallbackService:
    def __init__(self):
        self.session = create_session()

    def handle_callback(
        self, order_id: str, payment_amount: Decimal, payment_method: str, signature: str
    ) -> bool:
        """处理支付回调"""
        try:
            # 验证签名
            if not self.verify_signature(signature, order_id, payment_amount, payment_method):
                raise InvalidSignatureException("签名验证失败")

            # 查询订单
            order = self.session.scalar(
                select(RechargeOrder).where(RechargeOrder.order_id == order_id)
            )
            if not order:
                raise OrderNotFoundException(f"订单{order_id}不存在")

            # 校验金额
            if order.amount != payment_amount:
                raise InvalidAmountException(
                    f"订单金额不匹配，订单金额{order.amount}，支付金额{payment_amount}"
                )

            # 幂等性处理
            if order.status == "paid":
                logger.info(f"订单{order_id}已支付，跳过处理")
                return True

            # 处理支付成功
            return self.process_payment_success(order)
        except Exception as e:
            logger.error(f"处理支付回调失败：{e}")
            self.session.rollback()
            raise e
        finally:
            self.session.close()

    def verify_signature(
        self, signature: str, order_id: str, payment_amount: Decimal, payment_method: str
    ) -> bool:
        """验证签名"""
        # 这里应该调用真实的支付SDK验证签名
        # 模拟签名验证
        return True

    def process_payment_success(self, order: RechargeOrder) -> bool:
        """处理支付成功逻辑"""
        try:
            account_service = PointsAccountService()

            # 增加用户积分
            account_service.add_points(
                user_id=order.user_id,
                points=order.points,
                reference_id=order.order_id,
                remark=f"充值订单{order.order_id}支付成功",
            )

            # 更新订单状态
            order.status = "paid"
            order.payment_time = datetime.now()

            self.session.commit()
            self.session.refresh(order)

            logger.info(f"订单{order.order_id}支付成功，用户{order.user_id}增加{order.points}积分")
            return True
        except Exception as e:
            logger.error(f"处理订单{order.order_id}支付成功失败：{e}")
            self.session.rollback()
            raise e
