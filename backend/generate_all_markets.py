"""
Market Pulse Data Generator
ดึงข้อมูลจริงจาก yfinance + Google Serper + LLM analysis
สร้างข้อมูลทั้งหมดสำหรับ frontend
"""

import yfinance as yf
import http.client
import json
from datetime import datetime
from openai import OpenAI
from pydantic import BaseModel
from typing import List
import os

# =====================================================
# Configuration
# =====================================================



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
- "ภายใน 3 วันทำการ" means by {(now + __import__('datetime').timedelta(days=3)).strftime('%Y-%m-%d')}
- "สัปดาห์นี้" means by {(now + __import__('datetime').timedelta(days=7-now.weekday())).strftime('%Y-%m-%d')}
- "ภายในเดือนนี้" means by {now.strftime('%Y-%m-')}{__import__('calendar').monthrange(now.year, now.month)[1]}
"""
    }

# =====================================================
# Pydantic Models
# =====================================================

class NewsScore(BaseModel):
    """คะแนน impact ของข่าวต่อแต่ละภูมิภาค"""
    newsId: str
    title: str
    summary: str
    publishedDate: str
    imageUrl: str
    link: str
    scores: List[dict]  # [{"region": "global", "score": 95, "reason": "xxx"}]

class NewsScoreList(BaseModel):
    """รายการข่าวทั้งหมดพร้อมคะแนน"""
    news: List[NewsScore]

class PriceForecast(BaseModel):
    """พยากรณ์ราคาแต่ละไตรมาส"""
    quarter: str  # "Q3/25"
    date: str  # "2025-08-15"
    price_forecast: str  # "$72-75"
    source: str

class PriceForecastList(BaseModel):
    """รายการพยากรณ์ราคาทั้งหมด"""
    forecasts: List[PriceForecast]

class RegionalAnalysis(BaseModel):
    """การวิเคราะห์ตามภูมิภาค"""
    region: str
    dailySummary: str
    actionableInsight: str
    competitorStrategy: str
    ourRecommendedAction: str
    keySignals: List[dict]
    topNews: List[dict]  # ข่าว 2-3 อันดับแรกที่มี impact สูงสุด

class PopupAnalysis(BaseModel):
    """ข้อมูลทั้งหมดสำหรับ Pop-up Modal"""
    currentPrice: float
    priceChange: float
    priceChangePercent: float
    lastUpdate: str
    regionalAnalysis: List[RegionalAnalysis]
    quarterlyForecasts: List[PriceForecast]

class FullReport(BaseModel):
    """รายงานฉบับเต็ม HTML format"""
    html: str

# =====================================================
# Step 1: Fetch News from yfinance
# =====================================================

def fetch_crude_oil_news():
    """ดึงข่าวน้ำมันดิบจาก yfinance"""
    print("📰 Fetching crude oil news from yfinance...")

    cl = yf.Ticker('CL=F')

    # ดึงข้อมูลราคา
    hist = cl.history(period='5d')
    current_price = hist['Close'].iloc[-1]
    prev_price = hist['Close'].iloc[-2]
    price_change = current_price - prev_price
    price_change_pct = (price_change / prev_price) * 100

    # ดึงข่าว
    news = cl.news

    print(f"✅ Found {len(news)} news articles")
    print(f"💰 Current Price: ${current_price:.2f} ({price_change_pct:+.2f}%)")

    return {
        "news": news,
        "current_price": current_price,
        "price_change": price_change,
        "price_change_pct": price_change_pct,
        "last_update": datetime.now().isoformat()
    }

# =====================================================
# Step 2: Score News with LLM
# =====================================================

def score_news_with_llm(news_data):
    """ให้ LLM ให้คะแนน impact ของข่าวต่อแต่ละภูมิภาค"""
    print("\n🤖 Scoring news with LLM...")

    news_items = news_data["news"]
    dt_context = get_current_datetime_context()

    # สร้าง prompt
    news_summary = ""
    for idx, news in enumerate(news_items[:20], 1):  # จำกัดไว้ 20 ข่าวแรก
        content = news.get('content', news)  # Support both old and new format
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

    print(f"📝 Processing {len(news_items)} news articles...")
    print(f"Sample news title: {(news_items[0].get('content', {}).get('title') if news_items else 'None')}")

    prompt = f"""You are a crude oil market analyst. Analyze these news articles and score their impact.

