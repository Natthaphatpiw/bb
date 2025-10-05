#!/bin/bash

# Script to generate data for all 3 markets
# Uses data_generator.py with different symbols

cd "$(dirname "$0")"
source venv/bin/activate

OUTPUT_DIR="../frontend/public/data"

echo "======================================================================"
echo "🚀 GENERATING DATA FOR ALL 3 MARKETS"
echo "======================================================================"
echo "⏰ Start: $(date '+%Y-%m-%d %H:%M:%S')"
echo

# Generate Crude Oil (CL=F)
echo "======================================================================"
echo "🎯 1/3: Crude Oil (CL=F)"
echo "======================================================================"
python data_generator.py
if [ $? -eq 0 ]; then
    # Rename market_data.json to crude_oil_data.json and add metadata
    python3 << 'EOF'
import json
with open('../frontend/public/data/market_data.json', 'r') as f:
    data = json.load(f)
data['market'] = 'crude_oil'
data['marketName'] = 'Crude Oil'
data['marketNameTh'] = 'น้ำมันดิบ'
data['symbol'] = 'CL=F'
data['unit'] = 'USD/barrel'
with open('../frontend/public/data/crude_oil_data.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("✅ Saved crude_oil_data.json")
EOF
else
    echo "❌ Failed to generate Crude Oil data"
fi

echo
echo "======================================================================"
echo "✅ DATA GENERATION COMPLETE!"
echo "======================================================================"
echo "⏰ End: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📁 Output: $OUTPUT_DIR"
echo
echo "Note: Sugar and USD/THB require modifying data_generator.py to accept symbol parameter"
