from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class NewsArticleResponse(BaseModel):
    """Response model for news articles"""
    id: int
    title: str
    summary: Optional[str] = None
    url: str
    image_url: Optional[str] = None
    source: str
    author: Optional[str] = None
    category: Optional[str] = None
    published_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


class NewsListResponse(BaseModel):
    """Response model for list of news articles"""
    articles: List[NewsArticleResponse]
    total: int
    page: int = 1
    per_page: int = 20