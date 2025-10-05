"""
Market Pulse Data Generator - Multi-Asset Version V2
ใช้ client.responses.parse() ตามเอกสาร Azure OpenAI ใหม่
สนับสนุน: Crude Oil (CL=F), Sugar (SB=F), USD/THB (THB=X)
"""

import yfinance as yf
import http.client
import json
from datetime import datetime, timedelta
from openai import OpenAI
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

# =====================================================
# Configuration
# =====================================================

load_dotenv()

# Azure OpenAI Client
client = OpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    base_url=os.getenv("AZURE_OPENAI_ENDPOINT")
)

SERPER_API_KEY = os.getenv("SERPER_API_KEY")

# Use relative path from backend directory to frontend/public/data
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "data")

# Market Configurations
MARKETS = {
    "crude_oil": {
        "symbol": "CL=F",
        "name": "Crude Oil",
        "name_th": "น้ำมันดิบ",
        "unit": "USD/barrel",
        "search_queries": [
            "crude oil price forecast Q3 2025 Q4 2025",
            "WTI crude oil forecast 2025 2026",
            "EIA crude oil price outlook 2025"
        ]
    },
    "sugar": {
        "symbol": "SB=F",
        "name": "Sugar",
        "name_th": "น้ำตาล",
        "unit": "USD/lb",
        "search_queries": [
            "sugar price forecast 2025 2026",
            "sugar market outlook Q3 Q4 2025"
        ]
    },
    "usd_thb": {
        "symbol": "THB=X",
        "name": "USD/THB",
        "name_th": "อัตราแลกเปลี่ยน ดอลลาร์/บาท",
        "unit": "THB",
        "search_queries": [
            "USD THB forecast 2025 2026",
            "Thai Baht exchange rate outlook 2025"
        ]
    }
}

# Get current date/time for prompts
def get_current_datetime_context():
    """สร้าง context เวลาปัจจุบันสำหรับ LLM"""
    now = datetime.now()
    return {
        'date': now.strftime('%Y-%m-%d'),
        'full_datetime': now.strftime('%Y-%m-%d %H:%M:%S'),
        'context_text': f"""
TODAY'S DATE & TIME CONTEXT:
- Current Date: {now.strftime('%Y-%m-%d (%A)')}
- Current Time: {now.strftime('%H:%M:%S')} (Thailand time)
- Quarter: Q{(now.month-1)//3 + 1}/2025

IMPORTANT: Use this date for ALL time-sensitive recommendations:
- "ภายใน 3 วันทำการ" means by {(now + timedelta(days=3)).strftime('%Y-%m-%d')}
"""
    }

# =====================================================
# Pydantic Models for Structured Output
# =====================================================

class NewsScoreItem(BaseModel):
    region: str
    score: int
    reason: str

class NewsScore(BaseModel):
    newsId: str
    title: str
    summary: str
    publishedDate: str
    imageUrl: str
    link: str
    scores: List[NewsScoreItem]

class NewsScoreList(BaseModel):
    news: List[NewsScore]

class PriceForecast(BaseModel):
    quarter: str
    date: str
    price_forecast: str
    source: str
    actionRecommendation: str  # คำแนะนำการดำเนินการสำหรับไตรมาสนี้

class PriceForecastList(BaseModel):
    forecasts: List[PriceForecast]

class KeySignal(BaseModel):
    title: str
    value: str

class TopNews(BaseModel):
    newsId: str
    headline: str
    summary: str
    impactScore: int

class RegionalAnalysisItem(BaseModel):
    region: str
    dailySummary: str
    actionableInsight: str
    competitorStrategy: str
    ourRecommendedAction: str
    keySignals: List[KeySignal]
    topNews: List[TopNews]

class PopupAnalysisOutput(BaseModel):
    regionalAnalysis: List[RegionalAnalysisItem]

class FullReportOutput(BaseModel):
    html: str

# =====================================================
# Step 1: Fetch News from yfinance
# =====================================================

def fetch_market_news(market_key):
    """ดึงข่าวและราคาจาก yfinance"""
    config = MARKETS[market_key]
    print(f"\n📰 Fetching {config['name']} news from yfinance...")

    ticker = yf.Ticker(config['symbol'])

    # ดึงข้อมูลราคา
    hist = ticker.history(period='5d')
    current_price = hist['Close'].iloc[-1]
    prev_price = hist['Close'].iloc[-2]
    price_change = current_price - prev_price
    price_change_pct = (price_change / prev_price) * 100

    # ดึงข่าว
    news = ticker.news if hasattr(ticker, 'news') and ticker.news else []

    print(f"✅ Found {len(news)} news articles")
    print(f"💰 Current Price: {current_price:.2f} {config['unit']} ({price_change_pct:+.2f}%)")

    return {
        "market": market_key,
        "news": news,
        "current_price": current_price,
        "price_change": price_change,
        "price_change_pct": price_change_pct,
        "last_update": datetime.now().isoformat()
    }

