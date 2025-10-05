from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Index
from sqlalchemy.sql import func
from app.core.database import Base


class AIInsight(Base):
    """AI-generated market insights and forecasts"""
    
    __tablename__ = "ai_insights"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Asset Reference
    symbol = Column(String(20), index=True, nullable=False)
    
    # Insight Content
    summary = Column(Text, nullable=False)
    key_insights = Column(Text, nullable=False)  # JSON string
    forecasts = Column(Text, nullable=False)     # JSON string
    
    # Confidence and Quality Metrics
    confidence = Column(Float, default=0.5)
    model_version = Column(String(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=False)
    
    # Processing Information
    processing_time_ms = Column(Integer, nullable=True)
    token_count = Column(Integer, nullable=True)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_symbol_created', 'symbol', 'created_at'),
        Index('idx_expires_at', 'expires_at'),
        Index('idx_confidence', 'confidence'),
    )
    
    def __repr__(self):
        return f"<AIInsight(symbol='{self.symbol}', confidence={self.confidence})>"
    
    @property
    def is_expired(self) -> bool:
        """Check if the insight has expired"""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at