from prometheus_client import Counter, Histogram, start_http_server
from config import settings

# 定义指标
deduct_points_counter = Counter("points_deduct_total", "Total points deducted", ["status"])
deduct_points_duration = Histogram("points_deduct_duration_seconds", "Points deduct duration")

recharge_counter = Counter("points_recharge_total", "Total points recharged", ["status"])
recharge_duration = Histogram("points_recharge_duration_seconds", "Points recharge duration")

query_balance_counter = Counter("points_query_balance_total", "Total balance queries", ["status"])
query_balance_duration = Histogram("points_query_balance_duration_seconds", "Balance query duration")

init_account_counter = Counter("points_init_account_total", "Total accounts initialized", ["status"])


def start_metrics_server():
    if settings.monitoring.enabled:
        start_http_server(settings.monitoring.prometheus_port)


metrics = {
    "deduct_points_counter": deduct_points_counter,
    "deduct_points_duration": deduct_points_duration,
    "recharge_counter": recharge_counter,
    "recharge_duration": recharge_duration,
    "query_balance_counter": query_balance_counter,
    "query_balance_duration": query_balance_duration,
    "init_account_counter": init_account_counter,
}
