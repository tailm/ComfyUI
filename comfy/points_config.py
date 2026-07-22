import yaml
from pathlib import Path
from pydantic_settings import BaseSettings


class PointsConfig(BaseSettings):
    recharge_ratio: int = 100
    initial_balance: int = 100

    class Config:
        env_prefix = "POINTS_"


class CacheConfig(BaseSettings):
    balance_ttl: int = 300

    class Config:
        env_prefix = "CACHE_"


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

    class Config:
        env_prefix = "PAYMENT_"


class MonitoringConfig(BaseSettings):
    enabled: bool = True
    prometheus_port: int = 9090

    class Config:
        env_prefix = "MONITORING_"


def load_config():
    config_path = Path(__file__).parent.parent / "config" / "points_config.yaml"
    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as f:
            config_data = yaml.safe_load(f)
        return {
            "points": PointsConfig(**config_data.get("points", {})),
            "cache": CacheConfig(**config_data.get("cache", {})),
            "payment": PaymentConfig(**config_data.get("payment", {})),
            "monitoring": MonitoringConfig(**config_data.get("monitoring", {})),
        }
    else:
        return {
            "points": PointsConfig(),
            "cache": CacheConfig(),
            "payment": PaymentConfig(
                alipay=PaymentConfig.AlipayConfig(
                    app_id="", private_key="", public_key="", notify_url=""
                ),
                wechat=PaymentConfig.WechatConfig(
                    app_id="", mch_id="", api_key="", notify_url=""
                ),
            ),
            "monitoring": MonitoringConfig(),
        }


points_config = load_config()
