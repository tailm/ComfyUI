class PointsServiceException(Exception):
    """积分服务基础异常"""

    pass


class InsufficientPointsException(PointsServiceException):
    """积分不足异常"""

    pass


class AccountNotFoundException(PointsServiceException):
    """账户不存在异常"""

    pass


class OrderNotFoundException(PointsServiceException):
    """订单不存在异常"""

    pass


class OrderStatusException(PointsServiceException):
    """订单状态异常"""

    pass


class InvalidSignatureException(PointsServiceException):
    """签名验证失败异常"""

    pass


class InvalidAmountException(PointsServiceException):
    """金额异常"""

    pass
