# 积分系统与ComfyUI集成方案

## 一、集成架构概述

### 1.1 系统架构

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   ComfyUI前端   │────────▶│   ComfyUI后端   │────────▶│   积分服务      │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                            │                            │
       │                            │                            │
       ▼                            ▼                            ▼
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  - 积分余额显示 │         │  - 任务验证     │         │  - 积分验证     │
│  - 充值界面     │         │  - 积分扣减     │         │  - 积分扣减     │
│  - 任务提示     │         │  - 用户初始化   │         │  - 充值订单     │
│                 │         │                 │         │  - 支付回调     │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### 1.2 交互流程

#### 1.2.1 用户初始化流程
```
1. 用户首次访问ComfyUI
2. ComfyUI后端检测用户不存在
3. 调用积分服务初始化接口
4. 积分服务创建账户，初始100积分
5. 返回成功，用户可以正常使用
```

#### 1.2.2 任务执行流程
```
1. 用户在前端点击执行任务
2. 前端调用ComfyUI后端API
3. ComfyUI后端调用积分服务验证积分
4. 积分足够 → 允许执行 → 任务完成 → 扣减积分
5. 积分不足 → 拒绝执行 → 前端提示用户充值
```

#### 1.2.3 充值流程
```
1. 用户在前端点击充值
2. 前端调用积分服务创建充值订单
3. 积分服务返回支付链接
4. 用户跳转到支付页面完成支付
5. 支付平台回调积分服务
6. 积分服务增加用户积分
7. 前端轮询积分余额，显示最新余额
```

## 二、后端集成方案

### 2.1 ComfyUI后端集成

#### 2.1.1 添加积分服务客户端

在 `ComfyUI` 项目中创建积分服务客户端：

```python
# comfy_api/points_client.py
import requests
from typing import Dict, Any
from app.logger import logger

class PointsServiceClient:
    """积分服务客户端"""

    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url

    def init_account(self, user_id: str) -> Dict[str, Any]:
        """初始化积分账户"""
        try:
            response = requests.post(
                f"{self.base_url}/points-accounts/init",
                json={"userId": user_id},
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"初始化积分账户失败: {e}")
            raise

    def validate_points(self, user_id: str) -> Dict[str, Any]:
        """验证积分是否足够"""
        try:
            response = requests.post(
                f"{self.base_url}/points-accounts/validate",
                json={"userId": user_id},
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"验证积分失败: {e}")
            raise

    def deduct_points(self, user_id: str, duration: int) -> Dict[str, Any]:
        """扣减积分"""
        try:
            response = requests.post(
                f"{self.base_url}/points-accounts/deduct",
                json={"userId": user_id, "duration": duration},
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"扣减积分失败: {e}")
            raise

    def get_balance(self, user_id: str) -> Dict[str, Any]:
        """查询积分余额"""
        try:
            response = requests.get(
                f"{self.base_url}/points-accounts/{user_id}",
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"查询积分余额失败: {e}")
            raise

    def create_order(self, user_id: str, amount: float, payment_method: str) -> Dict[str, Any]:
        """创建充值订单"""
        try:
            response = requests.post(
                f"{self.base_url}/recharge-orders",
                json={
                    "userId": user_id,
                    "amount": amount,
                    "paymentMethod": payment_method
                },
                timeout=5
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"创建充值订单失败: {e}")
            raise


# 创建全局实例
points_client = PointsServiceClient()
```

#### 2.1.2 在任务执行前验证积分

修改 `ComfyUI` 的任务执行逻辑，在执行任务前验证积分：

```python
# comfy_execution/execution.py
from comfy_api.points_client import points_client
from app.logger import logger

class Execution:
    async def execute(self, *args, **kwargs):
        # 获取用户ID
        user_id = self.get_user_id()

        try:
            # 验证积分是否足够
            validate_result = points_client.validate_points(user_id)
            if not validate_result["allowed"]:
                logger.warning(f"用户{user_id}积分不足，拒绝执行任务")
                raise Exception("积分不足，请充值后重试")

            # 执行任务
            start_time = time.time()
            result = await super().execute(*args, **kwargs)
            end_time = time.time()

            # 计算任务运行时长
            duration = int(end_time - start_time)

            # 扣减积分
            try:
                points_client.deduct_points(user_id, duration)
                logger.info(f"用户{user_id}任务执行完成，扣减{duration}积分")
            except Exception as e:
                logger.error(f"扣减积分失败: {e}")

            return result
        except Exception as e:
            logger.error(f"任务执行失败: {e}")
            raise
```

#### 2.1.3 用户注册时初始化积分账户

