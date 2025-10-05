# Market Pulse - Usage Guide

## ภาพรวมระบบ

ระบบ Market Pulse ประกอบด้วย 2 ส่วนหลัก:

1. **Backend (Python)**: ดึงข้อมูลจริงจาก yfinance + Google Serper + LLM analysis
2. **Frontend (Next.js)**: แสดงผลข้อมูลที่ backend generate ไว้

## วิธีการทำงาน

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Backend    │────────>│  JSON Files  │────────>│   Frontend   │
│ (Python)     │ Generate│ (public/data)│  Fetch  │  (Next.js)   │
└──────────────┘         └──────────────┘         └──────────────┘
     ▲                           │
     │                           │
     │ ทุก 12 ชม. (Production)   │
     └───────────────────────────┘
```

## ข้อมูลที่ระบบสร้าง

Backend จะสร้างไฟล์ JSON 5 ไฟล์ ใน `/frontend/public/data/`:

1. **news_scores.json** - ข่าวพร้อมคะแนน impact (Global, Asia, Thailand)
2. **price_forecasts.json** - พยากรณ์ราคา 4 ไตรมาส (Q3/25, Q4/25, Q1/26, Q2/26)
3. **popup_analysis.json** - ข้อมูลสำหรับ Pop-up Modal (regional analysis)
4. **full_report.json** - รายงานฉบับเต็มแบบ HTML
5. **market_data.json** - รวมข้อมูลทั้งหมด (combined)

## การติดตั้ง & Setup

### 1. Backend Setup

```bash
cd /Users/piw/Downloads/bb/marketpulse/backend

# สร้าง virtual environment (ถ้ายังไม่มี)
python3 -m venv venv

# Activate venv
source venv/bin/activate

# ติดตั้ง dependencies
pip install yfinance openai pydantic
```

### 2. Frontend Setup

```bash
cd /Users/piw/Downloads/bb/marketpulse/frontend

# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
```

## การรันระบบ

### วิธีที่ 1: รันด้วยมือ (สำหรับทดสอบ)

```bash
# 1. Generate ข้อมูลใหม่
cd /Users/piw/Downloads/bb/marketpulse/backend
source venv/bin/activate
python data_generator.py

# 2. รัน Frontend
cd /Users/piw/Downloads/bb/marketpulse/frontend
npm run dev

# 3. เปิด browser
# http://localhost:3000
```

### วิธีที่ 2: ใช้ Shell Script (แนะนำ)

```bash
# Generate ข้อมูลใหม่
cd /Users/piw/Downloads/bb/marketpulse/backend
./run_data_update.sh

# Frontend ยังคงรันด้วย npm run dev ตามปกติ
```

### วิธีที่ 3: ตั้ง Cron Job (Production)

สร้าง cron job สำหรับรันทุก 12 ชั่วโมง:

```bash
# เปิด crontab editor
crontab -e

# เพิ่มบรรทัดนี้ (รันทุก 12 ชม. เวลา 00:00 และ 12:00)
0 0,12 * * * /Users/piw/Downloads/bb/marketpulse/backend/run_data_update.sh >> /Users/piw/Downloads/bb/marketpulse/backend/logs/cron.log 2>&1
```

สร้างโฟลเดอร์ logs:
```bash
mkdir -p /Users/piw/Downloads/bb/marketpulse/backend/logs
```

## การใช้งาน Frontend

### หน้า Landing (/)

- แสดง Market Cards พร้อมราคาและการเปลี่ยนแปลง
- คลิกที่ Crude Oil card เพื่อเปิด Pop-up Modal
- Pop-up จะแสดง:
  - ราคาปัจจุบัน
  - การวิเคราะห์ 3 ภูมิภาค (Global, Asia, Thailand)
  - พยากรณ์ราคา 4 ไตรมาส
  - ข่าว 2-3 อันดับแรกที่มี impact สูงสุด
  - Competitor strategies & Recommended actions

### หน้า Detail (/markets/CO)

มี 3 tabs:

1. **Market Overview**
   - คำแนะนำ & แผนปฏิบัติ
   - การวิเคราะห์ทั้ง 3 ภูมิภาคพร้อมกัน (ไม่มี tabs)
   - ตารางพยากรณ์ราคา

2. **News Analysis**
   - ข่าวทั้งหมดพร้อมคะแนน impact
   - Pagination (5 ข่าวต่อหน้า)
   - แสดงคะแนน Global, Asia, Thailand
   - เหตุผลการให้คะแนน

3. **Full Report**
   - รายงานฉบับเต็มแบบ HTML
   - สไตล์เหมือนรายงานจากธนาคารหรือบริษัทที่ปรึกษาชั้นนำ

## การตรวจสอบข้อมูล

### ตรวจสอบว่าข้อมูลถูก generate แล้วหรือยัง

```bash
ls -lh /Users/piw/Downloads/bb/marketpulse/frontend/public/data/