{dt_context['context_text']}

News Articles:
{news_summary}

Task:
For EACH news article, provide:
1. A brief summary (1-2 sentences in Thai)
2. Impact score (0-100) for THREE regions:
   - Global: Impact on global crude oil markets
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
                "content": "You are a financial analyst specialized in crude oil markets. Respond ONLY with valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)

    print(f"✅ Scored {len(result['news'])} news articles")

    return result

# =====================================================
# Step 3: Fetch Price Forecasts
# =====================================================

def fetch_price_forecasts():
    """ดึงพยากรณ์ราคาจาก Google Serper + LLM"""
    print("\n📊 Fetching price forecasts...")

    conn = http.client.HTTPSConnection("google.serper.dev")

    queries = [
        "crude oil price forecast Q3 2025 Q4 2025",
        "WTI crude oil forecast 2025 2026",
        "EIA crude oil price outlook 2025",
        "IEA oil market report 2025"
    ]

    all_results = []

    for query in queries:
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

    prompt = f"""Extract crude oil price forecasts from these search results.

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
      "price_forecast": "$72",
      "source": "EIA"
    }},
    {{
      "quarter": "Q4/25",
      "date": "2025-11-15",
      "price_forecast": "$68",
      "source": "EIA"
    }},
    {{
      "quarter": "Q1/26",
      "date": "2026-02-15",
      "price_forecast": "$70",
      "source": "Bloomberg"
    }},
    {{
      "quarter": "Q2/26",
      "date": "2026-05-15",
      "price_forecast": "$73",
      "source": "IEA"
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
        temperature=0.2,
        response_format={"type": "json_object"}
    )

    result = json.loads(response.choices[0].message.content)

    print(f"✅ Found {len(result['forecasts'])} quarterly forecasts")

    return result

# =====================================================
# Step 4: Generate Pop-up Analysis
# =====================================================

def generate_popup_analysis(news_scores, price_forecasts, market_data):
    """สร้างการวิเคราะห์สำหรับ Pop-up Modal"""
    print("\n🎯 Generating pop-up analysis...")

    # จัดกลุ่มข่าวตาม impact score สูงสุดในแต่ละภูมิภาค
    news_items = news_scores["news"]
    dt_context = get_current_datetime_context()

    # สร้าง prompt สำหรับ LLM
    prompt = f"""You are a market intelligence analyst for crude oil markets.

{dt_context['context_text']}

Current Market Data:
- Price: ${market_data['current_price']:.2f}
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
   - Example: "ประชุมทีม procurement ในวันที่ 8 ต.ค. 2025 เพื่อ..."
   - Must include EXACT DATE, not just "ภายใน 3 วัน"
5. keySignals: 2 key market signals [{{ "title": "xxx", "value": "xxx" }}]
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
        {{"title": "OPEC+ Production", "value": "ลดกำลังการผลิต 1.2M bpd"}},
        {{"title": "US Inventory", "value": "ลดลง 2.5M barrels"}}
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
        temperature=0.4,
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

    print("✅ Pop-up analysis generated")

    return popup_data

# =====================================================
# Step 5: Generate Full Report HTML
# =====================================================