# =====================================================
# Step 2: Score News with LLM
# =====================================================

def score_news_with_llm(news_data, market_key):
    """ให้ LLM ให้คะแนน impact ของข่าวต่อแต่ละภูมิภาค"""
    config = MARKETS[market_key]
    print(f"\n🤖 Scoring {config['name']} news with LLM...")

    news_items = news_data["news"]
    if not news_items:
        print(f"⚠️  No news found for {config['name']}, creating empty result")
        return {"news": []}

    dt_context = get_current_datetime_context()

    # สร้าง prompt
    news_summary = ""
    for idx, news in enumerate(news_items[:20], 1):
        content = news.get('content', news)
        pub_date = content.get('pubDate', content.get('displayTime', ''))
        thumbnail_url = ''
        if content.get('thumbnail'):
            resolutions = content['thumbnail'].get('resolutions', [])
            if len(resolutions) > 1:
                thumbnail_url = resolutions[1].get('url', '')

        news_summary += f"""
{idx}. ID: {pub_date[:10]}-{idx}
   Title: {content.get('title', 'N/A')}
   Summary: {content.get('summary', content.get('description', 'N/A'))}
   Publisher: {content.get('provider', {}).get('displayName', 'N/A')}
   Date: {pub_date}
   Link: {content.get('canonicalUrl', {}).get('url', content.get('link', 'N/A'))}
   Thumbnail: {thumbnail_url}
"""

    prompt_text = f"""You are a {config['name_th']} market analyst. Analyze these news articles and score their impact.

{dt_context['context_text']}

News Articles:
{news_summary}

Task:
For EACH news article, provide:
1. A brief summary (1-2 sentences in Thai)
2. Impact score (0-100) for THREE regions (use lowercase: 'global', 'asia', 'thailand'):
   - global: Impact on global {config['name']} markets
   - asia: Impact on Asian markets
   - thailand: Impact specifically on Thailand
3. Reason for each score (1 sentence in Thai)

Scoring Guidelines:
- 90-100: Major impact, immediate price movement expected
- 70-89: Significant impact, medium-term effects
- 40-69: Moderate impact, indirect effects
- 0-39: Minor impact, limited effects

Return structured data matching the NewsScoreList schema."""

    response = client.responses.parse(
        model="gpt-4.1-mini",
        instructions=f"You are a financial analyst specialized in {config['name']} markets. Analyze news and score impacts for 3 regions (Global, Asia, Thailand). Return structured JSON matching NewsScoreList schema.",
        input=prompt_text,
        text_format=NewsScoreList
    )

    result = response.output_parsed  # NewsScoreList object
    print(f"✅ Scored {len(result.news)} news articles")

    return result.model_dump()

# =====================================================
# Step 3: Fetch Price Forecasts
# =====================================================

def fetch_price_forecasts(market_key):
    """ดึงพยากรณ์ราคาจาก Google Serper + LLM"""
    config = MARKETS[market_key]
    print(f"\n📊 Fetching {config['name']} price forecasts...")

    conn = http.client.HTTPSConnection("google.serper.dev")
    all_results = []

    for query in config['search_queries']:
        payload = json.dumps({
            "q": query,
            "num": 3,
            "gl": "us",
            "hl": "en"
        })

        headers = {
            'X-API-KEY': SERPER_API_KEY,
            'Content-Type': 'application/json'
        }

        conn.request("POST", "/search", payload, headers)
        res = conn.getresponse()
        data = res.read()
        results = json.loads(data.decode("utf-8"))

        if 'organic' in results:
            all_results.extend(results['organic'][:2])

    conn.close()

    # ให้ LLM วิเคราะห์และดึง forecast
    search_summary = json.dumps(all_results, indent=2)

    prompt_text = f"""Extract {config['name']} price forecasts from these search results and provide actionable recommendations.

Search Results:
{search_summary}

Task:
Find price forecasts for Q3/2025, Q4/2025, Q1/2026, Q2/2026.
Return at least 4 forecasts (one for each quarter).

For EACH forecast provide:
1. quarter: e.g., "Q3/25"
2. date: convert to date (Q3/25="2025-08-15", Q4/25="2025-11-15", Q1/26="2026-02-15", Q2/26="2026-05-15")
3. price_forecast: e.g., "$68 per barrel" or "16.5 cents/lb" or "฿32.5"
4. source: where this forecast came from
5. actionRecommendation: SHORT actionable advice in Thai (1 sentence) - what procurement/finance teams should do for this quarter
   Examples:
   - "ล็อคราคา 30-40% ของ Q3 demand ภายในสัปดาห์นี้"
   - "รอให้ราคาปรับลงก่อนซื้อเพิ่มใน Q4"
   - "เตรียม hedge 50% เพื่อป้องกันความผันผวน"

If exact forecasts not found, make reasonable estimates based on trends.
Return structured data matching PriceForecastList schema. """

    response = client.responses.parse(
        model="gpt-4.1-mini",
        instructions="You are a financial analyst. Extract price forecasts for different quarters. Return structured JSON matching PriceForecastList schema with 'forecasts' array.",
        input=prompt_text,
        text_format=PriceForecastList
    )

    result = response.output_parsed  # PriceForecastList object
    print(f"✅ Found {len(result.forecasts)} quarterly forecasts")

    return result.model_dump()

