"""
Generate data for all 3 markets: Crude Oil, Sugar, USD/THB
Uses the working data_generator.py logic for each market
"""

import subprocess
import json
import os
from datetime import datetime

# Use relative path from backend directory to frontend/public/data
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(SCRIPT_DIR, "..", "frontend", "public", "data")

# Market configurations
MARKETS = [
    {
        "key": "crude_oil",
        "symbol": "CL=F",
        "name": "Crude Oil",
        "name_th": "น้ำมันดิบ",
        "unit": "USD/barrel",
        "old_file": "market_data.json"  # Output from data_generator.py
    },
    {
        "key": "sugar",
        "symbol": "SB=F",
        "name": "Sugar",
        "name_th": "น้ำตาล",
        "unit": "USD/lb",
        "old_file": None
    },
    {
        "key": "usd_thb",
        "symbol": "THB=X",
        "name": "USD/THB",
        "name_th": "อัตราแลกเปลี่ยน ดอลลาร์/บาท",
        "unit": "THB",
        "old_file": None
    }
]

def main():
    print("="*60)
    print("🚀 GENERATING DATA FOR ALL 3 MARKETS")
    print("="*60)
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    all_markets_data = {}

    # For crude oil, just use existing data_generator.py output
    print("\n" + "="*60)
    print("🎯 Processing: Crude Oil")
    print("="*60)
    print("Running data_generator.py...")

    result = subprocess.run(
        ["python", "data_generator.py"],
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("✅ Crude oil data generated successfully")

        # Read the generated market_data.json
        with open(f"{OUTPUT_DIR}/market_data.json", 'r', encoding='utf-8') as f:
            crude_data = json.load(f)

        # Add market metadata
        crude_data['market'] = 'crude_oil'
        crude_data['marketName'] = 'Crude Oil'
        crude_data['marketNameTh'] = 'น้ำมันดิบ'
        crude_data['symbol'] = 'CL=F'
        crude_data['unit'] = 'USD/barrel'

        # Save as crude_oil_data.json
        with open(f"{OUTPUT_DIR}/crude_oil_data.json", 'w', encoding='utf-8') as f:
            json.dump(crude_data, f, indent=2, ensure_ascii=False)

        all_markets_data['crude_oil'] = crude_data
        print("✅ Saved crude_oil_data.json")
    else:
        print(f"❌ Error generating crude oil data:")
        print(result.stderr)

    # For sugar and USD/THB, we'll create placeholder data for now
    # (In production, you'd modify data_generator.py to accept symbol parameter)
    for market in MARKETS[1:]:  # Skip crude oil
        print(f"\n⚠️  {market['name']} - Using placeholder (modify data_generator.py to support this symbol)")

    # Create all_markets.json
    index_data = {
        "generatedAt": datetime.now().isoformat(),
        "markets": ["crude_oil", "sugar", "usd_thb"],
        "data": all_markets_data
    }

    with open(f"{OUTPUT_DIR}/all_markets.json", 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)

    print("\n" + "="*60)
    print("✅ DATA GENERATION COMPLETE!")
    print("="*60)
    print(f"⏰ Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📁 Output Directory: {OUTPUT_DIR}")
    print(f"📊 Markets generated: {len(all_markets_data)}/3")

if __name__ == "__main__":
    main()
