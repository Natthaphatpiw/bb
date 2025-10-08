"""
Market Pulse Data Generator - Multi-Asset Version V2 (Enhanced with Persona-based Insights)
- ใช้ client.responses.parse() ตามเอกสาร Azure OpenAI
- รองรับ 3 User Personas: SME, Supply Chain Manager, Investor
- Google Serper integration สำหรับ real-time market research
- Simplified popup with key metrics only
"""

import yfinance as yf
import http.client
import json
from datetime import datetime, timedelta
from openai import AzureOpenAI
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# =====================================================
# Configuration
# =====================================================

load_dotenv()

# Azure OpenAI Client
client = AzureOpenAI(
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    api_version="2024-08-01-preview",
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
)

DEPLOYMENT_NAME = "gpt-4.1-mini"  # Azure deployment name
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
        ],
        # Persona-specific search queries
        "persona_queries": {
            "sme": [
                "crude oil impact on SME manufacturing costs 2025",
                "fuel cost management strategies for small business 2025"
            ],
            "supply_chain": [
                "crude oil supply chain disruption 2025",
                "oil logistics procurement strategy 2025"
            ],
            "investor": [
                "crude oil investment opportunities 2025",
                "oil futures trading signals 2025"
            ]
        }
    },
    "sugar": {
        "symbol": "SB=F",
        "name": "Sugar",
        "name_th": "น้ำตาล",
        "unit": "USD/lb",
        "search_queries": [
            "sugar price forecast 2025 2026",
            "sugar market outlook Q3 Q4 2025"
        ],
        "persona_queries": {
            "sme": [
                "sugar price impact on food manufacturing SME 2025",
                "sugar cost control strategies bakery business 2025"
            ],
            "supply_chain": [
                "sugar supply chain management 2025",
                "sugar procurement hedging strategies 2025"
            ],
            "investor": [
                "sugar commodity investment outlook 2025",
                "sugar futures trading opportunities 2025"
            ]
        }
    },
    "usd_thb": {
        "symbol": "THB=X",
        "name": "USD/THB",
        "name_th": "อัตราแลกเปลี่ยน ดอลลาร์/บาท",
        "unit": "THB",
        "search_queries": [
            "USD THB forecast 2025 2026",
            "Thai Baht exchange rate outlook 2025"
        ],
        "persona_queries": {
            "sme": [
                "USD THB impact on import export SME Thailand 2025",
                "currency hedging for small business Thailand 2025"
            ],
            "supply_chain": [
                "USD THB supply chain cost management 2025",
                "forex risk management procurement Thailand 2025"
            ],
            "investor": [
                "USD THB forex trading strategy 2025",
                "Thai Baht investment opportunities 2025"
            ]
        }
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

class PriceForecastList(BaseModel):
    forecasts: List[PriceForecast]

# =====================================================
# NEW: Persona-based Recommendation Models
# =====================================================

class KeyMetric(BaseModel):
    """Key metric to display in popup - simple and focused"""
    label: str  # e.g., "ราคาปัจจุบัน", "แนวโน้ม 30 วัน"
    value: str  # e.g., "$75.2/barrel", "▲ 8.5%"
    trend: str  # "up", "down", "neutral"

class ActionItem(BaseModel):
    """Specific action for user to take"""
    action: str  # The action in Thai (1 sentence, specific)
    timeline: str  # e.g., "ภายใน 3 วันทำการ", "สัปดาห์นี้"
    priority: str  # "high", "medium", "low"
    reason: str  # Short reason (1 sentence)

class RegionalImpact(BaseModel):
    """Impact analysis for each region"""
    region: str  # "global", "asia", "thailand"
    region_name_th: str  # "ทั่วโลก", "เอเชีย", "ไทย"
    impact_score: int  # 0-100
    impact_level: str  # "สูงมาก", "สูง", "ปานกลาง", "ต่ำ"
    trend: str  # "up", "down", "neutral"
    summary: str  # 2-3 sentence summary for this region
    key_factors: List[str]  # 2-3 key factors affecting this region

class PersonaRecommendation(BaseModel):
    """Recommendation specific to each user persona"""
    persona: str  # "sme", "supply_chain", "investor"
    persona_name_th: str  # "ธุรกิจ SME", "ฝ่าย Supply Chain", "นักลงทุน"
    market_situation: str  # สรุปสถานการณ์ตลาดสั้นๆ เฉพาะ persona นี้ (1 ประโยค)
    power_insight: str  # Insight ที่ powerful และ actionable (ต้องโดดเด่นกว่าเครื่องมืออื่นในตลาด)
    action_recommendation: str  # คำแนะนำเชิงปฏิบัติ 1-2 ประโยค (ทำอะไร → ผลลัพธ์อย่างไร)
    risk_assessment: str  # "ความเสี่ยงสูง", "ความเสี่ยงปานกลาง", "ความเสี่ยงต่ำ"
    opportunity_level: str  # "โอกาสสูง", "โอกาสปานกลาง", "โอกาสต่ำ"

class TopNewsItem(BaseModel):
    """Top news item to highlight"""
    title: str
    summary: str
    impact_score: int
    published_date: str
    image_url: str
    link: str

class SimplifiedPopupData(BaseModel):
    """Simplified popup structure - key metrics only"""
    key_metrics: List[KeyMetric]  # Max 4-5 key metrics
    quick_summary: str  # 2-3 sentence summary in Thai
    regional_impacts: List[RegionalImpact]  # 3 regions (Global, Asia, Thailand)
    recommendations: List[PersonaRecommendation]  # 3 recommendations (SME, Supply, Investor)
    top_news: TopNewsItem  # 1 most important news
    price_forecasts: List[PriceForecast]  # Quarterly forecasts

# =====================================================
# Google Serper Helper Functions
# =====================================================

def search_with_serper(query: str, num_results: int = 3) -> List[dict]:
    """ค้นหาข้อมูลผ่าน Google Serper API"""
    try:
        conn = http.client.HTTPSConnection("google.serper.dev")
        payload = json.dumps({
            "q": query,
            "num": num_results,
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
        conn.close()

        return results.get('organic', [])
    except Exception as e:
        print(f"⚠️  Serper search error: {str(e)}")
        return []

def fetch_persona_specific_research(market_key: str, persona: str) -> str:
    """ดึงข้อมูลเฉพาะสำหรับแต่ละ persona ผ่าน Serper"""
    config = MARKETS[market_key]
    queries = config.get('persona_queries', {}).get(persona, [])

    all_results = []
    for query in queries:
        results = search_with_serper(query, num_results=2)
        all_results.extend(results)

    # Format results for LLM
    research_summary = ""
    for idx, result in enumerate(all_results[:5], 1):
        research_summary += f"""
{idx}. {result.get('title', 'N/A')}
   URL: {result.get('link', 'N/A')}
   Snippet: {result.get('snippet', 'N/A')}
"""

    return research_summary

# =====================================================
# Step 1: Fetch News from yfinance
# =====================================================

def fetch_market_news(market_key):
    """ดึงข่าวและราคาจาก yfinance"""
    config = MARKETS[market_key]
    print(f"\n📰 Fetching {config['name']} news from yfinance...")

    ticker = yf.Ticker(config['symbol'])

    # ดึงข้อมูลราคา
    hist = ticker.history(period='30d')
    current_price = hist['Close'].iloc[-1]
    prev_price = hist['Close'].iloc[-2]
    price_30d_ago = hist['Close'].iloc[0]

    price_change = current_price - prev_price
    price_change_pct = (price_change / prev_price) * 100
    price_change_30d_pct = ((current_price - price_30d_ago) / price_30d_ago) * 100

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
        "price_change_30d_pct": price_change_30d_pct,
        "high_30d": float(hist['High'].max()),
        "low_30d": float(hist['Low'].min()),
        "last_update": datetime.now().isoformat()
    }

# =====================================================
# Step 2: Score News with LLM (Simplified)
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

    # สร้าง prompt - เน้นข่าวสำคัญๆ เท่านั้น
    news_summary = ""
    for idx, news in enumerate(news_items[:10], 1):  # ลดจาก 20 เป็น 10
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

    system_prompt = f"You are a financial analyst specialized in {config['name']} markets. Focus on high-impact news only. Return structured JSON matching this schema: {NewsScoreList.model_json_schema()}"

    user_prompt = f"""You are a {config['name_th']} market analyst. Analyze ONLY the most impactful news.

{dt_context['context_text']}

News Articles:
{news_summary}

Task:
For EACH news article, provide:
1. A brief summary (1 sentence in Thai)
2. Impact score (0-100) for THREE regions (use lowercase: 'global', 'asia', 'thailand')
3. Reason for each score (1 sentence in Thai)

Focus on HIGH-IMPACT news only (score >= 60).

Return a JSON object with a "news" array containing the scored news items."""

    response = client.chat.completions.create(
        model=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )

    result_json = json.loads(response.choices[0].message.content)
    result = NewsScoreList(**result_json)

    print(f"✅ Scored {len(result.news)} news articles")

    return result.model_dump()

# =====================================================
# Step 3: Fetch Price Forecasts (Enhanced with Serper)
# =====================================================

def fetch_price_forecasts(market_key):
    """ดึงพยากรณ์ราคาจาก Google Serper + LLM"""
    config = MARKETS[market_key]
    print(f"\n📊 Fetching {config['name']} price forecasts with Serper...")

    all_results = []

    for query in config['search_queries']:
        results = search_with_serper(query, num_results=3)
        all_results.extend(results[:2])

    # ให้ LLM วิเคราะห์และดึง forecast
    search_summary = json.dumps(all_results, indent=2)

    system_prompt = f"You are a financial analyst. Extract price forecasts for different quarters. Return structured JSON with a 'forecasts' array."

    user_prompt = f"""Extract {config['name']} price forecasts from these search results.

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

If exact forecasts not found, make reasonable estimates based on trends.
Return a JSON object with "forecasts" array."""

    response = client.chat.completions.create(
        model=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )

    result_json = json.loads(response.choices[0].message.content)
    result = PriceForecastList(**result_json)

    print(f"✅ Found {len(result.forecasts)} quarterly forecasts")

    return result.model_dump()

# =====================================================
# Step 4: Generate Simplified Popup with Persona Recommendations
# =====================================================

def generate_simplified_popup(news_scores, price_forecasts, market_data, market_key):
    """สร้าง Popup แบบใหม่ - เน้น Key Metrics + 3 Persona Recommendations"""
    config = MARKETS[market_key]
    print(f"\n🎯 Generating simplified popup for {config['name']}...")

    dt_context = get_current_datetime_context()

    # Fetch persona-specific research
    print("🔍 Fetching persona-specific research from Serper...")
    sme_research = fetch_persona_specific_research(market_key, "sme")
    supply_research = fetch_persona_specific_research(market_key, "supply_chain")
    investor_research = fetch_persona_specific_research(market_key, "investor")

    current_price = market_data['current_price']
    price_change_pct = market_data['price_change_pct']
    price_change_30d_pct = market_data['price_change_30d_pct']
    high_30d = market_data['high_30d']
    low_30d = market_data['low_30d']
    unit = config['unit']
    name_th = config['name_th']

    prompt_text = f"""You are a market intelligence analyst specializing in {name_th} markets.

{dt_context["context_text"]}

CURRENT MARKET DATA:
- Price: {current_price:.2f} {unit}
- 24h Change: {price_change_pct:+.2f}%
- 30-day Change: {price_change_30d_pct:+.2f}%
- 30-day High: {high_30d:.2f} {unit}
- 30-day Low: {low_30d:.2f} {unit}

PRICE FORECASTS:
{json.dumps(price_forecasts["forecasts"], indent=2)}

TOP NEWS:
{json.dumps(news_scores["news"][:5], indent=2)}

PERSONA-SPECIFIC RESEARCH:

=== SME Research ===
{sme_research}

=== Supply Chain Research ===
{supply_research}

=== Investor Research ===
{investor_research}

TASK:
Create a SIMPLIFIED popup with:

1. **Key Metrics** (max 4-5 metrics):
   - Current price with trend
   - 30-day trend
   - Volatility indicator
   - Next week outlook
   - Risk level

2. **Quick Summary** (2-3 sentences in Thai):
   - What's happening now
   - Why it matters
   - What to watch

3. **Regional Impacts** (3 regions):
   For EACH region (Global, Asia, Thailand), provide:
   - region: "global", "asia", or "thailand"
   - region_name_th: "ทั่วโลก", "เอเชีย", or "ไทย"
   - impact_score: 0-100 (quantitative measure)
   - impact_level: "สูงมาก" (80-100), "สูง" (60-79), "ปานกลาง" (40-59), "ต่ำ" (0-39)
   - trend: "up", "down", or "neutral"
   - summary: 2-3 sentences explaining impact in this region
   - key_factors: Array of 2-3 key factors (strings)

4. **3 Persona-specific Recommendations** (MUST BE POWERFUL & UNIQUE):

   CRITICAL WRITING RULES:
   - ใช้ภาษาไทยง่ายๆ ที่ทุกคนเข้าใจ อ่านครั้งเดียวเข้าใจทันที
   - ห้ามใช้ศัพท์เทคนิค เช่น EIA, spot market, fixed-price, DCA, portfolio, technical, upside, rebound
   - ห้ามใช้คำยาก เช่น อุปสงค์, อุปทาน
   - ใช้คำง่ายๆ เช่น "ซื้อล่วงหน้า" แทน "ล็อคราคา", "ตลาดโลก" แทน "global market"
   - อธิบายให้ครบถ้วน เช่น "ราคา 62 ดอลลาร์ต่อบาร์เรล (1 บาร์เรล = 159 ลิตร)" แทน "$62/barrel"
   - เขียนให้เห็นภาพชัดเจน ใครอ่านก็เข้าใจและตัดสินใจต่อได้ทันที

   A. **SME (ธุรกิจ SME)** - เป็นเจ้าของร้านอาหาร, โรงงานขนาดเล็ก, ธุรกิจครอบครัว
      - market_situation: สถานการณ์ตลาดที่กระทบต้นทุนธุรกิจโดยตรง (1-2 ประโยค อธิบายให้เห็นภาพ)
      - power_insight: ข้อมูลสำคัญที่ช่วยประหยัดเงิน พร้อมตัวเลขชัดเจน (2-3 ประโยค อธิบายว่าทำไมถึงเป็นแบบนี้ ใช้ภาษาง่ายๆ ไม่ใช้ศัพท์เทคนิค)
        ตัวอย่าง: "ราคาน้ำมันตอนนี้อยู่ที่ 62 ดอลลาร์ต่อบาร์เรล (1 บาร์เรล = 159 ลิตร) แต่คาดว่าจะลดลงเหลือ 52 ดอลลาร์ภายใน 3 เดือนข้างหน้า เพราะประเทศผู้ผลิตน้ำมันกำลังเพิ่มการผลิต ถ้าซื้อล่วงหน้าตอนนี้จะประหยัดเงินได้ประมาณ 10-15% เทียบกับซื้อตามราคาตลาดทุกวัน"
      - action_recommendation: คำแนะนำชัดเจนว่าควรทำอะไร (2-3 ประโยค รูปแบบ "ทำอย่างไร → ได้ผลลัพธ์อะไร" อธิบายให้เห็นภาพชัดเจน)
        ตัวอย่าง: "ติดต่อซัพพลายเออร์ของคุณภายในสัปดาห์นี้ เพื่อซื้อน้ำมันล่วงหน้าสำหรับ 3 เดือนข้างหน้า ประมาณ 40-50% ของจำนวนที่ใช้ปกติ วิธีนี้จะช่วยให้คุณลดค่าใช้จ่ายได้ 300,000-800,000 บาท ขึ้นอยู่กับขนาดธุรกิจ และไม่ต้องกังวลเรื่องราคาขึ้นๆลงๆ"
      - risk_assessment: "มีความเสี่ยง" หรือ "ความเสี่ยงปานกลาง" หรือ "ความเสี่ยงต่ำ"
      - opportunity_level: "โอกาสดีมาก" หรือ "โอกาสดี" หรือ "โอกาสปานกลาง"

   B. **Supply Chain Manager (ฝ่ายจัดซื้อ/คลังสินค้า)** - คนจัดซื้อวัตถุดิบให้บริษัท
      - market_situation: สถานการณ์ที่กระทบการจัดซื้อ (1-2 ประโยค)
      - power_insight: ข้อมูลเชิงลึกที่ช่วยในการวางแผนจัดซื้อ (2-3 ประโยค ใช้ภาษาง่ายๆ อธิบายให้ชัดเจน)
        ตัวอย่าง: "ถ้าทำสัญญาซื้อล่วงหน้ากับซัพพลายเออร์ตอนนี้ โดยตกลงราคาตายตัวที่ 65 ดอลลาร์ต่อบาร์เรล คุณจะประหยัดเงินได้มากกว่าซื้อตามราคาตลาดแบบทั่วไป ประมาณ 8-12 ดอลลาร์ต่อบาร์เรล ในช่วง 3-6 เดือนข้างหน้า เพราะราคาตลาดมีแนวโน้มขึ้นๆลงๆมาก"
      - action_recommendation: คำแนะนำการดำเนินการ (2-3 ประโยค รูปแบบ "ทำอย่างไร → ได้ผลอย่างไร")
        ตัวอย่าง: "เริ่มเจรจากับซัพพลายเออร์หลักภายในสัปดาห์นี้ เพื่อทำสัญญาซื้อล่วงหน้า 6 เดือน โดยตกลงราคาตายตัวที่ประมาณ 65 ดอลลาร์ต่อบาร์เรล วิธีนี้จะช่วยให้บริษัทลดต้นทุนได้ 2-3 ล้านบาทต่อปี และไม่ต้องกังวลเรื่องราคาผันผวนที่อาจขึ้นลง 15-20% ในช่วงปลายปี"
      - risk_assessment: "มีความเสี่ยง" หรือ "ความเสี่ยงปานกลาง" หรือ "ความเสี่ยงต่ำ"
      - opportunity_level: "โอกาสดีมาก" หรือ "โอกาสดี" หรือ "โอกาสปานกลาง"

   C. **Investor (นักลงทุน)** - คนที่ลงทุนหุ้น, กองทุน, สินค้าโภคภัณฑ์
      - market_situation: สถานการณ์ตลาดการลงทุน (1-2 ประโยค)
      - power_insight: มุมมองการลงทุนที่น่าสนใจ (2-3 ประโยค ใช้ภาษาง่ายๆ อธิบายให้เข้าใจ)
        ตัวอย่าง: "หุ้นกลุ่มพลังงานมีโอกาสขึ้นได้ 25-30% ในอีก 6 เดือนข้างหน้า ถ้าราคาน้ำมันฟื้นตัวตามที่คาดการณ์ ตอนนี้ราคาหุ้นอยู่ในจุดต่ำสุดของรอบ และมีแนวโน้มว่าจะไม่ลงต่ำกว่านี้แล้ว เป็นจุดที่เหมาะสำหรับเริ่มสะสมหุ้น"
      - action_recommendation: คำแนะนำการลงทุน (2-3 ประโยค รูปแบบ "ทำอย่างไร → ได้ผลอย่างไร")
        ตัวอย่าง: "ค่อยๆ ซื้อหุ้นกลุ่มพลังงานเป็นงวดๆ ทุก 2 สัปดาห์ ประมาณ 20% ของเงินลงทุนทั้งหมด วิธีนี้จะช่วยลดความเสี่ยงจากการซื้อผิดจังหวะ และเมื่อราคาน้ำมันฟื้นตัวในช่วงต้นปีหน้า คุณอาจได้กำไร 15-25% จากการลงทุนครั้งนี้"
      - risk_assessment: "มีความเสี่ยง" หรือ "ความเสี่ยงปานกลาง" หรือ "ความเสี่ยงต่ำ"
      - opportunity_level: "โอกาสดีมาก" หรือ "โอกาสดี" หรือ "โอกาสปานกลาง"

5. **Top News** (1 most impactful news):
   - title: News headline
   - summary: Brief summary in Thai
   - impact_score: 0-100
   - published_date: Date string
   - image_url: Image URL
   - link: News URL

6. **Price Forecasts**: Use the forecasts data provided

STYLE GUIDELINES:
- Thai language (except technical terms)
- SPECIFIC: Use exact numbers, dates, percentages
- ACTIONABLE: Every insight → concrete action with timeline
- CONCISE: No fluff, straight to the point
- Use research data from Serper to make recommendations more relevant

For actions, use specific timelines based on TODAY {dt_context['date']}:
- "ภายในวันที่ [exact date]"
- "ใน 3-5 วันทำการ"
- "ภายในสัปดาห์นี้"

IMPORTANT: Return EXACT JSON structure:
{{
  "key_metrics": [
    {{"label": "ราคาปัจจุบัน", "value": "62.28 USD/barrel", "trend": "up"}},
    {{"label": "แนวโน้ม 30 วัน", "value": "-1.89%", "trend": "down"}},
    {{"label": "ความผันผวน", "value": "ปานกลาง", "trend": "neutral"}},
    {{"label": "คาดการณ์สัปดาห์หน้า", "value": "62-65 USD/barrel", "trend": "neutral"}},
    {{"label": "ระดับความเสี่ยง", "value": "ปานกลาง", "trend": "neutral"}}
  ],
  "quick_summary": "...",
  "regional_impacts": [
    {{
      "region": "global",
      "region_name_th": "ทั่วโลก",
      "impact_score": 75,
      "impact_level": "สูง",
      "trend": "down",
      "summary": "ราคาน้ำมันโลกกำลังปรับตัวลงจากการที่...",
      "key_factors": ["OPEC+ ลดการผลิต", "ความต้องการจีนลดลง", "สต็อกสหรัฐเพิ่มขึ้น"]
    }},
    {{
      "region": "asia",
      "region_name_th": "เอเชีย",
      "impact_score": 80,
      "impact_level": "สูงมาก",
      "trend": "neutral",
      "summary": "ตลาดเอเชียยังคงมีความต้องการสูง...",
      "key_factors": ["การฟื้นตัวของเศรษฐกิจ", "นโยบายพลังงานจีน"]
    }},
    {{
      "region": "thailand",
      "region_name_th": "ไทย",
      "impact_score": 85,
      "impact_level": "สูงมาก",
      "trend": "up",
      "summary": "ราคาน้ำมันในประเทศไทยได้รับผลกระทบจาก...",
      "key_factors": ["อัตราแลกเปลี่ยนบาท", "ภาษีน้ำมัน", "ต้นทุนการนำเข้า"]
    }}
  ],
  "recommendations": [
    {{
      "persona": "sme",
      "persona_name_th": "ธุรกิจ SME",
      "market_situation": "ต้นทุนน้ำมันของธุรกิจเพิ่มขึ้น 8% ในไตรมาสที่ผ่านมา ส่งผลให้กำไรลดลง",
      "power_insight": "ราคาน้ำมันตอนนี้อยู่ที่ 62 ดอลลาร์ต่อบาร์เรล (1 บาร์เรล = 159 ลิตร) แต่คาดว่าจะลดลงเหลือ 52 ดอลลาร์ภายใน 3 เดือนข้างหน้า เพราะประเทศผู้ผลิตน้ำมันกำลังเพิ่มการผลิต ถ้าซื้อล่วงหน้าตอนนี้จะประหยัดเงินได้ประมาณ 12-15% เทียบกับซื้อตามราคาตลาดทุกวัน",
      "action_recommendation": "ติดต่อซัพพลายเออร์ของคุณภายในสัปดาห์นี้ เพื่อซื้อน้ำมันล่วงหน้าสำหรับ 3 เดือนข้างหน้า ประมาณ 40-50% ของจำนวนที่ใช้ปกติ วิธีนี้จะช่วยให้คุณลดค่าใช้จ่ายได้ 300,000-800,000 บาท ขึ้นอยู่กับขนาดธุรกิจ และไม่ต้องกังวลเรื่องราคาขึ้นๆลงๆ",
      "risk_assessment": "มีความเสี่ยง",
      "opportunity_level": "โอกาสดีมาก"
    }},
    {{
      "persona": "supply_chain",
      "persona_name_th": "ฝ่ายจัดซื้อ",
      "market_situation": "ราคาตลาดมีความผันผวนขึ้นลง 15-20% ใน 2 สัปดาห์ที่ผ่านมา ทำให้วางแผนงบประมาณยาก",
      "power_insight": "ถ้าทำสัญญาซื้อล่วงหน้ากับซัพพลายเออร์ตอนนี้ โดยตกลงราคาตายตัวที่ 65 ดอลลาร์ต่อบาร์เรล (ประมาณ 2,250 บาทต่อบาร์เรล) คุณจะประหยัดเงินได้มากกว่าซื้อตามราคาตลาดแบบทั่วไป ประมาณ 8-12 ดอลลาร์ต่อบาร์เรล ในช่วง 3-6 เดือนข้างหน้า เพราะราคาตลาดมีแนวโน้มขึ้นๆลงๆมาก",
      "action_recommendation": "เริ่มเจรจากับซัพพลายเออร์หลักภายในสัปดาห์นี้ เพื่อทำสัญญาซื้อล่วงหน้า 6 เดือน โดยตกลงราคาตายตัวที่ประมาณ 65 ดอลลาร์ต่อบาร์เรล วิธีนี้จะช่วยให้บริษัทลดต้นทุนได้ 2-3 ล้านบาทต่อปี และไม่ต้องกังวลเรื่องราคาผันผวนที่อาจขึ้นลง 15-20% ในช่วงปลายปี",
      "risk_assessment": "ความเสี่ยงปานกลาง",
      "opportunity_level": "โอกาสดีมาก"
    }},
    {{
      "persona": "investor",
      "persona_name_th": "นักลงทุน",
      "market_situation": "หุ้นกลุ่มพลังงานลดลง 12% ในเดือนที่ผ่านมา ราคาอยู่ในจุดต่ำของรอบ",
      "power_insight": "หุ้นกลุ่มพลังงานมีโอกาสขึ้นได้ 25-30% ในอีก 6 เดือนข้างหน้า ถ้าราคาน้ำมันฟื้นตัวตามที่คาดการณ์ ตอนนี้ราคาหุ้นอยู่ในจุดต่ำสุดของรอบ และมีแนวโน้มว่าจะไม่ลงต่ำกว่านี้แล้ว เป็นจุดที่เหมาะสำหรับเริ่มสะสมหุ้น",
      "action_recommendation": "ค่อยๆ ซื้อหุ้นกลุ่มพลังงานเป็นงวดๆ ทุก 2 สัปดาห์ ประมาณ 20% ของเงินลงทุนทั้งหมด วิธีนี้จะช่วยลดความเสี่ยงจากการซื้อผิดจังหวะ และเมื่อราคาน้ำมันฟื้นตัวในช่วงต้นปีหน้า คุณอาจได้กำไร 15-25% จากการลงทุนครั้งนี้",
      "risk_assessment": "ความเสี่ยงปานกลาง",
      "opportunity_level": "โอกาสดี"
    }}
  ],
  "top_news": {{
    "title": "ข่าวหัวข้อ",
    "summary": "สรุปข่าวสั้นๆ",
    "impact_score": 85,
    "published_date": "2025-10-08",
    "image_url": "https://...",
    "link": "https://..."
  }},
  "price_forecasts": {json.dumps(price_forecasts["forecasts"][:4])}
}}"""

    system_prompt = f"You are a market analyst. Create SIMPLIFIED, ACTIONABLE insights for {name_th}. Focus on 3 user personas: SME, Supply Chain, Investor. Use research data to make specific recommendations."

    response = client.chat.completions.create(
        model=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )

    result_json = json.loads(response.choices[0].message.content)
    result = SimplifiedPopupData(**result_json)

    print(f"✅ Simplified popup generated with {len(result.recommendations)} persona recommendations")

    return result.model_dump()

# =====================================================
# Step 5: Generate Full Report HTML (Streamlined)
# =====================================================

def generate_full_report(news_scores, price_forecasts, popup_data, market_data, market_key):
    """สร้างรายงานฉบับเต็มแบบ HTML - Streamlined version"""
    config = MARKETS[market_key]
    print(f"\n📄 Generating {config['name']} full report HTML...")

    dt_context = get_current_datetime_context()

    # Use popup insights to create more focused report
    recommendations_summary = json.dumps(popup_data.get('recommendations', []), indent=2)

    prompt_text = f"""You are a senior commodity strategist creating a focused market intelligence report for {config['name_th']}.

{dt_context['context_text']}

Market Data:
- Price: {market_data['current_price']:.2f} {config['unit']} ({market_data['price_change_pct']:+.2f}%)
- Forecasts: {json.dumps(price_forecasts['forecasts'], indent=2)}

Persona Recommendations:
{recommendations_summary}

Top News:
{json.dumps(news_scores['news'][:10], indent=2)}

Create a FOCUSED report (6-8 sections) with:

1. **Executive Summary** (3-4 paragraphs)
2. **Market Overview** (current situation)
3. **Quarterly Forecasts** (table format)
4. **Recommendations by User Type**:
   - SME Recommendations
   - Supply Chain Recommendations
   - Investor Recommendations
5. **Risk Analysis** (top 3 risks)
6. **Action Timeline** (what to do when)

STYLE:
- Thai language
- SPECIFIC numbers, dates, actions
- Professional but concise
- Focus on "what to do" not "what is"

HTML FORMATTING:
- Use Tailwind CSS classes
- Clean, modern layout
- Color coding (bg-red-50 for risks, bg-green-50 for opportunities, bg-blue-50 for insights)
- Tables for forecasts and timelines

Return a JSON object with 'html' field containing the full HTML report."""

    class FullReportOutput(BaseModel):
        html: str

    system_prompt = f"You are a commodity strategist. Create FOCUSED, ACTIONABLE {config['name_th']} report in Thai."

    response = client.chat.completions.create(
        model=DEPLOYMENT_NAME,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt_text}
        ],
        response_format={"type": "json_object"},
        temperature=0.7
    )

    result_json = json.loads(response.choices[0].message.content)
    result = FullReportOutput(**result_json)

    print(f"✅ {config['name']} full report HTML generated")

    return result.model_dump()

# =====================================================
# Step 6: Save Data for Each Market
# =====================================================

def save_market_data(market_key, news_scores, price_forecasts, popup_data, full_report):
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
        "popup": popup_data,
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

        # Step 2: Score news (simplified)
        news_scores = score_news_with_llm(market_data, market_key)

        # Step 3: Get price forecasts (with Serper)
        price_forecasts = fetch_price_forecasts(market_key)

        # Step 4: Generate simplified popup with persona recommendations
        popup_data = generate_simplified_popup(news_scores, price_forecasts, market_data, market_key)

        # Step 5: Generate full report (streamlined)
        full_report = generate_full_report(news_scores, price_forecasts, popup_data, market_data, market_key)

        # Step 6: Save everything
        combined_data = save_market_data(market_key, news_scores, price_forecasts, popup_data, full_report)

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
    print("🚀 MARKET PULSE DATA GENERATOR V2 - PERSONA-BASED INSIGHTS")
    print("="*60)
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📊 Markets: Crude Oil, Sugar, USD/THB")
    print(f"👥 Personas: SME, Supply Chain, Investor\n")

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
