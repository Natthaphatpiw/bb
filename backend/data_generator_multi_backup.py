"""
Market Pulse Data Generator - Multi-Asset Version
ดึงข้อมูลจริงจาก yfinance + Google Serper + LLM analysis
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

# =====================================================
# Configuration
# =====================================================

# Azure OpenAI Client
client = OpenAI(
    api_key="96mrgFj29QRNDtEpmgfJLTU3dS4f5CZpXOpUDJdrTVg3jDRp1ZtLJQQJ99BDACHYHv6XJ3w3AAAAACOGohRr",
    base_url="https://ai-totrakoolk6076ai346198185670.openai.azure.com/openai/v1/"
)

SERPER_API_KEY = "1a0bb89f3e217dcd9510300f8992cf5ce1844ee5"
OUTPUT_DIR = "/Users/piw/Downloads/bb/marketpulse/frontend/public/data"

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
            "EIA crude oil price outlook 2025",
            "IEA oil market report 2025"
        ]
    },
    "sugar": {
        "symbol": "SB=F",
        "name": "Sugar",
        "name_th": "น้ำตาล",
        "unit": "USD/lb",
        "search_queries": [
            "sugar price forecast 2025 2026",
            "sugar market outlook Q3 Q4 2025",
            "global sugar production forecast 2025",
            "Brazil India sugar export forecast 2025"
        ]
    },
    "usd_thb": {
        "symbol": "THB=X",
        "name": "USD/THB",
        "name_th": "อัตราแลกเปลี่ยน ดอลลาร์/บาท",
        "unit": "THB",
        "search_queries": [
            "USD THB forecast 2025 2026",
            "Thai Baht exchange rate outlook 2025",
            "Bank of Thailand policy rate 2025",
            "Thailand tourism FDI forecast 2025"
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
        'thai_date': now.strftime('%d %B %Y'),
        'weekday': now.strftime('%A'),
        'week_of_year': now.isocalendar()[1],
        'quarter': f"Q{(now.month-1)//3 + 1}/{now.year % 100}",
        'context_text': f"""