在用户注册时调用积分服务初始化账户：

```python
# server/User.py
from comfy_api.points_client import points_client
from app.logger import logger

class UserManager:
    def create_user(self):
        """创建用户"""
        user_id = self.generate_user_id()

        # 初始化积分账户
        try:
            points_client.init_account(user_id)
            logger.info(f"用户{user_id}积分账户初始化成功")
        except Exception as e:
            logger.error(f"用户{user_id}积分账户初始化失败: {e}")

        return user_id
```

### 2.2 配置积分服务地址

在 `ComfyUI` 的配置文件中添加积分服务地址：

```yaml
# config/config.yaml
points_service:
  enabled: true
  base_url: http://localhost:8000
  timeout: 5
```

## 三、前端集成方案

### 3.1 创建积分服务API客户端

在 `ComfyUI_frontend` 中创建积分服务API客户端：

```typescript
// ComfyUI_frontend/src/scripts/pointsApi.ts
import type { Ref } from 'vue'

export interface PointsBalance {
  userId: string
  balance: number
  status: string
  createTime: string
  updateTime: string
}

export interface ValidatePointsResult {
  allowed: boolean
  balance: number
}

export interface DeductPointsResult {
  userId: string
  deductedPoints: number
  balance: number
}

export interface RechargeOrder {
  orderId: string
  amount: number
  points: number
  paymentMethod: string
  paymentUrl: string
  status: string
  createTime: string
}

export class PointsApi {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  async initAccount(userId: string): Promise<PointsBalance> {
    const res = await fetch(`${this.baseUrl}/points-accounts/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (res.status !== 200) {
      throw new Error(`Failed to init account: ${res.status}`)
    }
    return await res.json()
  }

  async validatePoints(userId: string): Promise<ValidatePointsResult> {
    const res = await fetch(`${this.baseUrl}/points-accounts/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })
    if (res.status !== 200) {
      throw new Error(`Failed to validate points: ${res.status}`)
    }
    return await res.json()
  }

  async getBalance(userId: string): Promise<PointsBalance> {
    const res = await fetch(`${this.baseUrl}/points-accounts/${userId}`)
    if (res.status !== 200) {
      throw new Error(`Failed to get balance: ${res.status}`)
    }
    return await res.json()
  }

  async createRechargeOrder(
    userId: string,
    amount: number,
    paymentMethod: 'alipay' | 'wechat'
  ): Promise<RechargeOrder> {
    const res = await fetch(`${this.baseUrl}/recharge-orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, paymentMethod })
    })
    if (res.status !== 200) {
      throw new Error(`Failed to create recharge order: ${res.status}`)
    }
    return await res.json()
  }
}

export const pointsApi = new PointsApi()
```

### 3.2 创建积分余额Store

使用 Pinia 创建积分余额状态管理：

```typescript
// ComfyUI_frontend/src/stores/pointsStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { pointsApi, type PointsBalance } from '@/scripts/pointsApi'
import { useUserStore } from './userStore'

export const usePointsStore = defineStore('points', () => {
  const balance = ref<number>(0)
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const userStore = useUserStore()
  const userId = computed(() => userStore.user?.id || '0')

  const formattedBalance = computed(() => {
    return balance.value.toFixed(2)
  })

  const isInsufficient = computed(() => {
    return balance.value < 0
  })

  async function fetchBalance() {
    if (!userId.value) return

    loading.value = true
    error.value = null

    try {
      const data = await pointsApi.getBalance(userId.value)
      balance.value = data.balance
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to fetch balance'
      console.error(error.value)
    } finally {
      loading.value = false
    }
  }

  function setBalance(newBalance: number) {
    balance.value = newBalance
  }

  return {
    balance,
    loading,
    error,
    formattedBalance,
    isInsufficient,
    fetchBalance,
    setBalance
  }
})
```

### 3.3 在任务执行前验证积分

修改任务执行逻辑，在执行前验证积分：

```typescript
// ComfyUI_frontend/src/platform/workflow/core/services/workflowService.ts
import { pointsApi } from '@/scripts/pointsApi'
import { usePointsStore } from '@/stores/pointsStore'

export class WorkflowService {
  async execute() {
    const pointsStore = usePointsStore()
    const userId = useUserStore().user?.id

    if (!userId) {
      throw new Error('User not found')
    }

    // 验证积分是否足够
    const validateResult = await pointsApi.validatePoints(userId)
    if (!validateResult.allowed) {
      throw new Error('积分不足，请充值后重试')
    }

    // 执行工作流
    const result = await super.execute()

    // 刷新积分余额
    await pointsStore.fetchBalance()

    return result
  }
}
```

### 3.4 创建积分余额显示组件

```vue
<!-- ComfyUI_frontend/src/components/PointsBalance.vue -->
<script setup lang="ts">
import { usePointsStore } from '@/stores/pointsStore'
import { computed, onMounted } from 'vue'

