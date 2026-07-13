"""
智能调度器优化示例
为ComfyUI提供更高效的节点执行调度
"""

import asyncio
import time
import logging
from typing import Dict, List, Set, Tuple, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import threading
from collections import defaultdict, deque
import heapq

logger = logging.getLogger(__name__)

class NodeType(Enum):
    """节点类型枚举"""
    CPU_INTENSIVE = "cpu_intensive"  # CPU密集型
    GPU_INTENSIVE = "gpu_intensive"  # GPU密集型
    MEMORY_INTENSIVE = "memory_intensive"  # 内存密集型
    IO_INTENSIVE = "io_intensive"  # IO密集型
    MIXED = "mixed"  # 混合型

class ResourceType(Enum):
    """资源类型枚举"""
    CPU = "cpu"
    GPU = "gpu"
    MEMORY = "memory"
    IO = "io"

@dataclass
class NodeProfile:
    """节点性能特征"""
    node_id: str
    node_type: str
    estimated_duration: float = 0.0  # 预计执行时间（秒）
    memory_usage: int = 0  # 内存使用量（字节）
    gpu_memory_usage: int = 0  # GPU内存使用量（字节）
    cpu_usage: float = 0.0  # CPU使用率（0-1）
    dependencies: List[str] = field(default_factory=list)  # 依赖的节点ID
    resource_requirements: Set[ResourceType] = field(default_factory=set)  # 资源需求
    
    def __post_init__(self):
        # 根据节点类型设置默认资源需求
        if not self.resource_requirements:
            if "clip" in self.node_type.lower() or "encode" in self.node_type.lower():
                self.resource_requirements = {ResourceType.CPU}
            elif "sampler" in self.node_type.lower() or "model" in self.node_type.lower():
                self.resource_requirements = {ResourceType.GPU, ResourceType.MEMORY}
            elif "load" in self.node_type.lower() or "save" in self.node_type.lower():
                self.resource_requirements = {ResourceType.IO}
            else:
                self.resource_requirements = {ResourceType.CPU, ResourceType.MEMORY}

@dataclass
class ExecutionResult:
    """执行结果"""
    node_id: str
    success: bool
    duration: float
    start_time: float
    end_time: float
    error: Optional[str] = None
    output: Any = None

@dataclass
class ResourceStatus:
    """资源状态"""
    cpu_usage: float = 0.0  # CPU使用率（0-1）
    gpu_usage: float = 0.0  # GPU使用率（0-1）
    memory_usage: float = 0.0  # 内存使用率（0-1）
    gpu_memory_usage: float = 0.0  # GPU内存使用率（0-1）
    io_busy: bool = False  # IO是否繁忙
    
    def can_allocate(self, requirements: Set[ResourceType]) -> bool:
        """检查是否可以分配资源"""
        if ResourceType.CPU in requirements and self.cpu_usage > 0.8:
            return False
        if ResourceType.GPU in requirements and self.gpu_usage > 0.8:
            return False
        if ResourceType.MEMORY in requirements and self.memory_usage > 0.8:
            return False
        if ResourceType.IO in requirements and self.io_busy:
            return False
        return True
    
    def allocate(self, requirements: Set[ResourceType], duration: float = 1.0):
        """分配资源（模拟）"""
        # 在实际实现中，这里会更新资源状态
        # 这里简化处理，只记录日志
        logger.debug(f"Allocating resources {requirements} for {duration:.2f}s")

