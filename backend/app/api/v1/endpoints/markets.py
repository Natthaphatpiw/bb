from typing import List
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.market_service import MarketService
from app.services.mock_data_service import MockDataService
from app.schemas.market import MarketOverviewResponse, MarketDataResponse
from app.core.config import settings

router = APIRouter()


@router.get("/overview", response_model=MarketOverviewResponse)
async def get_market_overview(
    db: Session = Depends(get_db),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Get overview of all tracked markets with current data"""
    try:
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            overview_data = await service.get_market_overview()
            return overview_data
        else:
            service = MarketService(db)
            overview_data = await service.get_market_overview()
            
            # Schedule background update if needed
            background_tasks.add_task(service.check_and_update_stale_data)
            
            return overview_data
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market overview: {str(e)}")


@router.get("/all", response_model=List[MarketDataResponse])
async def get_all_markets(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Get all market data entries"""
    try:
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            markets = await service.get_all_markets(active_only=active_only)
            return markets
        else:
            service = MarketService(db)
            markets = await service.get_all_markets(active_only=active_only)
            return markets
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch markets: {str(e)}")


@router.get("/{symbol}", response_model=MarketDataResponse)
async def get_market_data(
    symbol: str,
    db: Session = Depends(get_db)
):
    """Get detailed data for a specific market symbol"""
    try:
        if settings.USE_MOCK_DATA:
            service = MockDataService()
            market_data = await service.get_market_data(symbol.upper())
        else:
            service = MarketService(db)
            market_data = await service.get_market_data(symbol.upper())
        
        if not market_data:
            raise HTTPException(
                status_code=404, 
                detail=f"Market data not found for symbol: {symbol}"
            )
        
        return market_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch market data: {str(e)}")


@router.post("/refresh")
async def refresh_market_data(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Trigger refresh of all market data"""
    try:
        if not settings.USE_MOCK_DATA:
            service = MarketService(db)
            background_tasks.add_task(service.refresh_all_market_data)
        
        return {"message": "Market data refresh initiated"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh market data: {str(e)}")