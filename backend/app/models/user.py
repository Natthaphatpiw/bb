from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    """User model for authentication and preferences"""
    
    __tablename__ = "users"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # User Information
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    
    # Preferences
    preferred_currency = Column(String(3), default="USD")
    timezone = Column(String(50), default="UTC")
    notification_settings = Column(Text, nullable=True)  # JSON string
    
    # Subscription
    subscription_tier = Column(String(20), default="free")  # free, premium, enterprise
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Watchlist
    watchlist = Column(Text, nullable=True)  # JSON string of symbols
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    def __repr__(self):
        return f"<User(email='{self.email}', tier='{self.subscription_tier}')>"