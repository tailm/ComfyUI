import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete, or_, and_, desc, asc
from sqlalchemy.sql import func

from .models import UserTemplate, User


class UserTemplateManager:
    """用户模板管理器"""
    
    def __init__(self, db_session_factory):
        """
        初始化用户模板管理器
        
        Args:
            db_session_factory: SQLAlchemy会话工厂
        """
        self.db_session_factory = db_session_factory
    
    def _get_db_session(self) -> Session:
        """获取数据库会话"""
        return self.db_session_factory()
    
    def create_template(self, user_id: str, name: str, workflow_data: str, 
                       description: str = None, category: str = None, 
                       tags: str = None, thumbnail: str = None, 
                       is_public: bool = False) -> Tuple[bool, str, Optional[UserTemplate]]:
        """
        创建用户模板
        
        Args:
            user_id: 用户ID
            name: 模板名称
            workflow_data: 工作流数据（JSON字符串）
            description: 模板描述（可选）
            category: 分类（可选）
            tags: 标签，逗号分隔（可选）
            thumbnail: 缩略图（可选）
            is_public: 是否公开（默认False）
            
        Returns:
            Tuple[是否成功, 错误信息, 模板对象]
        """
        # 验证输入
        if not name or not name.strip():
            return False, "模板名称不能为空", None
        
        if not workflow_data or not workflow_data.strip():
            return False, "工作流数据不能为空", None
        
        # 验证JSON格式
        try:
            json.loads(workflow_data)
        except json.JSONDecodeError:
            return False, "工作流数据必须是有效的JSON格式", None
        
        with self._get_db_session() as session:
            # 检查用户是否存在
            stmt = select(User).where(User.id == user_id, User.is_active == True)
            user = session.execute(stmt).scalar_one_or_none()
            
            if not user:
                return False, "用户不存在或已被禁用", None
            
            # 检查模板名称是否重复（同一用户下）
            stmt = select(UserTemplate).where(
                UserTemplate.user_id == user_id,
                UserTemplate.name == name
            )
            existing_template = session.execute(stmt).scalar_one_or_none()
            
            if existing_template:
                return False, "模板名称已存在", None
            
            # 创建模板
            template = UserTemplate(
                user_id=user_id,
                name=name.strip(),
                description=description.strip() if description else None,
                workflow_data=workflow_data,
                thumbnail=thumbnail,
                category=category.strip() if category else None,
                tags=tags.strip() if tags else None,
                is_public=is_public,
                is_favorite=False,
                view_count=0,
                use_count=0,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            session.add(template)
            session.commit()
            
            logging.info(f"模板创建成功: {name} (用户ID: {user_id})")
            return True, "模板创建成功", template
    
    def get_template(self, template_id: str, user_id: str = None) -> Optional[UserTemplate]:
        """
        获取模板
        
        Args:
            template_id: 模板ID
            user_id: 用户ID（可选，用于权限检查）
            
        Returns:
            模板对象或None
        """
        with self._get_db_session() as session:
            stmt = select(UserTemplate).where(UserTemplate.id == template_id)
            
            if user_id:
                # 用户只能获取自己的模板或公开模板
                stmt = stmt.where(
                    or_(
                        UserTemplate.user_id == user_id,
                        UserTemplate.is_public == True
                    )
                )
            
            return session.execute(stmt).scalar_one_or_none()
    
    def get_user_templates(self, user_id: str, include_public: bool = False, 
                          category: str = None, search: str = None, 
                          favorite_only: bool = False, 
                          page: int = 1, page_size: int = 20, 
                          sort_by: str = "updated_at", sort_order: str = "desc") -> Tuple[List[UserTemplate], int]:
        """
        获取用户模板列表
        
        Args:
            user_id: 用户ID
            include_public: 是否包含公开模板
            category: 按分类筛选（可选）
            search: 搜索关键词（可选）
            favorite_only: 是否只显示收藏的模板
            page: 页码（从1开始）
            page_size: 每页数量
            sort_by: 排序字段（name, created_at, updated_at, view_count, use_count）
            sort_order: 排序顺序（asc, desc）
            
        Returns:
            Tuple[模板列表, 总数量]
        """
        with self._get_db_session() as session:
            # 构建查询条件
            conditions = []
            
            if include_public:
                # 包含用户自己的模板和公开模板
                conditions.append(
                    or_(
                        UserTemplate.user_id == user_id,
                        UserTemplate.is_public == True
                    )
                )
            else:
                # 只包含用户自己的模板
                conditions.append(UserTemplate.user_id == user_id)
            
            # 分类筛选
            if category:
                conditions.append(UserTemplate.category == category)
            
            # 搜索关键词
            if search:
                search_pattern = f"%{search}%"
                conditions.append(
                    or_(
                        UserTemplate.name.ilike(search_pattern),
                        UserTemplate.description.ilike(search_pattern),
                        UserTemplate.tags.ilike(search_pattern)
                    )
                )
            
            # 收藏筛选
            if favorite_only:
                conditions.append(UserTemplate.is_favorite == True)
            
            # 构建查询
            query = select(UserTemplate).where(and_(*conditions))
            
            # 获取总数量
            count_query = select(func.count()).select_from(UserTemplate).where(and_(*conditions))
            total_count = session.execute(count_query).scalar()
            
            # 排序
            sort_column = {
                "name": UserTemplate.name,
                "created_at": UserTemplate.created_at,
                "updated_at": UserTemplate.updated_at,
                "view_count": UserTemplate.view_count,
                "use_count": UserTemplate.use_count
            }.get(sort_by, UserTemplate.updated_at)
            
            if sort_order.lower() == "asc":
                query = query.order_by(asc(sort_column))
            else:
                query = query.order_by(desc(sort_column))
            
            # 分页
            offset = (page - 1) * page_size
            query = query.offset(offset).limit(page_size)
            
            # 执行查询
            result = session.execute(query)
            templates = result.scalars().all()
            
            return templates, total_count
    
    def update_template(self, template_id: str, user_id: str, **kwargs) -> Tuple[bool, str, Optional[UserTemplate]]:
        """
        更新模板
        
        Args:
            template_id: 模板ID
            user_id: 用户ID
            **kwargs: 要更新的字段
            
        Returns:
            Tuple[是否成功, 错误信息, 更新后的模板对象]
        """
        allowed_fields = {
            "name", "description", "workflow_data", "thumbnail", 
            "category", "tags", "is_public", "is_favorite"
        }
        
        update_fields = {k: v for k, v in kwargs.items() if k in allowed_fields}
        
        if not update_fields:
            return False, "没有有效的更新字段", None
        
        # 验证工作流数据（如果提供）
        if "workflow_data" in update_fields:
            try:
                json.loads(update_fields["workflow_data"])
            except json.JSONDecodeError:
                return False, "工作流数据必须是有效的JSON格式", None
        
        with self._get_db_session() as session:
            # 获取模板
            stmt = select(UserTemplate).where(
                UserTemplate.id == template_id,
                UserTemplate.user_id == user_id  # 只能更新自己的模板
            )
            template = session.execute(stmt).scalar_one_or_none()
            
            if not template:
                return False, "模板不存在或没有权限", None
            
            # 检查名称是否重复（如果更新名称）
            if "name" in update_fields and update_fields["name"] != template.name:
                stmt = select(UserTemplate).where(
                    UserTemplate.user_id == user_id,
                    UserTemplate.name == update_fields["name"],
                    UserTemplate.id != template_id
                )
                existing_template = session.execute(stmt).scalar_one_or_none()
                
                if existing_template:
                    return False, "模板名称已存在", None
            
            # 更新字段
            for field, value in update_fields.items():
                if value is not None:
                    setattr(template, field, value)
            
            template.updated_at = datetime.now()
            session.commit()
            
            logging.info(f"模板更新成功: {template.name} (模板ID: {template_id})")
            return True, "模板更新成功", template
    
    def delete_template(self, template_id: str, user_id: str) -> Tuple[bool, str]:
        """
        删除模板
        
        Args:
            template_id: 模板ID
            user_id: 用户ID
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        with self._get_db_session() as session:
            # 获取模板
            stmt = select(UserTemplate).where(
                UserTemplate.id == template_id,
                UserTemplate.user_id == user_id  # 只能删除自己的模板
            )
            template = session.execute(stmt).scalar_one_or_none()
            
            if not template:
                return False, "模板不存在或没有权限"
            
            # 删除模板
            session.delete(template)
            session.commit()
            
            logging.info(f"模板删除成功: {template.name} (模板ID: {template_id})")
            return True, "模板删除成功"
    
    def increment_view_count(self, template_id: str) -> Tuple[bool, str]:
        """
        增加模板查看次数
        
        Args:
            template_id: 模板ID
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        with self._get_db_session() as session:
            stmt = update(UserTemplate).where(
                UserTemplate.id == template_id
            ).values(
                view_count=UserTemplate.view_count + 1
            )
            
            result = session.execute(stmt)
            session.commit()
            
            if result.rowcount == 0:
                return False, "模板不存在"
            
            return True, "查看次数已增加"
    
    def increment_use_count(self, template_id: str) -> Tuple[bool, str]:
        """
        增加模板使用次数
        
        Args:
            template_id: 模板ID
            
        Returns:
            Tuple[是否成功, 错误信息]
        """
        with self._get_db_session() as session:
            stmt = update(UserTemplate).where(
                UserTemplate.id == template_id
            ).values(
                use_count=UserTemplate.use_count + 1,
                updated_at=datetime.now()
            )
            
            result = session.execute(stmt)
            session.commit()
            
            if result.rowcount == 0:
                return False, "模板不存在"
            
            return True, "使用次数已增加"
    
    def toggle_favorite(self, template_id: str, user_id: str) -> Tuple[bool, str, Optional[bool]]:
        """
        切换模板收藏状态
        
        Args:
            template_id: 模板ID
            user_id: 用户ID
            
        Returns:
            Tuple[是否成功, 错误信息, 新的收藏状态]
        """
        with self._get_db_session() as session:
            # 获取模板
            stmt = select(UserTemplate).where(
                UserTemplate.id == template_id,
                UserTemplate.user_id == user_id  # 只能操作自己的模板
            )
            template = session.execute(stmt).scalar_one_or_none()
            
            if not template:
                return False, "模板不存在或没有权限", None
            
            # 切换收藏状态
            new_favorite_state = not template.is_favorite
            template.is_favorite = new_favorite_state
            template.updated_at = datetime.now()
            
            session.commit()
            
            logging.info(f"模板收藏状态切换: {template.name} -> {'收藏' if new_favorite_state else '取消收藏'}")
            return True, "收藏状态已更新", new_favorite_state
    
    def get_template_categories(self, user_id: str, include_public: bool = False) -> List[str]:
        """
        获取用户模板分类列表
        
        Args:
            user_id: 用户ID
            include_public: 是否包含公开模板
            
        Returns:
            分类列表
        """
        with self._get_db_session() as session:
            # 构建查询条件
            conditions = []
            
            if include_public:
                conditions.append(
                    or_(
                        UserTemplate.user_id == user_id,
                        UserTemplate.is_public == True
                    )
                )
            else:
                conditions.append(UserTemplate.user_id == user_id)
            
            # 排除空分类
            conditions.append(UserTemplate.category.isnot(None))
            
            # 查询不重复的分类
            query = select(UserTemplate.category).where(and_(*conditions)).distinct()
            result = session.execute(query)
            
            categories = [row[0] for row in result if row[0]]
            return sorted(categories)
    
    def get_popular_templates(self, limit: int = 10, days: int = 30) -> List[UserTemplate]:
        """
        获取热门模板
        
        Args:
            limit: 返回数量限制
            days: 统计天数
            
        Returns:
            热门模板列表
        """
        with self._get_db_session() as session:
            # 计算起始日期
            from_date = datetime.now() - datetime.timedelta(days=days)
            
            # 查询公开模板，按使用次数排序
            query = select(UserTemplate).where(
                UserTemplate.is_public == True,
                UserTemplate.created_at >= from_date
            ).order_by(
                desc(UserTemplate.use_count),
                desc(UserTemplate.view_count)
            ).limit(limit)
            
            result = session.execute(query)
            return result.scalars().all()
    
    def search_templates(self, query: str, user_id: str = None, 
                        category: str = None, is_public: bool = None,
                        page: int = 1, page_size: int = 20) -> Tuple[List[UserTemplate], int]:
        """
        搜索模板
        
        Args:
            query: 搜索关键词
            user_id: 用户ID（可选，用于权限过滤）
            category: 分类筛选（可选）
            is_public: 是否公开筛选（可选）
            page: 页码
            page_size: 每页数量
            
        Returns:
            Tuple[模板列表, 总数量]
        """
        if not query or not query.strip():
            return [], 0
        
        with self._get_db_session() as session:
            # 构建查询条件
            conditions = []
            search_pattern = f"%{query.strip()}%"
            
            # 搜索条件
            conditions.append(
                or_(
                    UserTemplate.name.ilike(search_pattern),
                    UserTemplate.description.ilike(search_pattern),
                    UserTemplate.tags.ilike(search_pattern)
                )
            )
            
            # 用户权限过滤
            if user_id:
                conditions.append(
                    or_(
                        UserTemplate.user_id == user_id,
                        UserTemplate.is_public == True
                    )
                )
            elif is_public is not None:
                conditions.append(UserTemplate.is_public == is_public)
            
            # 分类筛选
            if category:
                conditions.append(UserTemplate.category == category)
            
            # 构建查询
            query_stmt = select(UserTemplate).where(and_(*conditions))
            
            # 获取总数量
            count_query = select(func.count()).select_from(UserTemplate).where(and_(*conditions))
            total_count = session.execute(count_query).scalar()
            
            # 分页
            offset = (page - 1) * page_size
            query_stmt = query_stmt.offset(offset).limit(page_size)
            
            # 按相关性排序（先按名称匹配度，再按更新时间）
            query_stmt = query_stmt.order_by(
                desc(UserTemplate.name.ilike(search_pattern)),
                desc(UserTemplate.updated_at)
            )
            
            # 执行查询
            result = session.execute(query_stmt)
            templates = result.scalars().all()
            
            return templates, total_count
    
    def export_template(self, template_id: str, user_id: str = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        导出模板数据
        
        Args:
            template_id: 模板ID
            user_id: 用户ID（可选，用于权限检查）
            
        Returns:
            Tuple[是否成功, 错误信息, 模板数据]
        """
        template = self.get_template(template_id, user_id)
        
        if not template:
            return False, "模板不存在或没有权限", None
        
        # 构建导出数据
        export_data = {
            "id": template.id,
            "name": template.name,
            "description": template.description,
            "workflow_data": json.loads(template.workflow_data),
            "category": template.category,
            "tags": template.tags.split(",") if template.tags else [],
            "is_public": template.is_public,
            "created_at": template.created_at.isoformat(),
            "updated_at": template.updated_at.isoformat(),
            "view_count": template.view_count,
            "use_count": template.use_count,
            "is_favorite": template.is_favorite,
            "export_version": "1.0",
            "export_timestamp": datetime.now().isoformat()
        }
        
        return True, "导出成功", export_data
    
    def import_template(self, user_id: str, import_data: Dict) -> Tuple[bool, str, Optional[UserTemplate]]:
        """
        导入模板
        
        Args:
            user_id: 用户ID
            import_data: 导入数据
            
        Returns:
            Tuple[是否成功, 错误信息, 导入的模板对象]
        """
        # 验证导入数据
        required_fields = ["name", "workflow_data"]
        for field in required_fields:
            if field not in import_data:
                return False, f"缺少必要字段: {field}", None
        
        # 验证工作流数据
        try:
            if isinstance(import_data["workflow_data"], dict):
                workflow_data = json.dumps(import_data["workflow_data"])
            else:
                workflow_data = import_data["workflow_data"]
                json.loads(workflow_data)  # 验证JSON格式
        except (json.JSONDecodeError, TypeError):
            return False, "工作流数据必须是有效的JSON格式", None
        
        # 准备模板数据
        template_data = {
            "name": import_data["name"],
            "workflow_data": workflow_data,
            "description": import_data.get("description"),
            "category": import_data.get("category"),
            "tags": ",".join(import_data.get("tags", [])) if isinstance(import_data.get("tags"), list) else import_data.get("tags"),
            "is_public": import_data.get("is_public", False),
            "is_favorite": import_data.get("is_favorite", False)
        }
        
        # 创建模板
        return self.create_template(
            user_id=user_id,
            **template_data
        )