# ควรเห็นไฟล์เหล่านี้:
# - news_scores.json
# - price_forecasts.json
# - popup_analysis.json
# - full_report.json
# - market_data.json
```

### ตรวจสอบเวลาที่ generate ล่าสุด

```bash
cat /Users/piw/Downloads/bb/marketpulse/frontend/public/data/market_data.json | grep generatedAt
```

### ดูข้อมูลที่ได้

```bash
# ดูพยากรณ์ราคา
cat /Users/piw/Downloads/bb/marketpulse/frontend/public/data/price_forecasts.json

# ดูข่าวและคะแนน (10 บรรทัดแรก)
head -30 /Users/piw/Downloads/bb/marketpulse/frontend/public/data/news_scores.json
```

## API Keys ที่ใช้

### Azure OpenAI
- ใช้สำหรับ LLM analysis
- API key อยู่ใน `data_generator.py`
- Model: `gpt-4o-mini`

### Google Serper
- ใช้สำหรับค้นหาข้อมูล price forecast
- API key อยู่ใน `data_generator.py`
- Free tier: 2,500 searches/month

### yfinance (ฟรี)
- ดึงข้อมูลราคาและข่าวน้ำมันดิบ
- ไม่ต้องใช้ API key

## Troubleshooting

### ปัญหา: Frontend ไม่แสดงข้อมูล

**วิธีแก้:**
```bash
# 1. ตรวจสอบว่ามีไฟล์ข้อมูลหรือไม่
ls /Users/piw/Downloads/bb/marketpulse/frontend/public/data/

# 2. ถ้าไม่มี ให้รัน data generator
cd /Users/piw/Downloads/bb/marketpulse/backend
source venv/bin/activate
python data_generator.py

# 3. Refresh browser (Cmd+Shift+R)
```

### ปัญหา: data_generator.py error

**วิธีแก้:**
```bash
# ตรวจสอบ dependencies
cd /Users/piw/Downloads/bb/marketpulse/backend
source venv/bin/activate
pip list | grep -E "(yfinance|openai|pydantic)"

# ถ้าไม่มี ให้ติดตั้ง
pip install yfinance openai pydantic
```

### ปัญหา: News ไม่มีรูปภาพ

**คำอธิบาย:** yfinance บางครั้งไม่ให้ imageUrl สำหรับข่าว - นี่เป็นข้อจำกัดของ API

**วิธีแก้:** ระบบจะแสดง placeholder icon แทน

### ปัญหา: Price forecast ไม่ถูกต้อง

**คำอธิบาย:** LLM วิเคราะห์จาก search results ซึ่งอาจไม่มีข้อมูล forecast ชัดเจนเสมอไป

**วิธีแก้:**
1. รัน data generator ใหม่อีกครั้ง (ผลลัพธ์อาจแตกต่าง)
2. ตรวจสอบ search results ที่ได้จาก Google Serper
3. ปรับ search queries ใน `data_generator.py` (บรรทัด 172-177)

## Performance

- **Data Generation Time:** ~1-2 นาที
- **Frontend Load Time:** < 1 วินาที (ดึงจาก JSON files)
- **Browser Memory:** ~50-100 MB
- **Data Size:** ~30-50 KB (JSON files รวมกัน)

## Production Checklist

- [ ] ตั้ง cron job สำหรับ auto-update ทุก 12 ชม.
- [ ] สร้างโฟลเดอร์ logs
- [ ] Monitor cron job logs
- [ ] Backup API keys ไว้ที่ปลอดภัย
- [ ] เปลี่ยน API keys ถ้าโพสต์ออนไลน์
- [ ] ตั้งค่า error notifications (ถ้าต้องการ)
- [ ] Test ระบบหลัง deploy

## ข้อจำกัดปัจจุบัน

1. ใช้ข้อมูลจริงเฉพาะ **Crude Oil (CO)** เท่านั้น
2. สินค้าอื่นๆ ยังใช้ mock data
3. Report HTML อาจต้องปรับ styling เพิ่มเติม
4. ยังไม่มี error handling สำหรับ API rate limits

## Next Steps (ถ้าต้องการ)

1. เพิ่มข้อมูลจริงสำหรับสินค้าอื่นๆ (Gold, Natural Gas, etc.)
2. สร้าง API endpoint ด้วย FastAPI (แทน static JSON)
3. เพิ่ม Redis cache
4. เพิ่ม real-time price updates ด้วย WebSocket
5. สร้าง admin dashboard สำหรับ monitor ระบบ

---

## ติดต่อ & Support

หากมีปัญหาหรือต้องการความช่วยเหลือ:
- ตรวจสอบ logs: `/Users/piw/Downloads/bb/marketpulse/backend/logs/`
- ดู error messages จาก `python data_generator.py`
- ตรวจสอบ browser console (F12) สำหรับ frontend errors
