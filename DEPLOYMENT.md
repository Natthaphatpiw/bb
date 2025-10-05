# Market Pulse - Deployment Guide

## 📋 Requirements

### Backend
- Python 3.13+
- pip
- Virtual environment

### Frontend
- Node.js 18+
- npm or yarn

## 🚀 Deployment Steps

### 1. Clone/Copy Project
```bash
git clone <repository> marketpulse
cd marketpulse
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your API keys
```

### 3. Configure Environment Variables

Edit `backend/.env`:
```env
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_BASE_URL=your_azure_openai_base_url
AZURE_OPENAI_MODEL=gpt-5-mini
SERPER_API_KEY=your_google_serper_api_key
```

### 4. Generate Initial Data

```bash
# Generate data for Crude Oil
python data_generator.py

# The script will create JSON files in ../frontend/public/data/
```

### 5. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# For development
npm run dev

# For production
npm run build
npm start
```

## 📁 Project Structure

```
marketpulse/
├── backend/
│   ├── .env                    # Environment variables (DO NOT COMMIT)
│   ├── .env.example            # Template for environment variables
│   ├── .gitignore
│   ├── requirements.txt
│   ├── data_generator.py       # Main data generator (Crude Oil)
│   └── venv/                   # Python virtual environment
│
└── frontend/
    ├── public/
    │   └── data/               # Generated JSON files
    │       ├── crude_oil_data.json
    │       ├── market_data.json
    │       ├── news_scores.json
    │       ├── price_forecasts.json
    │       └── popup_analysis.json
    ├── app/
    ├── components/
    ├── lib/
    └── package.json
```

## 🔄 Updating Data

### Manual Update
```bash
cd backend
source venv/bin/activate
python data_generator.py
```

### Automated Updates (Cron Job)

```bash
# Edit crontab
crontab -e

# Add line to run every 12 hours at 8 AM and 8 PM
0 8,20 * * * cd /path/to/marketpulse/backend && source venv/bin/activate && python data_generator.py
```

## 🌐 Production Deployment

### Option 1: Traditional Server (PM2)

```bash
# Install PM2
npm install -g pm2

# Start frontend
cd frontend
pm2 start npm --name "marketpulse-frontend" -- start

# Setup backend cron
pm2 start ecosystem.config.js
```

### Option 2: Docker

```bash
# Build and run
docker-compose up -d
```

### Option 3: Vercel (Frontend) + Cron Job (Backend)

1. Deploy frontend to Vercel
2. Setup backend on a separate server with cron job
3. Ensure backend can write to frontend's public/data directory

## 🔒 Security Notes

1. **Never commit `.env` file** - It contains sensitive API keys
2. **Use `.env.example`** as a template for new deployments
3. **Rotate API keys** regularly
4. **Use environment-specific** `.env` files for dev/staging/prod

## 🐛 Troubleshooting

### Backend Issues

**Import Error: dotenv not found**
```bash
pip install python-dotenv
```

**API Key Error**
- Check `.env` file exists
- Verify API keys are correct
- Ensure no extra spaces in `.env`

### Frontend Issues

**404 on /data/*.json**
- Run backend data generator first
- Check files exist in `frontend/public/data/`
- Restart Next.js dev server

**Module not found**
```bash
rm -rf node_modules
npm install
```

## 📊 Monitoring

- Check data freshness: Look at `generatedAt` timestamp in JSON files
- Monitor API usage in Azure portal
- Check logs for errors

## 🆘 Support

For issues:
1. Check logs in backend output
2. Verify environment variables
3. Ensure all dependencies are installed
