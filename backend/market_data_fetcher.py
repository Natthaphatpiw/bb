"""
MarketPulse - Real Market Data Fetcher
ดึงข้อมูลตลาดจริงจาก yfinance สำหรับ Market Cards
รวมถึง: Price, Change, High, Low, Volume และ Timestamp
"""

import yfinance as yf
import json
from datetime import datetime
import os

# Use relative path from backend directory to frontend/public/data
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "data")

# Market Configurations
MARKETS = {
    "crude_oil": {
        "symbol": "CL=F",
        "name": "Crude Oil",
        "name_th": "น้ำมันดิบ",
        "currency": "USD",
        "unit": "USD/barrel",
        "category": "Energy"
    },
    "sugar": {
        "symbol": "SB=F",
        "name": "Sugar",
        "name_th": "น้ำตาล",
        "currency": "USD",
        "unit": "USD/lb",
        "category": "Agriculture"
    },
    "usd_thb": {
        "symbol": "THB=X",
        "name": "USD/THB",
        "name_th": "อัตราแลกเปลี่ยน ดอลลาร์/บาท",
        "currency": "THB",
        "unit": "THB",
        "category": "Currency"
    }
}


def fetch_market_data(market_key):
    """
    ดึงข้อมูลตลาดจริงจาก yfinance
    Returns: dict with price, change, high, low, volume, timestamp
    """
    config = MARKETS[market_key]
    print(f"\n📊 Fetching {config['name']} market data...")

    try:
        ticker = yf.Ticker(config['symbol'])

        # ดึงข้อมูลย้อนหลัง 5 วัน
        hist = ticker.history(period='5d')

        if hist.empty:
            raise ValueError(f"No data available for {config['symbol']}")

        # ข้อมูลล่าสุด
        latest = hist.iloc[-1]
        previous = hist.iloc[-2] if len(hist) > 1 else hist.iloc[-1]

        # คำนวณค่าต่างๆ
        current_price = float(latest['Close'])
        open_price = float(latest['Open'])
        high_price = float(latest['High'])
        low_price = float(latest['Low'])
        volume = float(latest['Volume']) if 'Volume' in latest and latest['Volume'] > 0 else 0

        # คำนวณการเปลี่ยนแปลงจากวันก่อน
        prev_close = float(previous['Close'])
        price_change = current_price - prev_close
        price_change_pct = (price_change / prev_close) * 100 if prev_close != 0 else 0

        # Timestamp
        last_update = datetime.now().isoformat()

        market_data = {
            "symbol": market_key.upper(),
            "yfinance_symbol": config['symbol'],
            "name": config['name'],
            "name_th": config['name_th'],
            "currency": config['currency'],
            "unit": config['unit'],
            "category": config['category'],
            "price": round(current_price, 2),
            "open": round(open_price, 2),
            "high": round(high_price, 2),
            "low": round(low_price, 2),
            "volume": int(volume),
            "change": round(price_change, 2),
            "changePercent": round(price_change_pct, 2),
            "lastUpdate": last_update,
            "dataSource": "yfinance"
        }

        print(f"✅ {config['name']}: ${current_price:.2f} ({price_change_pct:+.2f}%)")
        print(f"   High: ${high_price:.2f} | Low: ${low_price:.2f}")
        print(f"   Volume: {volume:,.0f}")

        return market_data

    except Exception as e:
        print(f"❌ Error fetching {config['name']}: {e}")
        return None


def fetch_all_markets():
    """ดึงข้อมูลทุกตลาด"""
    print("\n" + "="*60)
    print("🚀 MarketPulse - Real Market Data Fetcher")
    print("="*60)

    all_data = {
        "generatedAt": datetime.now().isoformat(),
        "dataSource": "yfinance",
        "markets": []
    }

    for market_key in MARKETS.keys():
        market_data = fetch_market_data(market_key)
        if market_data:
            all_data["markets"].append(market_data)

    return all_data


def save_to_file(data, filename="market_data.json"):
    """บันทึกข้อมูลลง JSON file"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, filename)

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Market data saved to: {output_path}")
    print(f"   Total markets: {len(data['markets'])}")
    print(f"   Generated at: {data['generatedAt']}")


def main():
    """Main function"""
    try:
        # Fetch all market data
        market_data = fetch_all_markets()

        # Save to file
        save_to_file(market_data)

        print("\n" + "="*60)
        print("✨ Market data fetch completed successfully!")
        print("="*60)

    except Exception as e:
        print(f"\n❌ Error in main process: {e}")
        raise


if __name__ == "__main__":
    main()
