# Deployment Guide - MarketPulse Frontend

## ⚠️ ปัญหาที่พบบ่อย: Module Not Found Error

หาก build ล้มเหลวด้วย error แบบนี้:
```
Module not found: Can't resolve '@/lib/api'
Module not found: Can't resolve '@/lib/utils'
Module not found: Can't resolve '@/lib/realDataApi'
```

### ✅ วิธีแก้ไข (แก้ไขแล้ว)

#### 1. ใช้ Script Build ที่ถูกต้อง
ในระบบ deployment ให้ใช้:
```bash
npm run build
```

**ไม่ใช่** `npm run build:turbo` เพราะ Turbopack อาจทำงานไม่สมบูรณ์บางแพลตฟอร์ม

#### 2. ตั้งค่า Environment Variables
ตรวจสอบว่าตั้งค่า Node.js version ให้ถูกต้อง:
- **Node.js**: >= 18.17.0
- **npm**: >= 9.0.0

#### 3. สำหรับ Vercel
ใน Vercel Dashboard → Settings → General:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x หรือสูงกว่า

#### 4. สำหรับ Railway
ใน Railway Settings:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- ตั้งค่า `NODE_VERSION` environment variable = `18` หรือสูงกว่า

#### 5. Clear Cache
หากยังมีปัญหา ให้ลบ cache:
- **Vercel**: Deployments → ... → Redeploy (เลือก "Clear Build Cache")
- **Railway**: Settings → Clear Build Cache
- **Local**: `npm run clean && npm install`

### การทดสอบก่อน Deploy
```bash
# ลบ cache
rm -rf .next node_modules/.cache

# Build แบบเดียวกับ production
npm run build

# ทดสอบ production build
npm start
```

### Troubleshooting

#### ปัญหา: Module Not Found Errors
**สาเหตุ**: Path alias `@/` อาจจะไม่ทำงานในบาง environment

**แก้ไข**: 
1. ตรวจสอบว่า `tsconfig.json` มี paths alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

2. ตรวจสอบว่า `next.config.ts` มี webpack config:
   ```typescript
   webpack: (config) => {
     config.resolve.alias = {
       ...config.resolve.alias,
       '@': path.resolve(__dirname),
     };
     return config;
   }
   ```

#### ปัญหา: Build Timeout
**แก้ไข**: เพิ่ม timeout ในระบบ deployment หรือ optimize dependencies

#### ปัญหา: Memory Issues
**แก้ไข**: 
```bash
# ใน package.json เพิ่ม
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

### สำหรับ CI/CD
ตัวอย่าง GitHub Actions:
```yaml
- name: Install dependencies
  run: npm ci

- name: Build
  run: npm run build
  env:
    NODE_ENV: production
```

### ข้อมูลเพิ่มเติม
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app