# =====================================================
# Step 4: Generate Pop-up Analysis
# =====================================================

def generate_popup_analysis(news_scores, price_forecasts, market_data, market_key):
    """สร้างการวิเคราะห์สำหรับ Pop-up Modal"""
    config = MARKETS[market_key]
    print(f"\n🎯 Generating {config['name']} pop-up analysis...")

    news_items = news_scores["news"]
    dt_context = get_current_datetime_context()

    current_price = market_data['current_price']
    price_change_pct = market_data['price_change_pct']
    unit = config['unit']
    
    # Build prompt with variables
    current_price = market_data["current_price"]
    price_change_pct = market_data["price_change_pct"]
    unit = config["unit"]
    name_th = config["name_th"]
    name = config["name"]
    
    prompt_text = f"""You are a market intelligence analyst for {name_th} ({name}) markets.

{dt_context["context_text"]}

Current Market Data:
Price: {current_price:.2f} {unit}
Change: {price_change_pct:+.2f}%

Price Forecasts:
{json.dumps(price_forecasts["forecasts"], indent=2)}

Top News (sorted by impact):
{json.dumps(news_items[:10], indent=2)}

Task:
Create market analysis for 3 regions (IMPORTANT: use lowercase for region names: 'global', 'asia', 'thailand').

For EACH region, provide:
1. region: MUST be lowercase ('global', 'asia', or 'thailand')
2. dailySummary: 2-3 sentence summary in Thai (กระชับ เน้นตัวเลขและข้อเท็จจริง)
3. actionableInsight: What to do next (1 sentence with specific timeline)
4. competitorStrategy: What major players are doing NOW (1-2 sentences)
5. ourRecommendedAction: SPECIFIC action with EXACT DATES (use TODAY's date {dt_context['date']} as reference)
   Example: "ล็อคราคา 30% ของ demand ภายในวันที่ 10 ตุลาคม 2025"
6. keySignals: 2 key market signals
7. topNews: Top 2-3 news with highest impact for this region

Style: Direct, data-driven, professional (Thai language)
"""

    response = client.responses.parse(
        model="gpt-4.1-mini",
        instructions="You are a market analyst. Provide concise, data-driven analysis in Thai for 3 regions (Global, Asia, Thailand). Return structured JSON matching PopupAnalysisOutput schema.",
        input=prompt_text,
        text_format=PopupAnalysisOutput
    )

    result = response.output_parsed  # PopupAnalysisOutput object

    # รวมข้อมูลทั้งหมด
    popup_data = {
        "currentPrice": market_data['current_price'],
        "priceChange": market_data['price_change'],
        "priceChangePercent": market_data['price_change_pct'],
        "lastUpdate": market_data['last_update'],
        "regionalAnalysis": result.model_dump()['regionalAnalysis'],
        "quarterlyForecasts": price_forecasts['forecasts']
    }

    print(f"✅ {config['name']} pop-up analysis generated")

    return popup_data

# =====================================================
# Step 5: Generate Full Report HTML
# =====================================================

