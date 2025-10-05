from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.market_service import MarketService
from app.services.mock_data_service import MockDataService
from app.schemas.market import AssetDetailResponse, HistoricalDataResponse
from app.core.config import settings

router = APIRouter()


@router.get("/{symbol}", response_model=AssetDetailResponse)
async def get_asset_detail(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get comprehensive asset detail including chart data, news, and AI insights"""
    try:
        symbol = symbol.upper()
        
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            asset_detail = await service.get_asset_detail(symbol)
        else:
            service = MarketService(db)
            asset_detail = await service.get_asset_detail(symbol)
        
        if not asset_detail:
            raise HTTPException(
                status_code=404,
                detail=f"Asset not found: {symbol}"
            )
        
        return asset_detail
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch asset detail: {str(e)}")


@router.get("/{symbol}/chart", response_model=HistoricalDataResponse)
async def get_chart_data(
    symbol: str,
    range: str = Query("1D", regex="^(1D|1M|6M|1Y|5Y)$"),
    interval: Optional[str] = Query(None, regex="^(1m|5m|15m|1h|1d)$"),
    db: Session = Depends(get_db)
):
    """Get historical chart data for a specific symbol and time range"""
    try:
        symbol = symbol.upper()
        
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            chart_data = await service.get_chart_data(symbol, range, interval)
        else:
            service = MarketService(db)
            chart_data = await service.get_chart_data(symbol, range, interval)
        
        if not chart_data.data:
            raise HTTPException(
                status_code=404,
                detail=f"No chart data available for symbol: {symbol}"
            )
        
        return chart_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chart data: {str(e)}")


@router.get("/{symbol}/stats")
async def get_asset_statistics(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get statistical information for an asset"""
    try:
        symbol = symbol.upper()
        
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            stats = await service.get_asset_statistics(symbol)
        else:
            service = MarketService(db)
            stats = await service.get_asset_statistics(symbol)
        
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"Statistics not available for symbol: {symbol}"
            )
        
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch asset statistics: {str(e)}")