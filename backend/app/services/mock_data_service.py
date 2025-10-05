"""Mock data service for development and testing"""


class MockDataService:
    """Service for providing mock market data"""

    async def get_market_overview(self):
        """Get mock market overview"""
        return {
            "markets": [],
            "last_updated": "2025-09-30T00:00:00Z",
            "total_assets": 0,
            "gainers": [],
            "losers": []
        }

    async def get_all_markets(self, active_only: bool = True):
        """Get all mock markets"""
        return []

    async def get_market_data(self, symbol: str):
        """Get mock market data for a symbol"""
        return None