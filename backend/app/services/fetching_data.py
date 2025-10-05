import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json
from typing import List, Dict, Optional

ticker = "CLW00"


def get_data(ticker):
    url = f"https://www.google.com/finance/quote/{ticker}:NYMEX?hl=en&window=1M"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    return soup


def scrape_news_data(soup: BeautifulSoup) -> List[Dict]:
    """
    Scrapes news data from Google Finance page including:
    - News source
    - Days ago
    - News content
    - News URL
    """
    news_data = []

    try:
        # Find all news containers using the CSS selector pattern
        # Looking for div elements that contain news information
        news_containers = soup.find_all('div', class_='Tfehrf')

        for container in news_containers:
            try:
                # Extract news source
                source_elem = container.find('div', class_='sfyJob')
                source = source_elem.get_text(strip=True) if source_elem else 'Unknown'

                # Extract days ago
                days_elem = container.find('div', class_='Adak')
                days_ago = days_elem.get_text(strip=True) if days_elem else 'Unknown'

                # Extract news content
                content_elem = container.find('div', class_='Yfwt5')
                content = content_elem.get_text(strip=True) if content_elem else 'No content'

                # Extract news URL - look for parent 'a' tag
                news_link = 'No URL'
                link_elem = container.find_parent('a')
                if link_elem and 'href' in link_elem.attrs:
                    href = link_elem['href']
                    # Convert relative URL to absolute
                    if href.startswith('./'):
                        href = href[2:]  # Remove './'
                    if href.startswith('/'):
                        href = 'https://www.google.com' + href
                    news_link = href

                news_item = {
                    'source': source,
                    'days_ago': days_ago,
                    'content': content,
                    'url': news_link
                }

                news_data.append(news_item)

            except Exception as e:
                print(f"Error processing news item: {e}")
                continue

    except Exception as e:
        print(f"Error scraping news data: {e}")

    return news_data


def main():
    url = "https://www.google.com/finance/quote/CLW00:NYMEX?hl=en&window=1M"

    try:
        response = requests.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')

        # Scrape news data
        news_data = scrape_news_data(soup)

        # Display results
        if news_data:
            print(f"Found {len(news_data)} news items:\n")
            print(json.dumps(news_data, indent=2, ensure_ascii=False))

            # Optionally save to file
            with open('news_data.json', 'w', encoding='utf-8') as f:
                json.dump(news_data, f, indent=2, ensure_ascii=False)
            print("\nNews data saved to 'news_data.json'")
        else:
            print("No news data found")

    except requests.RequestException as e:
        print(f"Error fetching the webpage: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()