def generate_full_report(news_scores, price_forecasts, popup_analysis, market_data):
    """สร้างรายงานฉบับเต็มแบบ HTML"""
    print("\n📄 Generating full report HTML...")

    dt_context = get_current_datetime_context()

    prompt = f"""You are a senior commodity strategist at Goldman Sachs with 20+ years experience.

{dt_context['context_text']}

Create a COMPREHENSIVE, IN-DEPTH crude oil market intelligence report (equivalent to 8-10 pages).

Market Data:
- Price: ${market_data['current_price']:.2f} ({market_data['price_change_pct']:+.2f}%)
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
   - Supply: OPEC+ quotas, US shale production rates, inventory levels (specific numbers)
   - Demand: China GDP growth impact, India import volumes, Europe recovery
   - Geopolitics: Middle East tensions (probability-weighted scenarios)
   - Refining: Crack spreads, maintenance schedules, utilization rates

3. **Regional Analysis** (COMPREHENSIVE for each):

   **Global (5-6 paragraphs):**
   - OPEC+ policy: production cuts impact on supply/demand balance
   - US Strategic Reserve: release probability and volume estimates
   - Brent-WTI spread: arbitrage opportunities
   - Shipping rates and logistics constraints

   **Asia (5-6 paragraphs):**
   - China: refinery runs, teapot refiners, demand elasticity
   - India: subsidy burden, import dependency, alternatives
   - Japan/Korea: refinery margins, product exports
   - Singapore: trading hub dynamics, bunker fuel demand

   **Thailand (5-6 paragraphs):**
   - PTT pricing formula: time lags, pass-through mechanics
   - Government subsidies: fiscal sustainability, phase-out timeline
   - Corporate strategies: CP All fuel surcharge, logistics optimization
   - Renewable penetration: EV adoption, biodiesel mandates

4. **Quarterly Forecasts** (detailed for each Q)
   - Price targets: base/bull/bear cases with support/resistance
   - Drivers: seasonal factors, refinery turnarounds, weather
   - Upside risks: supply disruptions, demand surprises
   - Downside risks: demand destruction, supply surges

5. **Strategic Action Plan** (VERY SPECIFIC WITH EXACT DATES):

   **Immediate Actions (Next 7 days from TODAY {dt_context['date']}):**
   - State EXACT deadline dates (e.g., "ภายในวันที่ 10 ตุลาคม 2025" not just "3 วัน")
   - Procurement: "ล็อค 40% ของ Q4 demand ที่ราคา $XX-XX ภายในวันที่ [EXACT DATE]"
   - Hedging: "ติดต่อ broker ภายในวันที่ [EXACT DATE], execute ภายในวันที่ [EXACT DATE]"
   - Meetings: "นัดประชุม supplier ในวันที่ [EXACT DATE], เป้าหมาย: ..."

   Example format:
   "วันนี้ ({dt_context['date']}): วิเคราะห์ current exposure
    วันที่ 8 ต.ค. 2025: ประชุมทีม procurement
    วันที่ 10 ต.ค. 2025: ส่งคำสั่งซื้อ 40% ของ Q4 demand
    วันที่ 12 ต.ค. 2025: Review ผลการเจรจากับ suppliers"

   **Short-term (30 days - by {dt_context['date'][:7]}-XX):**
   - Give exact dates within the month
   - Weekly milestones with specific dates

   **Medium-term (90 days - by YYYY-MM-DD):**
   - Monthly milestones with target dates

6. **Risk Matrix** (table format):
   | Risk | Probability | Impact (THB M) | Mitigation |
   | Middle East war | 25% | 150-200M | Hedge 50% exposure |
   | Demand collapse | 15% | 80-120M | Flexible contracts |
   | OPEC+ surplus | 30% | 40-60M | Spot market access |

7. **Competitive Intelligence**:
   - What are Shell, PTT, Chevron doing? (procurement strategies)
   - Market share shifts and implications
   - First-mover advantages in alternative fuels

8. **Financial Impact Scenarios**:
   - If price → $80: "ต้นทุน +18%, Gross Margin -3.2pp, EBITDA -12%"
   - If price → $70: "ต้นทุน +8%, Gross Margin -1.5pp, EBITDA -5%"
   - If price → $60: "ต้นทุน -2%, Gross Margin +0.8pp, EBITDA +3%"

STYLE REQUIREMENTS:
- Write in Thai (ภาษาไทย) - professional business Thai
- Be SPECIFIC: use exact numbers, percentages, dates, volumes
- Be ACTIONABLE: every insight → concrete action
- Avoid theory: focus on "what to do" not "what might happen"
- Use business examples: "หาก PTT ขึ้นราคา 8% บริษัทขนส่งที่ไม่ได้ hedge จะขาดทุนเฉลี่ย 2.3M/month"

HTML FORMATTING:
- Use Tailwind CSS classes
- Professional layout: max-w-5xl, proper spacing (space-y-8)
- Typography: text-3xl (h1), text-2xl (h2), text-xl (h3), text-base (body)
- Tables: border, alternating rows (odd:bg-gray-50)
- Color coding: bg-red-50 (risks), bg-green-50 (opportunities), bg-blue-50 (insights)
- Sections: border-b, pb-6, mb-8

Example structure:
<div class='max-w-5xl mx-auto space-y-8'>
  <section class='border-b-2 border-gray-300 pb-6'>
    <h1 class='text-3xl font-bold mb-4'>รายงานวิเคราะห์ตลาดน้ำมันดิบฉบับเต็ม</h1>
    <div class='bg-blue-50 border-l-4 border-blue-600 p-6 mb-6'>
      <h2 class='text-2xl font-bold text-blue-900 mb-3'>สรุปผู้บริหาร</h2>
      <div class='space-y-3 text-blue-800'>
        ... 4-5 DETAILED PARAGRAPHS ...
      </div>
    </div>
  </section>
  ... MORE COMPREHENSIVE SECTIONS ...
</div>

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
                "content": "You are a senior commodity strategist at Goldman Sachs. Create COMPREHENSIVE, ACTIONABLE market intelligence reports in Thai. Minimum 8-10 page equivalent. Be SPECIFIC with numbers, dates, and actions. Respond with valid JSON containing detailed HTML. Make sure to properly escape all quotes and newlines in the HTML."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.6,
        max_tokens=4000,
        response_format={"type": "json_object"}
    )

    try:
        result = json.loads(response.choices[0].message.content)
    except json.JSONDecodeError as e:
        print(f"⚠️  JSON parsing error: {e}")
        print("Trying to fix JSON...")
        # Try to fix common JSON issues
        content = response.choices[0].message.content
        # Replace problematic newlines in HTML
        content = content.replace('\n', '\\n').replace('\r', '\\r')
        try:
            result = json.loads(content)
        except:
            # Fallback: create minimal report
            print("⚠️  Using fallback minimal report")
            result = {
                "html": "<div class='p-8'><h1 class='text-2xl font-bold mb-4'>รายงานตลาดน้ำมันดิบ</h1><p>กำลังสร้างรายงานฉบับเต็ม...</p></div>"
            }

    print("✅ Full report HTML generated")

    return result

# =====================================================
# Step 6: Save All Data
# =====================================================

def save_data(news_scores, price_forecasts, popup_analysis, full_report):
    """บันทึกข้อมูลทั้งหมดเป็นไฟล์ JSON"""
    print("\n💾 Saving data files...")

    # สร้าง directory ถ้ายังไม่มี
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # 1. News with scores
    with open(f"{OUTPUT_DIR}/news_scores.json", 'w', encoding='utf-8') as f:
        json.dump(news_scores, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved: news_scores.json")

    # 2. Price forecasts
    with open(f"{OUTPUT_DIR}/price_forecasts.json", 'w', encoding='utf-8') as f:
        json.dump(price_forecasts, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved: price_forecasts.json")

    # 3. Pop-up analysis
    with open(f"{OUTPUT_DIR}/popup_analysis.json", 'w', encoding='utf-8') as f:
        json.dump(popup_analysis, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved: popup_analysis.json")

    # 4. Full report
    with open(f"{OUTPUT_DIR}/full_report.json", 'w', encoding='utf-8') as f:
        json.dump(full_report, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved: full_report.json")

    # 5. Combined data (สำหรับ frontend ดึงครั้งเดียว)
    combined = {
        "generatedAt": datetime.now().isoformat(),
        "news": news_scores,
        "forecasts": price_forecasts,
        "popup": popup_analysis,
        "report": full_report
    }

    with open(f"{OUTPUT_DIR}/market_data.json", 'w', encoding='utf-8') as f:
        json.dump(combined, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved: market_data.json (combined)")

# =====================================================
# Main Execution
# =====================================================

def main():
    """รันระบบทั้งหมด"""
    print("="*60)
    print("🚀 MARKET PULSE DATA GENERATOR")
    print("="*60)
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    try:
        # Step 1: Fetch news
        market_data = fetch_crude_oil_news()

        # Step 2: Score news
        news_scores = score_news_with_llm(market_data)

        # Step 3: Get price forecasts
        price_forecasts = fetch_price_forecasts()

        # Step 4: Generate pop-up analysis
        popup_analysis = generate_popup_analysis(news_scores, price_forecasts, market_data)

        # Step 5: Generate full report
        full_report = generate_full_report(news_scores, price_forecasts, popup_analysis, market_data)

        # Step 6: Save everything
        save_data(news_scores, price_forecasts, popup_analysis, full_report)

        print("\n" + "="*60)
        print("✅ ALL DATA GENERATED SUCCESSFULLY!")
        print("="*60)
        print(f"⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📁 Output Directory: {OUTPUT_DIR}")

    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
