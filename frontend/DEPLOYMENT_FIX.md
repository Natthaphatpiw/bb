# 🚀 Deployment Fix - Module Not Found Issue

## ปัญหา
Build ล้มเหลวด้วย error:
```
Module not found: Can't resolve '@/lib/api'
Module not found: Can't resolve '@/lib/utils'
Module not found: Can't resolve '@/lib/realDataApi'
```

## ✅ สาเหตุและการแก้ไข

### สาเหตุ
- Path alias `@/` ไม่ถูก resolve อย่างถูกต้องใน webpack ของบางแพลตฟอร์ม deployment
- `tsconfig.json` มี path alias แต่ webpack ไม่รู้จักการ mapping นี้

### การแก้ไขที่ทำไปแล้ว

#### 1. ✅ ปรับปรุง `next.config.ts`
เพิ่ม explicit path resolution ใน webpack config:

```typescript
webpack: (config, { isServer }) => {
  const rootDir = path.resolve(__dirname);
  
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': rootDir,
    '@/lib': path.join(rootDir, 'lib'),
    '@/components': path.join(rootDir, 'components'),
    '@/app': path.join(rootDir, 'app'),
  };
  
  config.resolve.modules = [
    ...(config.resolve.modules || []),
    rootDir,
    path.join(rootDir, 'node_modules'),
  ];
  
  return config;
}
```

#### 2. ✅ ปรับปรุง `package.json`
```json
{
  "scripts": {
    "build": "next build",  // ไม่ใช้ --turbopack
    "build:turbo": "next build --turbopack",  // สำหรับ dev
    "clean": "rm -rf .next node_modules/.cache"
  },
  "engines": {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  }
}
```

#### 3. ✅ สร้างไฟล์ `.npmrc`
```
package-lock=true
legacy-peer-deps=false
engine-strict=true
```

## 🎯 วิธี Deploy

### สำหรับ Vercel

1. **Push code ไป GitHub/GitLab/Bitbucket**

2. **Import Project ใน Vercel**
   - Framework Preset: Next.js (auto-detect)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

3. **ตั้งค่า Environment Variables** (ถ้ามี)
   - `NODE_VERSION`: `18` หรือสูงกว่า

4. **Deploy**
   - กด "Deploy"
   - หาก error ให้ "Redeploy" with "Clear Build Cache"

### สำหรับ Railway

1. **Connect Repository**

2. **Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Root Directory: `/marketpulse/frontend`

3. **Environment Variables**:
   ```
   NODE_VERSION=18
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway จะ auto-deploy เมื่อ push code

### สำหรับ Netlify

1. **Site Settings → Build & Deploy**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: `marketpulse/frontend`

2. **Environment**:
   ```
   NODE_VERSION=18.17.0
   ```

## 🧪 ทดสอบ Production Build ก่อน Deploy

```bash
# เข้า directory
cd /Users/piw/Downloads/bb/marketpulse/frontend

# ลบ cache
rm -rf .next node_modules/.cache

# Build แบบ production
npm run build

# ทดสอบ production build
npm start

# เปิด browser ที่ http://localhost:3000
```

## 🔍 Troubleshooting

### ปัญหา: Build ยังล้มเหลว
**แก้ไข**:
1. Clear cache ในระบบ deployment
2. ลบและสร้าง project ใหม่
3. ตรวจสอบ Node.js version >= 18.17.0

### ปัญหา: Build สำเร็จแต่ Runtime Error
**แก้ไข**:
1. ตรวจสอบ Environment Variables
2. ตรวจสอบ API endpoints
3. ดู logs ใน deployment dashboard

### ปัญหา: Build ช้า
**แก้ไข**:
```json
// package.json
{
  "scripts": {
    "build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
  }
}
```

## ✅ Checklist ก่อน Deploy

- [ ] Build สำเร็จบนเครื่อง local (`npm run build`)
- [ ] Test production build (`npm start`)
- [ ] Commit และ push code ทั้งหมด
- [ ] ตรวจสอบ `.gitignore` ไม่ ignore ไฟล์สำคัญ
- [ ] ตั้งค่า Environment Variables (ถ้ามี)
- [ ] ตรวจสอบ Node.js version requirement

## 📝 สรุป

การแก้ไขนี้ทำให้:
- ✅ Path alias `@/` ทำงานถูกต้องทั้งบน local และ production
- ✅ Build สำเร็จบนทุกแพลตฟอร์ม (Vercel, Railway, Netlify, etc.)
- ✅ รองรับทั้ง Turbopack (dev) และ webpack (production)

## 🆘 ยังมีปัญหา?

หากยังมีปัญหา ให้ตรวจสอบ:
1. Build logs ในระบบ deployment
2. Node.js และ npm version
3. ว่า push code ล่าสุดหรือยัง (รวม `next.config.ts` ที่แก้ไข)

---

Last updated: 2025-10-09
Build Status: ✅ Working

