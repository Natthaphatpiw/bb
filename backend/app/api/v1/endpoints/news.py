from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.news_api_service import NewsAPIService, get_query_for_symbol
from app.schemas.news import NewsListResponse, NewsArticleResponse


router = APIRouter()
news_service = NewsAPIService()


@router.get("/{symbol}", response_model=NewsListResponse)
async def get_news_for_symbol(
    symbol: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(5, ge=1, le=100, description="Items per page"),
    days_back: int = Query(7, ge=1, le=30, description="Days to look back")
):
    """
    Get news articles for a specific market symbol

    - **symbol**: Market symbol (e.g., CL=F for Crude Oil)
    - **page**: Page number (default: 1)
    - **page_size**: Number of articles per page (default: 5)
    - **days_back**: Number of days to look back (default: 7)
    """
    try:
        # Get appropriate query for the symbol
        query = get_query_for_symbol(symbol.upper())

        # Fetch news from NewsAPI
        result = news_service.get_news_for_market(
            query=query,
            days_back=days_back,
            page=page,
            page_size=page_size
        )

        # Format response
        articles = [
            NewsArticleResponse(
                id=idx,
                title=article['title'],
                summary=article['description'],
                url=article['url'],
                image_url=article['image_url'],
                source=article['source_name'],
                author=article.get('author'),
                category='market_news',
                published_at=article['published_date'],
                created_at=article['published_date']
            )
            for idx, article in enumerate(result['articles'], start=(page - 1) * page_size + 1)
        ]

        return NewsListResponse(
            articles=articles,
            total=result['total_results'],
            page=page,
            per_page=page_size
        )

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch news for {symbol}: {str(e)}"
        )


@router.get("/search")
async def search_news(
    q: str = Query(..., description="Search query"),
    page: int = Query(1, ge=1),
    page_size: int = Query(5, ge=1, le=100)
):
    """
    Search news articles by custom query

    - **q**: Search query string
    - **page**: Page number
    - **page_size**: Number of articles per page
    """
    try:
        result = news_service.get_news_for_market(
            query=q,
            days_back=7,
            page=page,
            page_size=page_size
        )

        articles = [
            NewsArticleResponse(
                id=idx,
                title=article['title'],
                summary=article['description'],
                url=article['url'],
                image_url=article['image_url'],
                source=article['source_name'],
                author=article.get('author'),
                category='market_news',
                published_at=article['published_date'],
                created_at=article['published_date']
            )
            for idx, article in enumerate(result['articles'], start=(page - 1) * page_size + 1)
        ]

        return NewsListResponse(
            articles=articles,
            total=result['total_results'],
            page=page,
            per_page=page_size
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search news: {str(e)}"
        )