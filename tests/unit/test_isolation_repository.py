"""
Unit tests for DataIsolationRepository

Tests the core data isolation functionality.
"""

import pytest
from unittest.mock import Mock, MagicMock
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.isolation_repository import (
    DataIsolationRepository,
    PermissionError
)
from app.assets.database.models import AssetReference


@pytest.fixture
def db_session():
    """Create an in-memory database session for testing."""
    engine = create_engine('sqlite:///:memory:')
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def mock_model():
    """Create a mock model class."""
    class MockModel:
        def __init__(self, **kwargs):
            for key, value in kwargs.items():
                setattr(self, key, value)
        
        id = None
        user_id = None
        name = None
    
    return MockModel


class TestDataIsolationRepository:
    """Test cases for DataIsolationRepository."""

    def test_init(self, db_session, mock_model):
        """Test repository initialization."""
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        assert repo.session == db_session
        assert repo.model_class == mock_model
        assert repo.user_id == 'user_123'
        assert repo.is_admin is False

    def test_get_user_id_column_with_user_id(self, db_session, mock_model):
        """Test detecting user_id column."""
        mock_model.user_id = 'test'
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123'
        )
        
        column = repo._get_user_id_column()
        assert column == 'user_id'

    def test_get_user_id_column_with_owner_id(self, db_session, mock_model):
        """Test detecting owner_id column."""
        # Remove user_id, add owner_id
        if hasattr(mock_model, 'user_id'):
            delattr(mock_model, 'user_id')
        mock_model.owner_id = 'test'
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123'
        )
        
        column = repo._get_user_id_column()
        assert column == 'owner_id'

    def test_get_user_id_column_none(self, db_session, mock_model):
        """Test when no user ID column exists."""
        # Remove both columns
        if hasattr(mock_model, 'user_id'):
            delattr(mock_model, 'user_id')
        if hasattr(mock_model, 'owner_id'):
            delattr(mock_model, 'owner_id')
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123'
        )
        
        column = repo._get_user_id_column()
        assert column is None

    def test_create_with_user_auto_binding(self, db_session, mock_model):
        """Test automatic user_id binding on create."""
        # Mock the session methods
        db_session.add = Mock()
        db_session.commit = Mock()
        db_session.refresh = Mock()
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        # Create with user binding
        data = {'name': 'test'}
        instance = repo.create_with_user(data)
        
        # Verify user_id was set
        assert hasattr(instance, 'user_id')
        assert instance.user_id == 'user_123'

    def test_create_with_user_explicit_user_id(self, db_session, mock_model):
        """Test that explicit user_id is preserved."""
        # Mock the session methods
        db_session.add = Mock()
        db_session.commit = Mock()
        db_session.refresh = Mock()
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        # Create with explicit user_id
        data = {'name': 'test', 'user_id': 'user_456'}
        instance = repo.create_with_user(data)
        
        # Verify explicit user_id was preserved
        assert instance.user_id == 'user_456'

    def test_permission_error_on_unauthorized_access(self, db_session, mock_model):
        """Test that PermissionError is raised for unauthorized access."""
        # Create a mock instance owned by another user
        mock_instance = mock_model(
            id='test_id',
            user_id='user_456',
            name='test'
        )
        
        # Mock the query
        db_session.execute = Mock()
        mock_result = Mock()
        mock_result.scalar_one_or_none = Mock(return_value=mock_instance)
        db_session.execute.return_value = mock_result
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        # Should raise PermissionError
        with pytest.raises(PermissionError):
            repo.get_by_id_with_check('test_id')

    def test_admin_can_access_any_record(self, db_session, mock_model):
        """Test that admin can access any record."""
        # Create a mock instance owned by another user
        mock_instance = mock_model(
            id='test_id',
            user_id='user_456',
            name='test'
        )
        
        # Mock the query
        db_session.execute = Mock()
        mock_result = Mock()
        mock_result.scalar_one_or_none = Mock(return_value=mock_instance)
        db_session.execute.return_value = mock_result
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=True  # Admin
        )
        
        # Should not raise PermissionError
        result = repo.get_by_id_with_check('test_id')
        assert result == mock_instance

    def test_user_can_access_own_record(self, db_session, mock_model):
        """Test that user can access their own record."""
        # Create a mock instance owned by the user
        mock_instance = mock_model(
            id='test_id',
            user_id='user_123',
            name='test'
        )
        
        # Mock the query
        db_session.execute = Mock()
        mock_result = Mock()
        mock_result.scalar_one_or_none = Mock(return_value=mock_instance)
        db_session.execute.return_value = mock_result
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        # Should not raise PermissionError
        result = repo.get_by_id_with_check('test_id')
        assert result == mock_instance

    def test_value_error_on_not_found(self, db_session, mock_model):
        """Test that ValueError is raised when record not found."""
        # Mock the query to return None
        db_session.execute = Mock()
        mock_result = Mock()
        mock_result.scalar_one_or_none = Mock(return_value=None)
        db_session.execute.return_value = mock_result
        
        repo = DataIsolationRepository(
            session=db_session,
            model_class=mock_model,
            user_id='user_123',
            is_admin=False
        )
        
        # Should raise ValueError
        with pytest.raises(ValueError, match="Record not found"):
            repo.get_by_id_with_check('nonexistent_id')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
