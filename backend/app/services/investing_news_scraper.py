import requests
from bs4 import BeautifulSoup
import json
from typing import List, Dict, Optional
import time
from urllib.parse import urljoin


class InvestingNewsScraper:
    """
    Scrapes news data from Investing.com crude oil news pages
    """

    def __init__(self):
        self.base_url = "https://www.investing.com"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def get_page_content(self, url: str) -> Optional[BeautifulSoup]:
        """
        Fetches webpage content and returns BeautifulSoup object
        """
        try:
            response = requests.get(url, headers=self.headers)
            response.raise_for_status()
            return BeautifulSoup(response.content, 'html.parser')
        except requests.RequestException as e:
            print(f"Error fetching {url}: {e}")
            return None

    def extract_article_data(self, article_elem) -> Optional[Dict]:
        """
        Extracts data from a single article element
        """
        try:
            # Extract title
            title_elem = article_elem.find('a', {'data-test': 'article-title-link'})
            title = title_elem.get_text(strip=True) if title_elem else 'No title'

            # Extract URL
            article_url = title_elem['href'] if title_elem else 'No URL'
            if article_url.startswith('/'):
                article_url = urljoin(self.base_url, article_url)

            # Extract description
            desc_elem = article_elem.find('p', {'data-test': 'article-description'})
            description = desc_elem.get_text(strip=True) if desc_elem else 'No description'

            # Extract provider/source
            provider_elem = article_elem.find('a', {'data-test': 'article-provider-link'})
            provider = provider_elem.get_text(strip=True) if provider_elem else 'Unknown'

            # Extract publish time
            time_elem = article_elem.find('time', {'data-test': 'article-publish-date'})
            publish_time = time_elem.get_text(strip=True) if time_elem else 'Unknown'
            if time_elem and 'datetime' in time_elem.attrs:
                datetime_str = time_elem['datetime']
            else:
                datetime_str = 'Unknown'

            # Extract image URL
            image_elem = None

            # Find figure element first, then look for image within it
            figure_elem = article_elem.find('figure')
            if figure_elem:
                # Look for img with data-test="item-image" within figure
                image_elem = figure_elem.find('img', {'data-test': 'item-image'})

                # If not found, try finding any img within the figure
                if not image_elem:
                    image_elem = figure_elem.find('img')

            # If still not found, try direct search within article
            if not image_elem:
                image_elem = article_elem.find('img', {'data-test': 'item-image'})

            image_url = image_elem['src'] if image_elem and 'src' in image_elem.attrs else 'No image'
            if image_url.startswith('//'):
                image_url = 'https:' + image_url
            elif image_url.startswith('/'):
                image_url = urljoin(self.base_url, image_url)

            return {
                'title': title,
                'url': article_url,
                'description': description,
                'provider': provider,
                'publish_time': publish_time,
                'datetime': datetime_str,
                'image_url': image_url
            }

        except Exception as e:
            print(f"Error extracting article data: {e}")
            return None

    def scrape_page(self, url: str) -> List[Dict]:
        """
        Scrapes all articles from a single page
        """
        print(f"Scraping: {url}")
        soup = self.get_page_content(url)
        if not soup:
            return []

        articles_data = []

        # Find all article containers
        article_containers = soup.find_all('article')

        for article in article_containers:
            article_data = self.extract_article_data(article)
            if article_data:
                articles_data.append(article_data)

        return articles_data

    def scrape_multiple_pages(self, base_url: str, pages: List[int]) -> List[Dict]:
        """
        Scrapes multiple pages and combines the results
        """
        all_articles = []

        for page_num in pages:
            if page_num == 1:
                url = base_url
            else:
                url = f"{base_url}/{page_num}"

            page_articles = self.scrape_page(url)
            all_articles.extend(page_articles)

            # Add delay between requests to be respectful
            if page_num < max(pages):
                time.sleep(2)

        return all_articles

    def save_to_json(self, articles: List[Dict], filename: str = 'investing_news_data.json'):
        """
        Saves articles data to JSON file
        """
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(articles, f, indent=2, ensure_ascii=False)
            print(f"Data saved to {filename}")
        except Exception as e:
            print(f"Error saving data: {e}")

    def scrape_oil_price_data(self, url: str = "https://www.investing.com/commodities/crude-oil-historical-data") -> List[Dict]:
        """
        Scrapes daily oil price data from historical data page
        """
        print(f"Scraping oil price data from: {url}")
        soup = self.get_page_content(url)
        if not soup:
            return []

        price_data = []

        # Find the historical data table - look for table with historical price data
        # Try to find table with class or specific attributes for historical data
        table = soup.find('table')

        # Look for table containing historical data
        all_tables = soup.find_all('table')

        # Try to find the right table by looking for tables with 7 columns (Date, Price, Open, High, Low, Vol, Change%)
        for tbl in all_tables:
            tbody = tbl.find('tbody')
            if tbody:
                first_row = tbody.find('tr')
                if first_row:
                    cells = first_row.find_all('td')
                    time_elem = first_row.find('time')
                    # Look for table with 7 columns and time element in first cell
                    if len(cells) >= 7 and time_elem:
                        table = tbl
                        break

        if not table:
            print("No suitable table found on the page")
            return []

        # Find all table rows (skip header)
        rows = table.find('tbody')
        if not rows:
            print("No tbody found in table")
            return []

        data_rows = rows.find_all('tr')

        for row in data_rows:
            try:
                cells = row.find_all('td')
                if len(cells) >= 7:  # Ensure we have all required columns

                    # Extract date
                    date_cell = cells[0].find('time')
                    date = date_cell.get_text(strip=True) if date_cell else 'Unknown'
                    datetime_attr = date_cell.get('datetime', 'Unknown') if date_cell else 'Unknown'

                    # Extract price data
                    price = cells[1].get_text(strip=True)
                    open_price = cells[2].get_text(strip=True)
                    high = cells[3].get_text(strip=True)
                    low = cells[4].get_text(strip=True)
                    volume = cells[5].get_text(strip=True)
                    change_percent = cells[6].get_text(strip=True)

                    price_data.append({
                        'date': date,
                        'datetime': datetime_attr,
                        'price': price,
                        'open': open_price,
                        'high': high,
                        'low': low,
                        'volume': volume,
                        'change_percent': change_percent
                    })

            except Exception as e:
                print(f"Error extracting price data from row: {e}")
                continue

        return price_data


