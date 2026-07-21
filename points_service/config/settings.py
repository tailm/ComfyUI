import yaml
from pathlib import Path
from pydantic_settings import BaseSettings


class DatabaseConfig(BaseSettings):
    type: str = "sqlite"
    path: str | None = None
    host: str | None = None
    port: int | None = None
    user: str | None = None
    password: str | None = None
    database: str | None = None
    pool_size: int = 10
    max_overflow: int = 20
    pool_timeout: int = 30
    pool_recycle: int = 3600

    @property
    def url(self) -> str:
        if self.type == "sqlite" and self.path:
            return f"sqlite:///{self.path}"
        elif self.type == "mysql" and self.host and self.port and self.user and self.password and self.database:
            return f"mysql+pymysql://{self.user}:{self.password}@{self.host}:{self.port}/{self.database}"
        else:
            raise ValueError("Invalid database configuration")


class RedisConfig(BaseSettings):
    host: str
    port: int
    db: int = 0
    password: str | None = None
    pool_size: int = 10
    socket_timeout: int = 5
    socket_connect_timeout: int = 5


class PointsConfig(BaseSettings):
    recharge_ratio: int = 1000
    initial_balance: int = 100


class CacheConfig(BaseSettings):
    balance_ttl: int = 300


class LoggingConfig(BaseSettings):
    level: str = "INFO"
    format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    file: str = "logs/points_service.log"
    max_bytes: int = 10485760  # 10MB
    backup_count: int = 5


class PaymentConfig(BaseSettings):
    class AlipayConfig(BaseSettings):
        app_id: str
        private_key: str
        public_key: str
        notify_url: str

    class WechatConfig(BaseSettings):
        app_id: str
        mch_id: str
        api_key: str
        notify_url: str

    alipay: AlipayConfig
    wechat: WechatConfig


class MonitoringConfig(BaseSettings):
    enabled: bool = True
    prometheus_port: int = 9090


class Settings(BaseSettings):
    database: DatabaseConfig
    redis: RedisConfig
    points: PointsConfig
    cache: CacheConfig
    logging: LoggingConfig
    payment: PaymentConfig
    monitoring: MonitoringConfig


def load_settings() -> Settings:
    config_path = Path(__file__).parent.parent / "config.yaml"
    with open(config_path, "r", encoding="utf-8") as f:
        config_data = yaml.safe_load(f)
    return Settings(**config_data)


settings = load_settings()
