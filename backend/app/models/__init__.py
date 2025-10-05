# Import all models to make them available
from app.models.market import MarketData, HistoricalData
from app.models.ai_insights import AIInsight
from app.models.user import User

__all__ = [
    "MarketData",
    "HistoricalData", 
    "AIInsight",
    "User"
]