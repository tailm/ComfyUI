"""
Integration tests for User Data Isolation

Tests end-to-end data isolation scenarios.
"""

import pytest
import tempfile
import os
from datetime import datetime

from app.services.history_service import HistoryService
from app.services.workflow_service import WorkflowService
from app.services.asset_service import AssetService
from app.database.isolation_repository import PermissionError


class TestHistoryIsolation:
    """Test history data isolation."""

    @pytest.fixture
    def temp_db(self):
        """Create a temporary database for testing."""
        import sqlite3
        
        fd, db_path = tempfile.mkstemp(suffix='.db')
        os.close(fd)
        
        # Create tables
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                prompt TEXT,
                outputs TEXT,
                status TEXT,
                created_at DATETIME NOT NULL,
                updated_at DATETIME
            )
        ''')
        
        # Insert test data
        cursor.execute('''
            INSERT INTO history (prompt_id, user_id, prompt, outputs, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('prompt_1', 'user_a', '{}', '{}', '{}', datetime.now().isoformat()))
        
        cursor.execute('''
            INSERT INTO history (prompt_id, user_id, prompt, outputs, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', ('prompt_2', 'user_b', '{}', '{}', '{}', datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
        
        yield db_path
        
        # Cleanup
        os.unlink(db_path)

    def test_user_can_only_see_own_history(self, temp_db):
        """Test that user can only see their own history."""
        # User A should only see prompt_1
        service_a = HistoryService(user_id='user_a', is_admin=False)
        service_a.db_path = temp_db
        
        history_a = service_a.get_history()
        assert 'prompt_1' in history_a
        assert 'prompt_2' not in history_a
        
        # User B should only see prompt_2
        service_b = HistoryService(user_id='user_b', is_admin=False)
        service_b.db_path = temp_db
        
        history_b = service_b.get_history()
        assert 'prompt_2' in history_b
        assert 'prompt_1' not in history_b

    def test_admin_can_see_all_history(self, temp_db):
        """Test that admin can see all history."""
        service = HistoryService(user_id='admin', is_admin=True)
        service.db_path = temp_db
        
        history = service.get_history()
        assert 'prompt_1' in history
        assert 'prompt_2' in history

    def test_user_cannot_access_other_user_history(self, temp_db):
        """Test that user cannot access other user's history."""
        service = HistoryService(user_id='user_a', is_admin=False)
        service.db_path = temp_db
        
        # Should raise PermissionError
        with pytest.raises(PermissionError):
            service.get_history_by_prompt_id('prompt_2')

    def test_user_can_delete_own_history(self, temp_db):
        """Test that user can delete their own history."""
        service = HistoryService(user_id='user_a', is_admin=False)
        service.db_path = temp_db
        
        # Should succeed
        result = service.delete_history('prompt_1')
        assert result is True
        
        # Verify deletion
        history = service.get_history()
        assert 'prompt_1' not in history

    def test_user_cannot_delete_other_user_history(self, temp_db):
        """Test that user cannot delete other user's history."""
        service = HistoryService(user_id='user_a', is_admin=False)
        service.db_path = temp_db
        
        # Should raise PermissionError
        with pytest.raises(PermissionError):
            service.delete_history('prompt_2')


class TestWorkflowIsolation:
    """Test workflow data isolation."""

    @pytest.fixture
    def mock_session(self):
        """Create a mock database session."""
        from unittest.mock import Mock
        
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.execute = Mock()
        
        return session

    def test_workflow_auto_user_binding(self, mock_session):
        """Test that workflow is automatically bound to user."""
        from app.database.workflow_models import Workflow
        
        service = WorkflowService(
            session=mock_session,
            user_id='user_123',
            is_admin=False
        )
        
        # Mock the query to return None (no existing workflow)
        mock_result = Mock()
        mock_result.scalar_one_or_none = Mock(return_value=None)
        mock_session.execute.return_value = mock_result
        
        # Create workflow
        workflow = service.save_workflow(
            name='test_workflow',
            workflow_json={'nodes': []}
        )
        
        # Verify user_id was set
        assert hasattr(workflow, 'user_id')
        assert workflow.user_id == 'user_123'


class TestAssetIsolation:
    """Test asset data isolation."""

    @pytest.fixture
    def mock_session(self):
        """Create a mock database session."""
        from unittest.mock import Mock
        
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.execute = Mock()
        
        return session

    def test_asset_auto_owner_binding(self, mock_session):
        """Test that asset is automatically bound to owner."""
        from app.assets.database.models import AssetReference
        
        service = AssetService(
            session=mock_session,
            user_id='user_123',
            is_admin=False
        )
        
        # Create asset
        asset = service.create_asset({
            'name': 'test_asset.png',
            'asset_id': 'asset_123'
        })
        
        # Verify owner_id was set
        assert hasattr(asset, 'owner_id')
        assert asset.owner_id == 'user_123'


class TestMultiUserScenario:
    """Test multi-user scenarios."""

    @pytest.fixture
    def temp_db(self):
        """Create a temporary database for testing."""
        import sqlite3
        
        fd, db_path = tempfile.mkstemp(suffix='.db')
        os.close(fd)
        
        # Create tables
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt_id VARCHAR(36) NOT NULL,
                user_id VARCHAR(36) NOT NULL,
                prompt TEXT,
                outputs TEXT,
                status TEXT,
                created_at DATETIME NOT NULL,
                updated_at DATETIME
            )
        ''')
        
        # Insert data for multiple users
        for i in range(3):
            for j in range(5):
                cursor.execute('''
                    INSERT INTO history (prompt_id, user_id, prompt, outputs, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    f'prompt_{i}_{j}',
                    f'user_{i}',
                    '{}',
                    '{}',
                    '{"status_str": "success"}',
                    datetime.now().isoformat()
                ))
        
        conn.commit()
        conn.close()
        
        yield db_path
        
        # Cleanup
        os.unlink(db_path)

    def test_user_statistics_isolation(self, temp_db):
        """Test that user statistics are isolated."""
        # User 0 should have 5 executions
        service_0 = HistoryService(user_id='user_0', is_admin=False)
        service_0.db_path = temp_db
        
        stats_0 = service_0.get_user_statistics()
        assert stats_0['total_executions'] == 5
        
        # User 1 should have 5 executions
        service_1 = HistoryService(user_id='user_1', is_admin=False)
        service_1.db_path = temp_db
        
        stats_1 = service_1.get_user_statistics()
        assert stats_1['total_executions'] == 5
        
        # Admin should see all 15 executions
        service_admin = HistoryService(user_id='admin', is_admin=True)
        service_admin.db_path = temp_db
        
        stats_admin = service_admin.get_user_statistics()
        assert stats_admin['total_executions'] == 15

    def test_clear_user_history_isolation(self, temp_db):
        """Test that clearing history only affects the user's own data."""
        # Clear user_0's history
        service_0 = HistoryService(user_id='user_0', is_admin=False)
        service_0.db_path = temp_db
        
        count = service_0.clear_user_history()
        assert count == 5
        
        # Verify user_0's history is empty
        history_0 = service_0.get_history()
        assert len(history_0) == 0
        
        # Verify user_1's history is intact
        service_1 = HistoryService(user_id='user_1', is_admin=False)
        service_1.db_path = temp_db
        
        history_1 = service_1.get_history()
        assert len(history_1) == 5


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
