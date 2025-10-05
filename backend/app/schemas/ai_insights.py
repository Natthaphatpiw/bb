from typing import List
from datetime import datetime
from pydantic import BaseModel, Field


class ForecastResponse(BaseModel):
    """Individual forecast prediction"""
    period: str
    target: float
    confidence: int = Field(..., ge=0, le=100)
    direction: str = Field(..., pattern="^(bullish|bearish|neutral)$")


class AIInsightBase(BaseModel):
    symbol: str
    summary: str
    key_insights: List[str]
    forecasts: List[ForecastResponse]
    confidence: float = Field(..., ge=0.0, le=1.0)


class AIInsightResponse(AIInsightBase):
    """Response model for AI insights"""
    id: int
    generated_at: datetime = Field(alias="created_at")
    expires_at: datetime
    model_version: str = None
    processing_time_ms: int = None
    
    class Config:
        from_attributes = True
        populate_by_name = True