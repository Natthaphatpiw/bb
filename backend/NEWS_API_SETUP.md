# การตั้งค่า NewsAPI สำหรับระบบข่าว

## 1. ขั้นตอนการสมัคร NewsAPI

1. ไปที่ https://newsapi.org/
2. คลิก "Get API Key"
3. สมัครสมาชิก (ฟรี)
4. คัดลอก API Key ที่ได้รับ

## 2. การตั้งค่า Backend

### สร้างไฟล์ .env

```bash
cd marketpulse/backend
cp .env.example .env
```

### แก้ไขไฟล์ .env

เปิดไฟล์ `.env` และเพิ่ม API Key:

```env
NEWS_API_KEY=YOUR_API_KEY_HERE
```

## 3. ติดตั้ง Dependencies

```bash
pip install -r requirements.txt
```

## 4. รัน Backend Server

```bash
cd marketpulse/backend
python -m uvicorn app.main:app --reload
```

## 5. ทดสอบ API

เปิดเบราว์เซอร์ไปที่:
- API Docs: http://localhost:8000/docs
- ทดสอบดึงข่าว: http://localhost:8000/api/v1/news/CL=F?page=1&page_size=5

## 6. API Endpoints ที่พร้อมใช้งาน

### ดึงข่าวตาม Symbol
```
GET /api/v1/news/{symbol}?page=1&page_size=5&days_back=7
```

**Parameters:**
- `symbol`: รหัสตลาด (เช่น CL=F สำหรับน้ำมันดิบ)
- `page`: หน้าที่ต้องการ (เริ่มจาก 1)
- `page_size`: จำนวนข่าวต่อหน้า (default: 5)
- `days_back`: จำนวนวันย้อนหลัง (default: 7)

**Response:**
```json
{
  "articles": [
    {
      "id": 1,
      "title": "...",
      "summary": "...",
      "url": "...",
      "image_url": "...",
      "source": "...",
      "published_at": "..."
    }
  ],
  "total": 100,
  "page": 1,
  "per_page": 5
}
```

### ค้นหาข่าวแบบกำหนดเอง
```
GET /api/v1/news/search?q=Crude%20Oil&page=1&page_size=5
```

## 7. Market Symbol Mapping

ระบบจะแปลง Symbol เป็น Query สำหรับค้นหาข่าว:

| Symbol | Query |
|--------|-------|
| CL=F | Crude Oil |
| GC=F | Gold |
| SI=F | Silver |
| BTC-USD | Bitcoin |
| ETH-USD | Ethereum |
| EURUSD=X | EUR USD |
| JPY=X | USD JPY |

## 8. ข้อจำกัดของ Free Plan

NewsAPI Free Plan มีข้อจำกัด:
- 100 requests ต่อวัน
- ข่าวย้อนหลังได้สูงสุด 1 เดือน
- ไม่สามารถใช้ในการ deploy production ได้

สำหรับ Production ควรอัพเกรดเป็น Paid Plan

## 9. การเรียงลำดับข่าว

ข่าวจะถูกเรียงตามวันที่เผยแพร่ (publishedAt) จากล่าสุดไปเก่าสุดโดยอัตโนมัติ

## 10. Troubleshooting

### ข้อผิดพลาด: "NEWS_API_KEY environment variable is not set"
- ตรวจสอบว่าได้สร้างไฟล์ `.env` แล้ว
- ตรวจสอบว่าได้ใส่ค่า `NEWS_API_KEY` ในไฟล์ `.env`
- Restart backend server

### ข้อผิดพลาด: "Failed to fetch news from NewsAPI"
- ตรวจสอบ API Key ว่าถูกต้อง
- ตรวจสอบว่ายังไม่เกินโควต้าของ Free Plan
- ตรวจสอบ internet connection