TODAY'S DATE & TIME CONTEXT:
- Current Date: {now.strftime('%Y-%m-%d (%A)')}
- Current Time: {now.strftime('%H:%M:%S')} (Thailand time)
- Quarter: Q{(now.month-1)//3 + 1}/2025
- Week: Week {now.isocalendar()[1]} of 2025

IMPORTANT: Use this date for ALL time-sensitive recommendations:
- "ภายใน 3 วันทำการ" means by {(now + timedelta(days=3)).strftime('%Y-%m-%d')}
- "สัปดาห์นี้" means by {(now + timedelta(days=7-now.weekday())).strftime('%Y-%m-%d')}
- "ภายในเดือนนี้" means by {now.strftime('%Y-%m-')}{__import__('calendar').monthrange(now.year, now.month)[1]}
"""
    }

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

    prompt = f"""You are a {config['name_th']} market analyst. Analyze these news articles and score their impact.

{dt_context['context_text']}

News Articles:
{news_summary}

Task:
For EACH news article, provide:
1. A brief summary (1-2 sentences in Thai)
2. Impact score (0-100) for THREE regions:
   - Global: Impact on global {config['name']} markets
   - Asia: Impact on Asian markets (Japan, Korea, China, India)
   - Thailand: Impact specifically on Thailand
3. Reason for each score (1 sentence in Thai)

Scoring Guidelines:
- 90-100: Major impact, immediate price movement expected
- 70-89: Significant impact, medium-term effects
- 40-69: Moderate impact, indirect effects
- 0-39: Minor impact, limited effects

Response Format:
{{
  "news": [
    {{
      "newsId": "2025-01-05-1",
      "title": "original title",
      "summary": "สรุปข่าวภาษาไทย",
      "publishedDate": "2025-01-05T10:30:00",
      "imageUrl": "url or empty",
      "link": "url",
      "scores": [
        {{"region": "global", "score": 95, "reason": "เหตุผลภาษาไทย"}},
        {{"region": "asia", "score": 80, "reason": "เหตุผลภาษาไทย"}},
        {{"region": "thailand", "score": 75, "reason": "เหตุผลภาษาไทย"}}
      ]
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {
                "role": "system",
                "content": f"You are a financial analyst specialized in {config['name']} markets. Respond ONLY with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    print(f"✅ Scored {len(result['news'])} news articles")

    return result

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

    prompt = f"""Extract {config['name']} price forecasts from these search results.

Search Results:
{search_summary}

Task:
Find price forecasts for Q3/2025, Q4/2025, Q1/2026, Q2/2026.
Return at least 4 forecasts (one for each quarter).

Response Format:
{{
  "forecasts": [
    {{
      "quarter": "Q3/25",
      "date": "2025-08-15",
      "price_forecast": "appropriate price format for {config['unit']}",
      "source": "source name"
    }},
    {{
      "quarter": "Q4/25",
      "date": "2025-11-15",
      "price_forecast": "appropriate price format",
      "source": "source name"
    }},
    {{
      "quarter": "Q1/26",
      "date": "2026-02-15",
      "price_forecast": "appropriate price format",
      "source": "source name"
    }},
    {{
      "quarter": "Q2/26",
      "date": "2026-05-15",
      "price_forecast": "appropriate price format",
      "source": "source name"
    }}
  ]
}}

If exact forecasts not found, make reasonable estimates based on trends mentioned.
"""

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a financial analyst. Extract price forecasts and respond with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)
    print(f"✅ Found {len(result['forecasts'])} quarterly forecasts")

    return result

# =====================================================
# Step 4: Generate Pop-up Analysis
# =====================================================

def generate_popup_analysis(news_scores, price_forecasts, market_data, market_key):
    """สร้างการวิเคราะห์สำหรับ Pop-up Modal"""
    config = MARKETS[market_key]
    print(f"\n🎯 Generating {config['name']} pop-up analysis...")

    news_items = news_scores["news"]
    dt_context = get_current_datetime_context()

    prompt = f"""You are a market intelligence analyst for {config['name_th']} ({config['name']}) markets.

{dt_context['context_text']}

Current Market Data:
- Price: {market_data['current_price']:.2f} {config['unit']}
- Change: {market_data['price_change_pct']:+.2f}%

Price Forecasts:
{json.dumps(price_forecasts['forecasts'], indent=2)}

Top News (sorted by impact):
{json.dumps(news_items[:10], indent=2)}

Task:
Create market analysis for 3 regions: Global, Asia, Thailand.

For EACH region, provide:
1. dailySummary: Punchy 2-3 sentence summary in Thai (ใช้ภาษาที่กระชับ เน้นตัวเลขและข้อเท็จจริง)
2. actionableInsight: What to do next (1 sentence with specific timeline)
3. competitorStrategy: What major players are doing NOW (1-2 sentences)
4. ourRecommendedAction: VERY SPECIFIC action with EXACT DATES (use TODAY's date {dt_context['date']} as reference)
   - Example: "ล็อคราคา 30% ของ demand ภายในวันที่ 10 ตุลาคม 2025"
   - Must include EXACT DATE, not just "ภายใน 3 วัน"
5. keySignals: 2 key market signals [{{"title": "xxx", "value": "xxx"}}]
6. topNews: Top 2-3 news with highest impact for this region

Style:
- Direct, data-driven, professional
- Use numbers and specifics
- Like Bloomberg or Reuters analysis
- Thai language

Response Format:
{{
  "regionalAnalysis": [
    {{
      "region": "global",
      "dailySummary": "...",
      "actionableInsight": "...",
      "competitorStrategy": "...",
      "ourRecommendedAction": "...",
      "keySignals": [
        {{"title": "Signal name", "value": "ค่าที่สำคัญ"}},
        {{"title": "Signal name 2", "value": "ค่าที่สำคัญ"}}
      ],
      "topNews": [
        {{
          "newsId": "2025-01-05-1",
          "headline": "...",
          "summary": "...",
          "impactScore": 95
        }}
      ]
    }},
    {{
      "region": "asia",
      ...
    }},
    {{
      "region": "thailand",
      ...
    }}
  ]
}}
"""

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a market analyst. Provide concise, data-driven analysis in Thai. Respond with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)

    # รวมข้อมูลทั้งหมด
    popup_data = {
        "currentPrice": market_data['current_price'],
        "priceChange": market_data['price_change'],
        "priceChangePercent": market_data['price_change_pct'],
        "lastUpdate": market_data['last_update'],
        "regionalAnalysis": result['regionalAnalysis'],
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

    prompt = f"""You are a senior commodity strategist at Goldman Sachs with 20+ years experience in {config['name_th']} ({config['name']}) markets.

{dt_context['context_text']}

Create a COMPREHENSIVE, IN-DEPTH {config['name_th']} market intelligence report (equivalent to 8-10 pages).

Market Data:
- Price: {market_data['current_price']:.2f} {config['unit']} ({market_data['price_change_pct']:+.2f}%)
- Forecasts: {json.dumps(price_forecasts['forecasts'], indent=2)}
- Regional Analysis: {json.dumps(popup_analysis['regionalAnalysis'], indent=2)}
- News: {json.dumps(news_scores['news'][:15], indent=2)}

CRITICAL: This is a PREMIUM intelligence product worth $10,000. Make it ACTIONABLE and SPECIFIC.

Required Sections (ALL must be DETAILED):

1. **Executive Summary** (4-5 paragraphs)
   - ONE critical decision for this week with exact timing
   - Top 3 risks: probability (%), financial impact (THB), mitigation
   - 7-day action plan with checkpoints

2. **Market Situation Deep Dive** (substantial)
   - Supply factors with specific numbers
   - Demand drivers with data
   - Key market dynamics
   - Price influencers

3. **Regional Analysis** (COMPREHENSIVE for each):
   - Global (5-6 paragraphs)
   - Asia (5-6 paragraphs)
   - Thailand (5-6 paragraphs)

4. **Quarterly Forecasts** (detailed for each Q)
   - Price targets with scenarios
   - Key drivers
   - Upside/downside risks

5. **Strategic Action Plan** (VERY SPECIFIC WITH EXACT DATES):
   **Immediate Actions (Next 7 days from TODAY {dt_context['date']}):**
   - State EXACT deadline dates (e.g., "ภายในวันที่ 10 ตุลาคม 2025")

   Example format:
   "วันนี้ ({dt_context['date']}): วิเคราะห์ current exposure
    วันที่ 8 ต.ค. 2025: ประชุมทีม procurement
    วันที่ 10 ต.ค. 2025: ส่งคำสั่งซื้อ 40%"

6. **Risk Matrix** (table format)

7. **Competitive Intelligence**

8. **Financial Impact Scenarios**

STYLE REQUIREMENTS:
- Write in Thai (ภาษาไทย)
- Be SPECIFIC: exact numbers, percentages, dates, volumes
- Be ACTIONABLE: every insight → concrete action
- Avoid theory: focus on "what to do"

HTML FORMATTING:
- Use Tailwind CSS classes
- Professional layout with proper spacing
- Color coding for emphasis

Response Format:
{{
  "html": "FULL HTML HERE - MUST BE COMPREHENSIVE AND DETAILED"
}}
"""

    response = client.chat.completions.create(
        model="gpt-5-mini",
        messages=[
            {
                "role": "system",
                "content": f"You are a senior commodity strategist. Create COMPREHENSIVE, ACTIONABLE {config['name_th']} market intelligence reports in Thai. Be SPECIFIC with numbers, dates, and actions. Respond with valid JSON containing detailed HTML."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        max_completion_tokens=4000,
        response_format={"type": "json_object"}
    )

    try:
        result = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON parsing error: {e}")
        result = {
            "html": f"<div class='p-8'><h1 class='text-2xl font-bold mb-4'>รายงานตลาด{config['name_th']}</h1><p>กำลังสร้างรายงานฉบับเต็ม...</p></div>"
        }

    print(f"✅ {config['name']} full report HTML generated")

    return result

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
    print("🚀 MARKET PULSE DATA GENERATOR - MULTI ASSET")
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
