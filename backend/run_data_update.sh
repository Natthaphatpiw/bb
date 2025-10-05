#!/bin/bash

# Market Pulse Data Update Script
# รัน data_generator.py เพื่ออัปเดตข้อมูลล่าสุด

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=============================================="
echo "Market Pulse Data Update"
echo "Started at: $(date)"
echo "=============================================="

# Activate virtual environment
source venv/bin/activate

# Run data generator
python data_generator.py

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Data update completed successfully"
    echo "Finished at: $(date)"
else
    echo ""
    echo "❌ Data update failed"
    echo "Finished at: $(date)"
    exit 1
fi

echo "=============================================="