class SmartScheduler:
    """
    智能调度器
    优化节点执行顺序，提高资源利用率
    """
    
    def __init__(self, max_workers: int = 4):
        self.max_workers = max_workers
        self.node_profiles: Dict[str, NodeProfile] = {}
        self.execution_history: Dict[str, List[ExecutionResult]] = defaultdict(list)
        self.resource_status = ResourceStatus()
        self.lock = threading.RLock()
        
        # 执行队列
        self.ready_queue = []  # 就绪节点（优先队列）
        self.running_nodes: Set[str] = set()  # 正在执行的节点
        self.completed_nodes: Set[str] = set()  # 已完成的节点
        self.failed_nodes: Set[str] = set()  # 失败的节点
        
        # 性能统计
        self.stats = {
            "total_nodes": 0,
            "completed_nodes": 0,
            "failed_nodes": 0,
            "total_duration": 0.0,
            "avg_duration": 0.0,
            "cpu_utilization": 0.0,
            "gpu_utilization": 0.0,
            "parallelism": 0.0,
        }
        
        # 工作线程池
        self.executor = None
        self.is_running = False
        
        logger.info(f"SmartScheduler initialized with {max_workers} workers")
    
    def add_node(self, node_id: str, node_type: str, dependencies: List[str] = None):
        """添加节点到调度器"""
        with self.lock:
            profile = NodeProfile(
                node_id=node_id,
                node_type=node_type,
                dependencies=dependencies or []
            )
            self.node_profiles[node_id] = profile
            self.stats["total_nodes"] += 1
            logger.debug(f"Added node: {node_id} ({node_type})")
    
    def update_node_profile(self, node_id: str, **kwargs):
        """更新节点性能特征"""
        with self.lock:
            if node_id in self.node_profiles:
                for key, value in kwargs.items():
                    if hasattr(self.node_profiles[node_id], key):
                        setattr(self.node_profiles[node_id], key, value)
                logger.debug(f"Updated profile for node: {node_id}")
    
    def _calculate_priority(self, node_id: str) -> float:
        """计算节点优先级"""
        profile = self.node_profiles[node_id]
        
        # 基础优先级：依赖数量少的优先
        base_priority = 1.0 / (len(profile.dependencies) + 1)
        
        # 资源需求权重：GPU密集型任务优先级较高
        resource_weight = 1.0
        if ResourceType.GPU in profile.resource_requirements:
            resource_weight = 1.5
        elif ResourceType.IO in profile.resource_requirements:
            resource_weight = 0.8  # IO任务优先级较低
        
        # 历史执行时间：执行时间短的优先
        time_weight = 1.0
        if node_id in self.execution_history:
            avg_duration = sum(r.duration for r in self.execution_history[node_id]) / len(self.execution_history[node_id])
            time_weight = 1.0 / (avg_duration + 0.1)  # 避免除零
        
        # 最终优先级
        priority = base_priority * resource_weight * time_weight
        
        # 添加随机扰动，避免饥饿
        import random
        priority += random.uniform(-0.01, 0.01)
        
        return priority
    
    def _get_ready_nodes(self) -> List[Tuple[float, str]]:
        """获取就绪节点列表（按优先级排序）"""
        ready_nodes = []
        
        for node_id, profile in self.node_profiles.items():
            # 跳过已执行或正在执行的节点
            if (node_id in self.completed_nodes or 
                node_id in self.failed_nodes or 
                node_id in self.running_nodes):
                continue
            
            # 检查依赖是否都已完成
            dependencies_met = all(
                dep in self.completed_nodes 
                for dep in profile.dependencies
            )
            
            if dependencies_met:
                # 计算优先级
                priority = self._calculate_priority(node_id)
                heapq.heappush(ready_nodes, (-priority, node_id))  # 使用负值实现最大堆
        
        return ready_nodes
    
    def _can_execute(self, node_id: str) -> bool:
        """检查节点是否可以执行"""
        profile = self.node_profiles[node_id]
        
        # 检查资源是否可用
        if not self.resource_status.can_allocate(profile.resource_requirements):
            return False
        
        # 检查依赖是否都已完成
        if not all(dep in self.completed_nodes for dep in profile.dependencies):
            return False
        
        # 检查是否正在执行或已完成
        if (node_id in self.running_nodes or 
            node_id in self.completed_nodes or 
            node_id in self.failed_nodes):
            return False
        
        return True
    
    async def execute_node(self, node_id: str) -> ExecutionResult:
        """执行单个节点"""
        profile = self.node_profiles[node_id]
        start_time = time.time()
        
        logger.info(f"Executing node: {node_id} ({profile.node_type})")
        
        try:
            # 模拟执行（在实际实现中，这里会调用实际的节点执行逻辑）
            await asyncio.sleep(profile.estimated_duration)
            
            # 模拟资源使用
            self.resource_status.allocate(profile.resource_requirements, profile.estimated_duration)
            
            end_time = time.time()
            duration = end_time - start_time
            
            result = ExecutionResult(
                node_id=node_id,
                success=True,
                duration=duration,
                start_time=start_time,
                end_time=end_time,
                output=f"Result of {node_id}"
            )
            
            logger.debug(f"Node {node_id} completed in {duration:.2f}s")
            
        except Exception as e:
            end_time = time.time()
            duration = end_time - start_time
            
            result = ExecutionResult(
                node_id=node_id,
                success=False,
                duration=duration,
                start_time=start_time,
                end_time=end_time,
                error=str(e)
            )
            
            logger.error(f"Node {node_id} failed: {e}")
        
        return result
    
    async def _worker(self, worker_id: int):
        """工作线程"""
        logger.debug(f"Worker {worker_id} started")
        
        while self.is_running:
            with self.lock:
                # 获取可执行的节点
                ready_nodes = self._get_ready_nodes()
                if not ready_nodes:
                    # 没有就绪节点，等待
                    await asyncio.sleep(0.1)
                    continue
                
                # 找到第一个可执行的节点
                executable_node = None
                while ready_nodes:
                    _, node_id = heapq.heappop(ready_nodes)
                    if self._can_execute(node_id):
                        executable_node = node_id
                        break
                
                if not executable_node:
                    # 没有可执行的节点，等待
                    await asyncio.sleep(0.1)
                    continue
                
                # 标记为正在执行
                self.running_nodes.add(executable_node)
            
            # 执行节点
            result = await self.execute_node(executable_node)
            
            with self.lock:
                # 更新状态
                self.running_nodes.remove(executable_node)
                
                if result.success:
                    self.completed_nodes.add(executable_node)
                    self.stats["completed_nodes"] += 1
                else:
                    self.failed_nodes.add(executable_node)
                    self.stats["failed_nodes"] += 1
                
                # 记录执行历史
                self.execution_history[executable_node].append(result)
                
                # 更新统计
                self.stats["total_duration"] += result.duration
                self.stats["avg_duration"] = (
                    self.stats["total_duration"] / 
                    (self.stats["completed_nodes"] + self.stats["failed_nodes"])
                    if (self.stats["completed_nodes"] + self.stats["failed_nodes"]) > 0 
                    else 0
                )
                
                # 更新资源状态（简化）
                # 在实际实现中，这里需要根据实际资源使用更新
                
                logger.debug(f"Worker {worker_id} completed node: {executable_node}")
        
        logger.debug(f"Worker {worker_id} stopped")
    
    async def schedule(self, timeout: float = 60.0) -> bool:
        """
        调度执行所有节点
        Returns:
            bool: 是否所有节点都成功执行
        """
        self.is_running = True
        start_time = time.time()
        
        logger.info(f"Starting scheduler with {self.max_workers} workers")
        
        # 创建工作线程
        workers = [
            asyncio.create_task(self._worker(i))
            for i in range(self.max_workers)
        ]
        
        try:
            # 等待所有节点完成或超时
            while self.is_running:
                with self.lock:
                    completed = len(self.completed_nodes) + len(self.failed_nodes)
                    total = len(self.node_profiles)
                    
                    if completed >= total:
                        logger.info(f"All nodes completed: {completed}/{total}")
                        break
                    
                    # 检查超时
                    if time.time() - start_time > timeout:
                        logger.warning(f"Scheduler timeout after {timeout}s")
                        break
                    
                    # 打印进度
                    if completed % max(1, total // 10) == 0:  # 每10%打印一次
                        logger.info(f"Progress: {completed}/{total} nodes completed")
                
                await asyncio.sleep(0.5)
        
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
            return False
        
        finally:
            # 停止工作线程
            self.is_running = False
            if workers:
                await asyncio.gather(*workers, return_exceptions=True)
        
        # 计算最终统计
        with self.lock:
            total_time = time.time() - start_time
            self.stats["parallelism"] = (
                self.stats["total_duration"] / total_time 
                if total_time > 0 
                else 0
            )
            
            success = len(self.failed_nodes) == 0
            if success:
                logger.info(f"Scheduler completed successfully in {total_time:.2f}s")
            else:
                logger.warning(f"Scheduler completed with {len(self.failed_nodes)} failures in {total_time:.2f}s")
            
            return success
    
    def get_execution_plan(self) -> List[List[str]]:
        """获取执行计划（按阶段分组）"""
        with self.lock:
            # 使用拓扑排序生成执行阶段
            indegree = {node_id: 0 for node_id in self.node_profiles}
            graph = {node_id: [] for node_id in self.node_profiles}
            
            # 构建图
            for node_id, profile in self.node_profiles.items():
                for dep in profile.dependencies:
                    if dep in graph:
                        graph[dep].append(node_id)
                        indegree[node_id] += 1
            
            # 拓扑排序
            execution_plan = []
            queue = deque([node_id for node_id, deg in indegree.items() if deg == 0])
            
            while queue:
                level_size = len(queue)
                current_level = []
                
                for _ in range(level_size):
                    node_id = queue.popleft()
                    current_level.append(node_id)
                    
                    # 减少后继节点的入度
                    for neighbor in graph[node_id]:
                        indegree[neighbor] -= 1
                        if indegree[neighbor] == 0:
                            queue.append(neighbor)
                
                execution_plan.append(current_level)
            
            return execution_plan
    
    def get_stats(self) -> Dict:
        """获取调度器统计信息"""
        with self.lock:
            stats = self.stats.copy()
            stats.update({
                "total_nodes": len(self.node_profiles),
                "completed_nodes": len(self.completed_nodes),
                "failed_nodes": len(self.failed_nodes),
                "running_nodes": len(self.running_nodes),
                "pending_nodes": len(self.node_profiles) - len(self.completed_nodes) - len(self.failed_nodes) - len(self.running_nodes),
                "success_rate": len(self.completed_nodes) / len(self.node_profiles) if len(self.node_profiles) > 0 else 0,
            })
            return stats
    
    def print_stats(self):
        """打印统计信息"""
        stats = self.get_stats()
        execution_plan = self.get_execution_plan()
        
        logger.info("=" * 60)
        logger.info("Smart Scheduler Statistics:")
        logger.info(f"  Total nodes: {stats['total_nodes']}")
        logger.info(f"  Completed: {stats['completed_nodes']}")
        logger.info(f"  Failed: {stats['failed_nodes']}")
        logger.info(f"  Running: {stats['running_nodes']}")
        logger.info(f"  Pending: {stats['pending_nodes']}")
        logger.info(f"  Success rate: {stats['success_rate']:.2%}")
        logger.info(f"  Total duration: {stats['total_duration']:.2f}s")
        logger.info(f"  Average duration: {stats['avg_duration']:.2f}s")
        logger.info(f"  Parallelism: {stats['parallelism']:.2f}")
        logger.info(f"  Execution stages: {len(execution_plan)}")
        
        for i, stage in enumerate(execution_plan):
            logger.info(f"  Stage {i+1}: {len(stage)} nodes")
            if len(stage) <= 5:  # 只显示前5个节点
                for node_id in stage:
                    profile = self.node_profiles[node_id]
                    logger.info(f"    - {node_id} ({profile.node_type})")
        
        logger.info("=" * 60)

# 集成到ComfyUI的示例
def integrate_with_comfyui_execution():
    """
    将智能调度器集成到ComfyUI执行引擎的示例
    """
    import execution
    
    # 创建全局调度器实例
    scheduler = SmartScheduler(max_workers=4)
    
    # 包装原有的执行逻辑
    original_execute = execution.PromptExecutor.execute
    
    async def enhanced_execute(self, *args, **kwargs):
        """增强的执行函数"""
        # 分析工作流，构建节点图
        prompt = args[0] if args else kwargs.get('prompt', {})
        
        # 提取节点信息
        nodes = prompt.get('nodes', {})
        
        # 添加到调度器
        for node_id, node_info in nodes.items():
            node_type = node_info.get('class_type', 'unknown')
            dependencies = node_info.get('dependencies', [])
            scheduler.add_node(node_id, node_type, dependencies)
        
        # 获取执行计划
        execution_plan = scheduler.get_execution_plan()
        logger.info(f"Execution plan: {len(execution_plan)} stages")
        
        # 使用智能调度器执行
        success = await scheduler.schedule()
        
        if success:
            logger.info("Workflow execution completed successfully")
        else:
            logger.error("Workflow execution failed")
        
        # 打印统计信息
        scheduler.print_stats()
        
        # 调用原有执行逻辑（如果需要）
        # return await original_execute(self, *args, **kwargs)
        
        # 返回模拟结果
        return {"success": success, "stats": scheduler.get_stats()}
    
    # 替换原有执行函数
    execution.PromptExecutor.execute = enhanced_execute
    
    logger.info("Smart scheduler integrated with ComfyUI execution engine")

# 使用示例
async def test_scheduler():
    """测试调度器"""
    # 配置日志
    logging.basicConfig(level=logging.INFO)
    
    # 创建调度器
    scheduler = SmartScheduler(max_workers=2)
    
    # 添加测试节点（模拟ComfyUI工作流）
    # 阶段1：加载模型
    scheduler.add_node("load_model", "LoadCheckpoint", [])
    scheduler.add_node("load_clip", "CLIPLoader", [])
    scheduler.add_node("load_vae", "VAELoader", [])
    
    # 阶段2：文本编码（依赖模型加载）
    scheduler.add_node("encode_pos", "CLIPTextEncode", ["load_clip"])
    scheduler.add_node("encode_neg", "CLIPTextEncode", ["load_clip"])
    
    # 阶段3：潜在空间生成（依赖文本编码）
    scheduler.add_node("ksampler", "KSampler", ["load_model", "encode_pos", "encode_neg"])
    
    # 阶段4：VAE解码（依赖潜在空间）
    scheduler.add_node("vae_decode", "VAEDecode", ["ksampler", "load_vae"])
    
    # 阶段5：图像处理（依赖解码结果）
    scheduler.add_node("upscale", "ImageUpscale", ["vae_decode"])
    scheduler.add_node("save", "SaveImage", ["vae_decode"])
    
    # 设置节点执行时间估计
    scheduler.update_node_profile("load_model", estimated_duration=2.0)
    scheduler.update_node_profile("load_clip", estimated_duration=1.0)
    scheduler.update_node_profile("load_vae", estimated_duration=1.5)
    scheduler.update_node_profile("encode_pos", estimated_duration=0.5)
    scheduler.update_node_profile("encode_neg", estimated_duration=0.5)
    scheduler.update_node_profile("ksampler", estimated_duration=3.0)
    scheduler.update_node_profile("vae_decode", estimated_duration=1.0)
    scheduler.update_node_profile("upscale", estimated_duration=1.5)
    scheduler.update_node_profile("save", estimated_duration=0.2)
    
    # 打印执行计划
    execution_plan = scheduler.get_execution_plan()
    print("\nExecution Plan:")
    for i, stage in enumerate(execution_plan):
        print(f"Stage {i+1}: {stage}")
    
    # 执行调度
    print("\nStarting execution...")
    success = await scheduler.schedule(timeout=30.0)
    
    # 打印结果
    print(f"\nExecution {'successful' if success else 'failed'}")
    scheduler.print_stats()

if __name__ == "__main__":
    # 运行测试
    asyncio.run(test_scheduler())