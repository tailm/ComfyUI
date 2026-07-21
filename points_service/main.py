from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from utils import init_db, start_metrics_server, logger
from controllers import points_account_router, recharge_order_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    logger.info("积分服务启动中...")
    init_db()
    start_metrics_server()
    logger.info("积分服务启动完成")
    yield
    # 关闭时执行
    logger.info("积分服务关闭中...")


app = FastAPI(
    title="积分服务",
    description="积分管理系统，提供积分账户管理、任务运行积分扣减、积分充值和积分余额查询功能",
    version="1.0.0",
    lifespan=lifespan,
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(points_account_router)
app.include_router(recharge_order_router)


@app.get("/")
async def root():
    return {"message": "积分服务运行中"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
