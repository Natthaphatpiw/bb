import requests
from datetime import datetime, timedelta
from typing import Dict
import json
import os
from pathlib import Path


class NewsAPIService:
    """
    Service for fetching news from NewsAPI.org
    Caches results to JSON files to save API quota
    """

    def __init__(self):
        self.api_key = "5d135ca2344c42b39c03f8b5ad1487f6"
        self.base_url = "https://newsapi.org/v2/everything"
        # Create cache directory
        self.cache_dir = Path(__file__).parent.parent.parent / "news_cache"
        self.cache_dir.mkdir(exist_ok=True)

    def _get_cache_filename(self, query: str, days_back: int) -> Path:
        """Generate cache filename based on query and date"""
        safe_query = query.replace(' ', '_').replace('/', '_')
        today = datetime.now().strftime('%Y-%m-%d')
        return self.cache_dir / f"{safe_query}_{today}_{days_back}days.json"

    def _load_from_cache(self, cache_file: Path) -> Dict:
        """Load news from cache file if it exists and is recent"""
        if cache_file.exists():
            try:
                with open(cache_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Check if cache is from today
                    cached_date = data.get('cached_at', '')
                    if cached_date.startswith(datetime.now().strftime('%Y-%m-%d')):
                        print(f"✓ Loading news from cache: {cache_file.name}")
                        return data
            except Exception as e:
                print(f"Error loading cache: {e}")
        return None

    def _save_to_cache(self, cache_file: Path, data: Dict):
        """Save news data to cache file"""
        try:
            data['cached_at'] = datetime.now().isoformat()
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"✓ Saved news to cache: {cache_file.name}")
        except Exception as e:
            print(f"Error saving cache: {e}")

    def get_news_for_market(
        self,
        query: str,
        days_back: int = 7,
        page: int = 1,
        page_size: int = 20,
        language: str = "en",
        use_cache: bool = True
    ) -> Dict:
        """
        Fetch news articles for a specific market/query

        Args:
            query: Search query (e.g., "Crude Oil", "Gold", "Bitcoin")
            days_back: Number of days to look back for news
            page: Page number for pagination
            page_size: Number of articles per page
            language: Language code (default: "en")
            use_cache: Whether to use cached data (default: True)

        Returns:
            Dict with articles and metadata
        """
        if not self.api_key:
            raise ValueError("NEWS_API_KEY environment variable is not set")

        # Check cache first
        cache_file = self._get_cache_filename(query, days_back)
        if use_cache and page == 1:  # Only use cache for first page
            cached_data = self._load_from_cache(cache_file)
            if cached_data:
                # Return paginated results from cache
                start_idx = 0
                end_idx = page_size
                return {
                    'articles': cached_data['articles'][start_idx:end_idx],
                    'total_results': len(cached_data['articles']),
                    'page': page,
                    'page_size': page_size
                }

        # Calculate date range
        today = datetime.now()
        from_date = (today - timedelta(days=days_back)).strftime('%Y-%m-%d')
        to_date = today.strftime('%Y-%m-%d')

        print(f"กำลังดึงข่าว '{query}' จาก API ตั้งแต่ {from_date} ถึง {to_date}")

        # Prepare request parameters
        params = {
            'q': query,
            'from': from_date,
            'to': to_date,
            'language': language,
            'sortBy': 'publishedAt',
            'page': page,
            'pageSize': page_size,
            'apiKey': self.api_key
        }

        try:
            response = requests.get(self.base_url, params=params, timeout=10)
            response.raise_for_status()

            data = response.json()

            # Extract and format articles
            articles = []
            for article in data.get('articles', []):
                articles.append({
                    'source_name': article.get('source', {}).get('name', 'Unknown'),
                    'title': article.get('title', ''),
                    'description': article.get('description', ''),
                    'url': article.get('url', ''),
                    'image_url': article.get('urlToImage'),
                    'published_date': article.get('publishedAt', ''),
                    'content': article.get('content', ''),
                    'author': article.get('author')
                })

            result = {
                'articles': articles,
                'total_results': data.get('totalResults', 0),
                'page': page,
                'page_size': page_size
            }

            # Save to cache if first page
            if page == 1:
                self._save_to_cache(cache_file, result)

            print(f"✓ ดึงข้าวสำเร็จ! พบทั้งหมด {len(articles)} บทความ")

            return result

        except requests.exceptions.RequestException as e:
            print(f"Error fetching news: {e}")
            raise Exception(f"Failed to fetch news from NewsAPI: {str(e)}")


# Market symbol to query mapping
MARKET_QUERIES = {
    'CL=F': 'Crude Oil',
    'GC=F': 'Gold'
}


def get_query_for_symbol(symbol: str) -> str:
    """Get the news query string for a given market symbol"""
    return MARKET_QUERIES.get(symbol, symbol)