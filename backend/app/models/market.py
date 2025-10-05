from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, Index
from sqlalchemy.sql import func
from app.core.database import Base


class MarketData(Base):
    """Market data model for storing current market information"""
    
    __tablename__ = "market_data"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Asset Information
    symbol = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    
    # Price Information
    price = Column(Float, nullable=False)
    change = Column(Float, default=0.0)
    change_percent = Column(Float, default=0.0)
    
    # OHLC Data
    open_price = Column(Float, nullable=True)
    high_price = Column(Float, nullable=True)
    low_price = Column(Float, nullable=True)
    prev_close = Column(Float, nullable=True)
    
    # Volume and Market Cap
    volume = Column(Float, default=0.0)
    market_cap = Column(Float, nullable=True)
    
    # 52-Week Range
    week_52_high = Column(Float, nullable=True)
    week_52_low = Column(Float, nullable=True)
    
    # Asset Metadata
    currency = Column(String(3), default="USD")
    asset_type = Column(String(20), default="commodity")  # commodity, currency, stock
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_trade_time = Column(DateTime(timezone=True), nullable=True)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_symbol_active', 'symbol', 'is_active'),
        Index('idx_asset_type', 'asset_type'),
        Index('idx_updated_at', 'updated_at'),
    )
    
    def __repr__(self):
        return f"<MarketData(symbol='{self.symbol}', price={self.price})>"


class HistoricalData(Base):
    """Historical market data model for storing OHLCV data"""
    
    __tablename__ = "historical_data"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Asset Reference
    symbol = Column(String(20), index=True, nullable=False)
    
    # Date
    date = Column(DateTime(timezone=True), nullable=False)
    
    # OHLCV Data
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)
    
    # Adjusted Close (for stocks)
    adj_close = Column(Float, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_symbol_date', 'symbol', 'date', unique=True),
        Index('idx_date', 'date'),
    )
    
    def __repr__(self):
        return f"<HistoricalData(symbol='{self.symbol}', date='{self.date}', close={self.close})>"


class NewsArticle(Base):
    """News articles related to market assets"""
    
    __tablename__ = "news_articles"
    
    # Primary Key
    id = Column(Integer, primary_key=True, index=True)
    
    # Article Information
    title = Column(String(500), nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    url = Column(String(1000), unique=True, nullable=False)
    image_url = Column(String(1000), nullable=True)
    
    # Source Information
    source = Column(String(100), nullable=False)
    author = Column(String(200), nullable=True)
    
    # Categorization
    category = Column(String(50), nullable=True)
    tags = Column(Text, nullable=True)  # JSON string
    
    # Related Symbols
    related_symbols = Column(Text, nullable=True)  # JSON string
    
    # Timestamps
    published_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_published_at', 'published_at'),
        Index('idx_source', 'source'),
        Index('idx_category', 'category'),
        Index('idx_active_published', 'is_active', 'published_at'),
    )
    
    def __repr__(self):
        return f"<NewsArticle(title='{self.title[:50]}...', source='{self.source}')>"