# Market Data Fetcher

## Overview
`market_data_fetcher.py` ดึงข้อมูลตลาดแบบ real-time จาก yfinance สำหรับแสดงบน Market Cards

## Data Included
- **Price**: ราคาปัจจุบัน
- **Change**: การเปลี่ยนแปลงจากวันก่อน
- **High/Low**: ราคาสูงสุด/ต่ำสุดของวัน
- **Volume**: ปริมาณการซื้อขาย
- **Timestamp**: เวลาที่ดึงข้อมูล

## Markets Supported
1. **Crude Oil** (CL=F) - น้ำมันดิบ
2. **Sugar** (SB=F) - น้ำตาล
3. **USD/THB** (THB=X) - อัตราแลกเปลี่ยน

## Usage

### 1. Run Manually
```bash
cd /Users/piw/Downloads/bb/marketpulse/backend
source venv/bin/activate
python market_data_fetcher.py
```

### 2. Output Location
ข้อมูลจะถูกบันทึกที่:
```
frontend/public/data/market_data.json
```

### 3. Frontend Integration
Frontend จะดึงข้อมูลจาก `/data/market_data.json` อัตโนมัติ

## Data Structure

```json
{
  "generatedAt": "2025-10-07T23:31:33.686510",
  "dataSource": "yfinance",
  "markets": [
    {
      "symbol": "CRUDE_OIL",
      "name": "Crude Oil",
      "price": 61.44,
      "high": 62.04,
      "low": 60.72,
      "volume": 151982,
      "change": -0.25,
      "changePercent": -0.41,
      "lastUpdate": "2025-10-07T23:31:34.453018"
    }
  ]
}
```

## Automation (Optional)

### Setup Cron Job
เพื่อให้ข้อมูลอัพเดทอัตโนมัติทุก 5 นาที:

```bash
# Edit crontab
crontab -e

# Add this line (adjust path as needed)
*/5 * * * * cd /Users/piw/Downloads/bb/marketpulse/backend && source venv/bin/activate && python market_data_fetcher.py >> /tmp/market_data_fetcher.log 2>&1
```

## Troubleshooting

### Error: ModuleNotFoundError
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Install yfinance if needed
pip install yfinance
```

### Error: No data available
- ตรวจสอบ internet connection
- yfinance อาจมีปัญหาชั่วคราว ลองรันอีกครั้ง

## Related Files
- **Backend**: `/backend/market_data_fetcher.py`
- **Frontend**: `/frontend/app/page.tsx` (main landing page)
- **Component**: `/frontend/components/market/MarketCard.tsx`
- **Output**: `/frontend/public/data/market_data.json`
