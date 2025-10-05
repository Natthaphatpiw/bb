"""
Market Opportunity Briefing (MOB) API endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from datetime import datetime, timedelta
import random

router = APIRouter()

def generate_mob_for_crude_oil() -> Dict[str, Any]:
    """Generate Market Opportunity Briefing for Crude Oil"""

    current_date = datetime.now()

    return {
        "symbol": "Crude Oil (WTI)",
        "briefingDate": current_date.isoformat(),
        "title": "น้ำมันกำลังจะพุ่งแรงใน 72 ชั่วโมง - เตรียมรับมือต้นทุนพลังงานผันผวน",
        "subtitle": "สถานการณ์ตึงเครียดในช่องแคบฮอร์มุซกำลังส่งสัญญาณราคาพุ่ง",

        "impactAnalysis": {
            "global": {
                "region": "global",
                "summary": "ราคาน้ำมันดิบในตลาดโลกกำลังเผชิญแรงกดดันจากหลายปัจจัย โดยเฉพาะการตัดสินใจลดกำลังการผลิตของ OPEC+ และความตึงเครียดทางภูมิรัฐศาสตร์ในตะวันออกกลาง ส่งผลให้ราคามีแนวโน้มปรับตัวสูงขึ้นในระยะสั้น",
                "keyFactors": [
                    {
                        "factor": "OPEC+ Production Cuts",
                        "impact": "negative",
                        "description": "การลดกำลังการผลิตของ OPEC+ ส่งผลให้อุปทานน้ำมันในตลาดโลกลดลง กดดันให้ราคาปรับตัวสูงขึ้น"
                    },
                    {
                        "factor": "Geopolitical Tensions",
                        "impact": "negative",
                        "description": "สถานการณ์ความไม่แน่นอนในตะวันออกกลางและช่องแคบฮอร์มุซ เพิ่มความเสี่ยงต่อการหยุดชะงักของการขนส่งน้ำมัน"
                    },
                    {
                        "factor": "Global Demand Recovery",
                        "impact": "positive",
                        "description": "การฟื้นตัวของเศรษฐกิจโลกหลังวิกฤต COVID-19 ช่วยหนุนความต้องการใช้น้ำมันเพิ่มขึ้น"
                    }
                ],
                "economicIndicators": [
                    {
                        "indicator": "Brent Crude Price",
                        "value": "$85.40",
                        "trend": "up",
                        "description": "ราคาน้ำมันดิบเบรนท์ปรับตัวสูงขึ้น 2.3% ในสัปดาห์ที่ผ่านมา"
                    },
                    {
                        "indicator": "Global Oil Demand",
                        "value": "102.1M bpd",
                        "trend": "up",
                        "description": "ความต้องการน้ำมันโลกเพิ่มขึ้นจากการฟื้นตัวของภาคการผลิตและการเดินทาง"
                    },
                    {
                        "indicator": "OECD Inventory",
                        "value": "2,847M barrels",
                        "trend": "down",
                        "description": "สต็อกน้ำมันของ OECD ลดลงต่อเนื่อง 4 สัปดาห์"
                    }
                ],
                "outlook": "ตลาดน้ำมันโลกคาดว่าจะยังคงผันผวนในระยะสั้น โดยแนวโน้มราคามีทิศทางขาขึ้นจากปัจจัยด้านอุปทานที่จำกัด อย่างไรก็ตาม หากเศรษฐกิจโลกชะลอตัว อาจส่งผลให้ความต้องการลดลงและกดดันราคาในระยะกลาง"
            },
            "asia": {
                "region": "asia",
                "summary": "ภูมิภาคเอเชียซึ่งเป็นผู้บริโภคน้ำมันรายใหญ่ของโลก กำลังเผชิญกับความท้าทายจากราคาน้ำมันที่สูงขึ้น โดยเฉพาะประเทศที่นำเข้าน้ำมันเกือบทั้งหมด เช่น จีน อินเดีย ญี่ปุ่น และเกาหลีใต้",
                "keyFactors": [
                    {
                        "factor": "China Demand Growth",
                        "impact": "positive",
                        "description": "จีนเร่งกระตุ้นเศรษฐกิจหลังการเปิดประเทศ ส่งผลให้ความต้องการน้ำมันเพิ่มสูงขึ้น 4.2% ในไตรมาสนี้"
                    },
                    {
                        "factor": "Refinery Expansion",
                        "impact": "neutral",
                        "description": "ประเทศในเอเชียกำลังขยายกำลังการผลิตโรงกลั่นเพื่อรองรับความต้องการที่เพิ่มขึ้น"
                    },
                    {
                        "factor": "Import Dependency",
                        "impact": "negative",
                        "description": "การพึ่งพาการนำเข้าน้ำมันสูงถึง 85% ทำให้ภูมิภาคมีความเสี่ยงจากความผันผวนของราคา"
                    }
                ],
                "economicIndicators": [
                    {
                        "indicator": "Asia Oil Imports",
                        "value": "28.5M bpd",
                        "trend": "up",
                        "description": "ปริมาณการนำเข้าน้ำมันของเอเชียเพิ่มขึ้น 3.1% จากปีก่อน"
                    },
                    {
                        "indicator": "Singapore Fuel Oil",
                        "value": "$520/ton",
                        "trend": "up",
                        "description": "ราคาน้ำมันเชื้อเพลิงในสิงคโปร์ปรับตัวสูงขึ้น"
                    },
                    {
                        "indicator": "Regional Inflation",
                        "value": "3.8%",
                        "trend": "up",
                        "description": "อัตราเงินเฟ้อในภูมิภาคเอเชียเพิ่มขึ้นจากต้นทุนพลังงานที่สูงขึ้น"
                    }
                ],
                "outlook": "ภูมิภาคเอเชียจะต้องเผชิญกับต้นทุนพลังงานที่สูงขึ้นในระยะสั้น ซึ่งอาจส่งผลกระทบต่อการฟื้นตัวของเศรษฐกิจและกดดันเงินเฟ้อให้สูงขึ้น รัฐบาลหลายประเทศอาจต้องพิจารณามาตรการช่วยเหลือเพื่อบรรเทาผลกระทบ"
            },
            "thailand": {
                "region": "thailand",
                "summary": "ประเทศไทยซึ่งนำเข้าน้ำมันดิบเกือบ 100% กำลังเผชิญแรงกดดันจากราคาน้ำมันที่สูงขึ้น ส่งผลกระทบโดยตรงต่อต้นทุนการผลิต ค่าขนส่ง และอัตราเงินเฟ้อโดยรวม",
                "keyFactors": [
                    {
                        "factor": "Import Costs",
                        "impact": "negative",
                        "description": "ต้นทุนการนำเข้าน้ำมันดิบเพิ่มขึ้นประมาณ 15-18% ส่งผลกระทบต่องบการค้าและเงินสำรองระหว่างประเทศ"
                    },
                    {
                        "factor": "Tourism Recovery",
                        "impact": "positive",
                        "description": "การฟื้นตัวของภาคท่องเที่ยวช่วยเพิ่มกำลังซื้อและชดเชยผลกระทบบางส่วนจากราคาน้ำมัน"
                    },
                    {
                        "factor": "Government Subsidies",
                        "impact": "neutral",
                        "description": "รัฐบาลพิจารณามาตรการช่วยเหลือราคาน้ำมัน แต่อาจส่งผลกระทบต่อวินัยการคลังในระยะยาว"
                    }
                ],
                "economicIndicators": [
                    {
                        "indicator": "Diesel Price (Bangkok)",
                        "value": "฿32.50/L",
                        "trend": "up",
                        "description": "ราคาดีเซลในกรุงเทพฯ ปรับตัวสูงขึ้น ฿1.80/ลิตร จากเดือนก่อน"
                    },
                    {
                        "indicator": "CPI Inflation",
                        "value": "2.4%",
                        "trend": "up",
                        "description": "ดัชนีราคาผู้บริโภคเพิ่มขึ้นจากต้นทุนพลังงานและขนส่งที่สูงขึ้น"
                    },
                    {
                        "indicator": "Oil Import Volume",
                        "value": "1.2M bpd",
                        "trend": "stable",
                        "description": "ปริมาณการนำเข้าน้ำมันคงที่ แต่มูลค่าเพิ่มขึ้นตามราคา"
                    }
                ],
                "outlook": "ภาคธุรกิจไทยโดยเฉพาะอุตสาหกรรมการผลิตและโลจิสติกส์ควรเตรียมรับมือกับต้นทุนที่สูงขึ้น โดยอาจพิจารณาล็อคราคาน้ำมันล่วงหน้า หรือปรับแผนการดำเนินงานเพื่อลดการใช้พลังงาน ขณะที่ผู้บริโภคอาจเห็นราคาสินค้าและบริการปรับตัวสูงขึ้นในระยะข้างหน้า"
            }
        },

        "executiveSummary": """สถานการณ์ตึงเครียดในช่องแคบฮอร์มุซกำลังจะทำให้ราคาน้ำมันดิบ WTI พุ่งขึ้นอย่างน้อย 15-20% ภายในสัปดาห์นี้ เราแนะนำให้ธุรกิจที่เกี่ยวข้องกับโลจิสติกส์และการผลิต "ล็อคต้นทุนพลังงานล่วงหน้า" หรือ "เตรียมปรับแผนการเงิน" ภายใน 48 ชั่วโมงนี้ เพื่อหลีกเลี่ยงผลกระทบจากต้นทุนที่จะสูงขึ้นอย่างฉับพลัน""",

        "narrative": {
            "mainTitle": "The Perfect Storm is Here",
            "chapters": [
                {
                    "title": "Chapter 1: \"The Setup\" (สิ่งที่เกิดขึ้นแล้ว)",
                    "subtitle": "สัญญาณเตือนที่สะสมมา 30 วัน",
                    "events": [
                        {"label": "D-30", "description": "กลุ่ม OPEC+ ประกาศลดกำลังการผลิตมากกว่าคาด"},
                        {"label": "D-14", "description": "สต็อกน้ำมันดิบคงคลังของสหรัฐฯ ลดลงต่อเนื่อง 3 สัปดาห์"},
                        {"label": "D-5", "description": "ความตึงเครียดทางการเมืองในตะวันออกกลางเริ่มสูงขึ้น"}
                    ]
                },
                {
                    "title": "Chapter 2: \"The Tipping Point\" (จุดเปลี่ยน ← คุณอยู่ตรงนี้)",
                    "subtitle": "สิ่งที่เกิดขึ้นในขณะนี้",
                    "events": [
                        {"label": "เมื่อคืน", "description": "มีรายงานข่าวการซ้อมรบปิดช่องแคบฮอร์มุซ ซึ่งเป็นเส้นทางขนส่งน้ำมัน 30% ของโลก"},
                        {"label": "เช้านี้", "description": "กองทุนพลังงานขนาดใหญ่ (Smart Money) เพิ่มสถานะ Long ในตลาดฟิวเจอร์สกว่า 5 พันล้านดอลลาร์"},
                        {"label": "ตอนนี้", "description": "ตลาด Options กำลังสะท้อนความกังวลสูงสุดในรอบ 6 เดือน"}
                    ]
                },
                {
                    "title": "Chapter 3: \"The Price Shock\" (สิ่งที่คาดว่าจะเกิดใน 3-7 วัน)",
                    "subtitle": "การเคลื่อนไหวที่คาดการณ์",
                    "events": [
                        {"label": "🎯", "description": "ราคาเป้าหมาย: $75 - $82 ต่อบาร์เรล"}
                    ]
                }
            ]
        },

        "scenarios": [
            {
                "type": "bull",
                "probability": 60,
                "trigger": "มีการปิดช่องแคบฮอร์มุซจริง",
                "priceTarget": 82.0,
                "priceChange": 19.7,
                "businessImpact": "ต้นทุนค่าขนส่งทางเรืออาจพุ่งขึ้น >25%, เงินเฟ้อทั่วโลกเร่งตัว",
                "actionRecommendation": "มองหา Supplier พลังงานทางเลือก, สื่อสารลูกค้าเรื่องปรับราคา"
            },
            {
                "type": "base",
                "probability": 35,
                "trigger": "สถานการณ์ตึงเครียดแต่ไม่ปิดช่องแคบ",
                "priceTarget": 75.0,
                "priceChange": 9.5,
                "businessImpact": "ต้นทุนพลังงานสูงขึ้นตามคาดการณ์, กระทบกำไร 5-10%",
                "actionRecommendation": "ดำเนินการตามแผนล็อคต้นทุน"
            },
            {
                "type": "bear",
                "probability": 5,
                "trigger": "สถานการณ์คลี่คลายอย่างรวดเร็ว",
                "priceTarget": 64.0,
                "priceChange": -6.6,
                "businessImpact": "ตลาดกลับสู่ภาวะปกติ",
                "actionRecommendation": "ชะลอการตัดสินใจ, รอประเมินสถานการณ์"
            }
        ],

        "stakes": {
            "action": "ล็อคราคาดีเซลล่วงหน้าสำหรับไตรมาส 4 ที่ราคาปัจจุบัน",
            "profitPotential": "ประหยัดต้นทุนได้ต่อการใช้ 100,000 ลิตร (เทียบกับราคา Bull Case)",
            "profitAmount": 17000,
            "risk": "หากราคาลดลง (Bear Case) จะเสียโอกาสซื้อของถูก คิดเป็น",
            "riskAmount": 3000,
            "riskRewardRatio": 5.6
        },

        "verdict": {
            "summaryPoints": [
                "ราคาน้ำมันมีโอกาส 85% ที่จะแตะ $75 ภายใน 7 วันทำการ",
                "การตัดสินใจตอนนี้ อาจช่วย \"ประหยัดต้นทุน\" ได้มหาศาล หรือ \"ปกป้องกำไร\" ของธุรกิจคุณได้",
                "คุณมีเวลาตัดสินใจ 48 ชั่วโมง ก่อนที่ตลาดจะ Price-in ข่าวนี้ไปจนหมด"
            ],
            "actionButtons": [
                {"label": "ล็อคต้นทุนพลังงานล่วงหน้า", "action": "lock-cost"},
                {"label": "เรียกประชุมทีมการเงินด่วน", "action": "meeting"},
                {"label": "รอดูสถานการณ์ต่อ", "action": "wait"}
            ]
        },

        "generatedAt": current_date.isoformat(),
        "expiresAt": (current_date + timedelta(hours=24)).isoformat()
    }


@router.get("/{symbol}")
async def get_mob(symbol: str):
    """
    Get Market Opportunity Briefing for a specific symbol

    Currently supports:
    - CO: Crude Oil (WTI)
    """
    symbol_upper = symbol.upper()

    if symbol_upper == "CO":
        return {
            "success": True,
            "data": generate_mob_for_crude_oil()
        }
    else:
        raise HTTPException(
            status_code=404,
            detail=f"Market Opportunity Briefing not available for symbol: {symbol}"
        )


@router.get("/")
async def list_available_mobs():
    """List all available Market Opportunity Briefings"""
    return {
        "success": True,
        "data": {
            "available": ["CO"],
            "descriptions": {
                "CO": "Crude Oil (WTI) - Market Opportunity Briefing"
            }
        }
    }
