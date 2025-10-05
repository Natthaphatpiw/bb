from fastapi import APIRouter

from app.api.v1.endpoints import markets, assets, news
from app.api.v1.endpoints import ai, mob

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(markets.router, prefix="/markets", tags=["markets"])
api_router.include_router(assets.router, prefix="/assets", tags=["assets"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai-insights"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(mob.router, prefix="/mob", tags=["market-opportunity-briefing"])