const pointsStore = usePointsStore()

const balanceClass = computed(() => {
  return {
    'text-green-500': pointsStore.balance >= 0,
    'text-red-500': pointsStore.balance < 0
  }
})

onMounted(() => {
  pointsStore.fetchBalance()
})
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-gray-600">积分余额:</span>
    <span v-if="pointsStore.loading" class="text-sm text-gray-400">加载中...</span>
    <span v-else :class="['text-sm font-medium', balanceClass]">
      {{ pointsStore.formattedBalance }}
    </span>
    <button
      @click="pointsStore.fetchBalance()"
      class="text-xs text-blue-500 hover:text-blue-600"
    >
      刷新
    </button>
  </div>
</template>
```

### 3.5 创建充值对话框组件

```vue
<!-- ComfyUI_frontend/src/components/RechargeDialog.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { pointsApi } from '@/scripts/pointsApi'
import { useUserStore } from '@/stores/userStore'
import { usePointsStore } from '@/stores/pointsStore'

const emit = defineEmits<{
  close: []
}>()

const userStore = useUserStore()
const pointsStore = usePointsStore()

const amount = ref<number>(10)
const paymentMethod = ref<'alipay' | 'wechat'>('alipay')
const loading = ref<boolean>(false)
const error = ref<string | null>(null)

const presets = [10, 50, 100, 200, 500]

async function handleRecharge() {
  if (!userStore.user?.id) {
    error.value = '用户未登录'
    return
  }

  loading.value = true
  error.value = null

  try {
    const order = await pointsApi.createRechargeOrder(
      userStore.user.id,
      amount.value,
      paymentMethod.value
    )

    // 跳转到支付页面
    window.location.href = order.paymentUrl
  } catch (e) {
    error.value = e instanceof Error ? e.message : '充值失败'
    console.error(error.value)
  } finally {
    loading.value = false
  }
}

function selectPreset(presetAmount: number) {
  amount.value = presetAmount
}
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">充值积分</h2>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">充值金额</label>
          <div class="flex gap-2 flex-wrap mb-2">
            <button
              v-for="preset in presets"
              :key="preset"
              @click="selectPreset(preset)"
              :class="[
                'px-4 py-2 rounded-lg border-2 transition-colors',
                amount === preset
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              ¥{{ preset }}
            </button>
          </div>
          <input
            v-model.number="amount"
            type="number"
            min="1"
            step="1"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="自定义金额"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">支付方式</label>
          <div class="flex gap-2">
            <button
              @click="paymentMethod = 'alipay'"
              :class="[
                'flex-1 px-4 py-3 rounded-lg border-2 transition-colors',
                paymentMethod === 'alipay'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <span class="text-blue-500 font-medium">支付宝</span>
            </button>
            <button
              @click="paymentMethod = 'wechat'"
              :class="[
                'flex-1 px-4 py-3 rounded-lg border-2 transition-colors',
                paymentMethod === 'wechat'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              ]"
            >
              <span class="text-green-500 font-medium">微信支付</span>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">充值金额</span>
            <span class="font-medium">¥{{ amount }}</span>
          </div>
          <div class="flex justify-between text-sm mt-2">
            <span class="text-gray-600">获得积分</span>
            <span class="font-medium text-blue-600">{{ amount * 1000 }}</span>
          </div>
        </div>

        <button
          @click="handleRecharge"
          :disabled="loading"
          class="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {{ loading ? '处理中...' : `支付 ¥${amount}` }}
        </button>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </div>
    </div>
  </div>
</template>
```

### 3.6 在主界面集成积分组件

```vue
<!-- ComfyUI_frontend/src/App.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import PointsBalance from '@/components/PointsBalance.vue'
import RechargeDialog from '@/components/RechargeDialog.vue'

const showRechargeDialog = ref(false)
</script>

