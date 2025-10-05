from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Base schemas
class MarketDataBase(BaseModel):
    symbol: str
    name: str
    price: float
    change: float = 0.0
    change_percent: float = 0.0
    currency: str = "USD"
    asset_type: str = "commodity"


class MarketDataCreate(MarketDataBase):
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    prev_close: Optional[float] = None
    volume: Optional[float] = 0.0
    market_cap: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None


class MarketDataUpdate(BaseModel):
    price: Optional[float] = None
    change: Optional[float] = None
    change_percent: Optional[float] = None
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    volume: Optional[float] = None
    last_trade_time: Optional[datetime] = None


class MarketDataResponse(MarketDataBase):
    """Response model for market data"""
    id: int
    open_price: Optional[float] = None
    high_price: Optional[float] = None
    low_price: Optional[float] = None
    prev_close: Optional[float] = None
    volume: Optional[float] = None
    market_cap: Optional[float] = None
    week_52_high: Optional[float] = None
    week_52_low: Optional[float] = None
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_trade_time: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class ChartDataPoint(BaseModel):
    """Individual data point for charts"""
    timestamp: str
    date: str
    price: float
    volume: Optional[float] = None
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    close: Optional[float] = None


class HistoricalDataResponse(BaseModel):
    """Response model for historical data"""
    symbol: str
    data: List[ChartDataPoint]
    time_range: str
    total_points: int


class MarketOverviewResponse(BaseModel):
    """Response model for market overview"""
    markets: List[MarketDataResponse]
    last_updated: datetime
    total_assets: int = Field(..., description="Total number of assets")
    gainers: int = Field(..., description="Number of assets with positive change")
    losers: int = Field(..., description="Number of assets with negative change")


class AssetDetailResponse(MarketDataResponse):
    """Extended response for asset detail page"""
    chart_data: List[ChartDataPoint] = Field(default_factory=list)
    related_news: List['NewsArticleResponse'] = Field(default_factory=list)
    ai_insights: Optional['AIInsightResponse'] = None
    
    class Config:
        from_attributes = True


# Forward reference resolution
from app.schemas.news import NewsArticleResponse
from app.schemas.ai_insights import AIInsightResponse

AssetDetailResponse.model_rebuild()