def generate_full_report(news_scores, price_forecasts, popup_analysis, market_data, market_key):
    """สร้างรายงานฉบับเต็มแบบ HTML"""
    config = MARKETS[market_key]
    print(f"\n📄 Generating {config['name']} full report HTML...")

    dt_context = get_current_datetime_context()

    prompt_text = f"""You are a senior commodity strategist at Goldman Sachs with 20+ years experience in {config['name_th']} ({config['name']}) markets.

{dt_context['context_text']}

Create a COMPREHENSIVE {config['name_th']} market intelligence report (8-10 pages equivalent).

Market Data:
- Price: {market_data['current_price']:.2f} {config['unit']} ({market_data['price_change_pct']:+.2f}%)
- Forecasts: {json.dumps(price_forecasts['forecasts'], indent=2)}
- Regional Analysis: {json.dumps(popup_analysis['regionalAnalysis'], indent=2)}
- News: {json.dumps(news_scores['news'][:15], indent=2)}

CRITICAL: This is a PREMIUM intelligence product. Make it ACTIONABLE and SPECIFIC.

Required Sections:
1. **Executive Summary** (4-5 paragraphs with exact dates and numbers)
2. **Market Situation Deep Dive** (supply, demand, geopolitics)
3. **Regional Analysis** - Global, Asia, Thailand (5-6 paragraphs each)
4. **Quarterly Forecasts** (detailed for each Q)
5. **Strategic Action Plan** with EXACT DATES from TODAY {dt_context['date']}
6. **Risk Matrix** (table format)
7. **Competitive Intelligence**
8. **Financial Impact Scenarios**

STYLE:
- Thai language (ภาษาไทย)
- SPECIFIC: exact numbers, percentages, dates, volumes
- ACTIONABLE: every insight → concrete action
- Avoid theory, focus on "what to do"

HTML FORMATTING:
- Use Tailwind CSS classes
- Professional layout with proper spacing
- Color coding (bg-red-50 for risks, bg-green-50 for opportunities, bg-blue-50 for insights)

Return HTML in the 'html' field matching FullReportOutput schema."""

    response = client.responses.parse(
        model="gpt-4.1-mini",
        instructions=f"You are a senior commodity strategist. Create COMPREHENSIVE, ACTIONABLE {config['name_th']} market intelligence reports in Thai. Be SPECIFIC with numbers, dates, and actions. Return structured JSON matching FullReportOutput schema.",
        input=prompt_text,
        text_format=FullReportOutput
    )

    result = response.output_parsed  # FullReportOutput object

    print(f"✅ {config['name']} full report HTML generated")

    return result.model_dump()

# =====================================================
# Step 6: Save Data for Each Market
# =====================================================

def save_market_data(market_key, news_scores, price_forecasts, popup_analysis, full_report):
    """บันทึกข้อมูลของแต่ละตลาดเป็นไฟล์ JSON"""
    config = MARKETS[market_key]
    print(f"\n💾 Saving {config['name']} data files...")

    # สร้าง directory ถ้ายังไม่มี
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Combined data for this market
    combined = {
        "market": market_key,
        "marketName": config['name'],
        "marketNameTh": config['name_th'],
        "symbol": config['symbol'],
        "unit": config['unit'],
        "generatedAt": datetime.now().isoformat(),
        "news": news_scores,
        "forecasts": price_forecasts,
        "popup": popup_analysis,
        "report": full_report
    }

    filename = f"{OUTPUT_DIR}/{market_key}_data.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)

    print(f"✅ Saved: {market_key}_data.json")

    return combined

# =====================================================
# Main Execution
# =====================================================

def process_market(market_key):
    """ประมวลผลข้อมูลสำหรับตลาดหนึ่งๆ"""
    config = MARKETS[market_key]

    print("\n" + "="*60)
    print(f"🎯 Processing: {config['name']} ({config['name_th']})")
    print("="*60)

    try:
        # Step 1: Fetch news
        market_data = fetch_market_news(market_key)

        # Step 2: Score news
        news_scores = score_news_with_llm(market_data, market_key)

        # Step 3: Get price forecasts
        price_forecasts = fetch_price_forecasts(market_key)

        # Step 4: Generate pop-up analysis
        popup_analysis = generate_popup_analysis(news_scores, price_forecasts, market_data, market_key)

        # Step 5: Generate full report
        full_report = generate_full_report(news_scores, price_forecasts, popup_analysis, market_data, market_key)

        # Step 6: Save everything
        combined_data = save_market_data(market_key, news_scores, price_forecasts, popup_analysis, full_report)

        print(f"✅ {config['name']} data generated successfully!")

        return combined_data

    except Exception as e:
        print(f"❌ ERROR processing {config['name']}: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    """รันระบบทั้งหมดสำหรับทุกตลาด"""
    print("="*60)
    print("🚀 MARKET PULSE DATA GENERATOR - MULTI ASSET V2")
    print("="*60)
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📊 Markets: Crude Oil, Sugar, USD/THB\n")

    all_markets_data = {}

    # Process each market
    for market_key in ["crude_oil", "sugar", "usd_thb"]:
        market_data = process_market(market_key)
        if market_data:
            all_markets_data[market_key] = market_data

    # Save combined index file
    index_data = {
        "generatedAt": datetime.now().isoformat(),
        "markets": list(MARKETS.keys()),
        "data": all_markets_data
    }

    with open(f"{OUTPUT_DIR}/all_markets.json", 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)

    print("\n" + "="*60)
    print("✅ ALL MARKETS DATA GENERATED SUCCESSFULLY!")
    print("="*60)
    print(f"⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Output Directory: {OUTPUT_DIR}")
    print(f"📊 Markets processed: {len(all_markets_data)}/{len(MARKETS)}")

if __name__ == "__main__":
    main()