<template>
  <div class="app">
    <header class="header">
      <div class="header-left">
        <h1>ComfyUI</h1>
      </div>
      <div class="header-right">
        <PointsBalance />
        <button @click="showRechargeDialog = true" class="recharge-button">
          充值
        </button>
      </div>
    </header>

    <main class="main">
      <!-- 主内容 -->
    </main>

    <RechargeDialog v-if="showRechargeDialog" @close="showRechargeDialog = false" />
  </div>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.recharge-button {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.recharge-button:hover {
  background: #2563eb;
}
</style>
```

## 四、部署方案

### 4.1 使用Docker Compose部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: points-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: points_service
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - points-network

  redis:
    image: redis:7.0
    container_name: points-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - points-network

  points-service:
    build: ./points_service
    container_name: points-service
    ports:
      - "8000:8000"
      - "9090:9090"
    volumes:
      - ./points_service/config.yaml:/app/config.yaml
      - ./points_service/logs:/app/logs
    depends_on:
      - mysql
      - redis
    networks:
      - points-network
    restart: unless-stopped

  comfyui:
    build: .
    container_name: comfyui
    ports:
      - "8188:8188"
    volumes:
      - ./models:/app/models
      - ./output:/app/output
      - ./input:/app/input
    environment:
      - POINTS_SERVICE_URL=http://points-service:8000
    depends_on:
      - points-service
    networks:
      - points-network
    restart: unless-stopped

volumes:
  mysql-data:
  redis-data:

networks:
  points-network:
    driver: bridge
```

### 4.2 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f points-service
docker-compose logs -f comfyui
```

## 五、测试方案

### 5.1 后端测试

```python
# tests/test_integration.py
import pytest
from comfy_api.points_client import PointsServiceClient

def test_points_service_integration():
    client = PointsServiceClient()

    # 测试初始化账户
    result = client.init_account("test_user")
    assert result["userId"] == "test_user"
    assert result["balance"] == 100.0

    # 测试验证积分
    result = client.validate_points("test_user")
    assert result["allowed"] is True

    # 测试扣减积分
    result = client.deduct_points("test_user", 10)
    assert result["balance"] == 90.0

    # 测试查询余额
    result = client.get_balance("test_user")
    assert result["balance"] == 90.0

    # 测试创建充值订单
    result = client.create_order("test_user", 10.0, "alipay")
    assert "orderId" in result
    assert result["amount"] == 10.0
    assert result["points"] == 10000.0
```

### 5.2 前端测试

```typescript
// ComfyUI_frontend/src/scripts/pointsApi.test.ts
import { describe, it, expect, vi } from 'vitest'
import { PointsApi } from './pointsApi'

describe('PointsApi', () => {
  it('should get balance', async () => {
    const api = new PointsApi()
    const balance = await api.getBalance('test_user')
    expect(balance.userId).toBe('test_user')
    expect(balance.balance).toBe(100.0)
  })

  it('should validate points', async () => {
    const api = new PointsApi()
    const result = await api.validatePoints('test_user')
    expect(result.allowed).toBe(true)
  })
})
```

## 六、监控方案

### 6.1 Prometheus监控

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'points_service'
    static_configs:
      - targets: ['points-service:9090']

  - job_name: 'comfyui'
    static_configs:
      - targets: ['comfyui:8188']
```

### 6.2 Grafana仪表板

创建Grafana仪表板，监控以下指标：

- 积分扣减QPS和响应时间
- 积分充值QPS和响应时间
- 积分余额查询QPS和响应时间
- 任务执行成功率
- 用户活跃度

## 七、注意事项

### 7.1 性能优化

1. **缓存优化**：积分余额使用Redis缓存，减少数据库查询
2. **异步处理**：积分扣减使用异步处理，不影响任务执行
3. **批量处理**：支持批量扣减积分，减少API调用

### 7.2 安全性

1. **身份验证**：所有API接口都需要身份验证
2. **签名验证**：支付回调必须验证签名
3. **金额校验**：充值金额必须与订单金额匹配

### 7.3 可靠性

1. **幂等性**：支付回调支持幂等性处理
2. **重试机制**：API调用失败时自动重试
3. **降级策略**：积分服务不可用时降级处理

### 7.4 兼容性

1. **配置化**：充值比例和透支规则支持配置化
2. **版本兼容**：API接口支持版本控制
3. **数据迁移**：支持存量数据迁移

## 八、总结

积分系统与ComfyUI的集成方案包括：

1. **后端集成**：在ComfyUI后端添加积分服务客户端，在任务执行前验证积分，任务完成后扣减积分
2. **前端集成**：创建积分余额显示组件和充值对话框组件，在任务执行前验证积分
3. **部署方案**：使用Docker Compose一键部署所有服务
4. **测试方案**：编写后端和前端测试用例
5. **监控方案**：使用Prometheus和Grafana监控关键指标

通过以上方案，可以实现积分系统与ComfyUI的无缝集成，为用户提供完整的积分管理功能。