def main():
    """
    Main function to scrape Investing.com crude oil news and price data
    """
    scraper = InvestingNewsScraper()

    # 1. Scrape news articles
    base_url = "https://www.investing.com/commodities/crude-oil-news"
    pages_to_scrape = [1, 2]  # Scrape first 2 pages

    print("Starting to scrape Investing.com crude oil news...")
    print(f"Pages to scrape: {pages_to_scrape}")

    # Scrape all articles
    all_articles = scraper.scrape_multiple_pages(base_url, pages_to_scrape)

    # Display news results
    if all_articles:
        print(f"\nSuccessfully scraped {len(all_articles)} articles")

        # Show first few articles as preview
        print("\nFirst 3 articles:")
        for i, article in enumerate(all_articles[:3], 1):
            print(f"\n{i}. {article['title']}")
            print(f"   Provider: {article['provider']}")
            print(f"   Time: {article['publish_time']}")
            print(f"   URL: {article['url']}")
            print(f"   Image: {article['image_url']}")

        # Save news to JSON file
        scraper.save_to_json(all_articles, 'investing_news_data.json')

        print(f"\nTotal articles scraped: {len(all_articles)}")
        print("News data has been saved to 'investing_news_data.json'")

    else:
        print("No articles found")

    print("\n" + "="*50)

    # 2. Scrape oil price data
    print("\nStarting to scrape oil price historical data...")

    price_data = scraper.scrape_oil_price_data()

    # Display price results
    if price_data:
        print(f"\nSuccessfully scraped {len(price_data)} days of price data")

        # Show first few price entries as preview
        print("\nFirst 5 price entries:")
        for i, price_entry in enumerate(price_data[:5], 1):
            print(f"\n{i}. {price_entry['date']}")
            print(f"   Price: {price_entry['price']}")
            print(f"   Open: {price_entry['open']}")
            print(f"   High: {price_entry['high']}")
            print(f"   Low: {price_entry['low']}")
            print(f"   Volume: {price_entry['volume']}")
            print(f"   Change: {price_entry['change_percent']}")

        # Save price data to JSON file
        scraper.save_to_json(price_data, 'oil_price_data.json')

        print(f"\nTotal price entries scraped: {len(price_data)}")
        print("Price data has been saved to 'oil_price_data.json'")

    else:
        print("No price data found")


if __name__ == "__main__":
    main()