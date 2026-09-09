# Fakeh-Fakeh ATS Resume Builder

Professional ATS-optimized resume generator powered by Google Gemini AI.

## 🚀 Features

- **AI-Powered Resume Generation** - Uses Google Gemini 2.0 Flash for intelligent content creation
- **ATS Optimization** - Tailored for Applicant Tracking Systems
- **Multi-Language Support** - Arabic and English
- **Cover Letter Generation** - Contextual cover letters
- **Keyword Extraction** - Automatic skill recognition
- **Production Ready** - PostgreSQL + Redis, rate limiting, CORS security
- **Comprehensive Testing** - E2E tests with Vitest
- **CI/CD Pipeline** - GitHub Actions automation

## 📦 Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite + Tailwind CSS
- Motion for animations

**Backend:**
- Express.js + TypeScript
- Prisma ORM
- PostgreSQL
- Redis caching
- Rate limiting & validation

**DevOps:**
- GitHub Actions CI/CD
- Docker ready
- Deployment scripts included

## 🛠️ Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 7+

### Setup

```bash
# 1. Clone repository
git clone https://github.com/Zien153/Fakeh-Fakeh.git
cd Fakeh-Fakeh

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your configuration

# 4. Setup database
npm run db:push
npm run db:seed

# 5. Start development server
npm run dev
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# E2E tests only
npm run test:e2e

# UI mode
npm run test:ui
```

## 🚀 Deployment

### Staging
```bash
STAGING_HOST=your-staging-host.com bash scripts/deploy-staging.sh
```

### Production
```bash
DEPLOY_KEY=~/.ssh/deploy_key DEPLOY_HOST=your-prod-host.com bash scripts/deploy-production.sh
```

### Docker
```bash
docker build -t fakeh-fakeh .
docker run -p 3000:3000 fakeh-fakeh
```

## 📝 API Endpoints

### Resume Generation
```
POST /api/resume/generate
Body: {
  targetJobTitle: string
  targetCompany: string
  targetJobDescription: string
  rawUserInfo: { fullName, email, phone, location, linkedin, portfolio, rawNotes }
  language: 'ar' | 'en'
}
```

### Improve Bullet Point
```
POST /api/resume/improve-bullet
Body: {
  bulletText: string
  targetJobTitle: string
  targetJobDescription: string
}
```

### Extract Keywords
```
POST /api/resume/extract-keywords
Body: {
  targetJobDescription: string
}
```

## 🔒 Security Features

- ✅ CORS protection with configurable origins
- ✅ Rate limiting (10 requests/min per IP)
- ✅ Zod validation on all inputs
- ✅ HTTPS ready
- ✅ Environment variable validation
- ✅ SQL injection prevention (Prisma)

## 📊 Database Schema

- **Order** - Payment orders from ShamCash
- **ResumeGenerationLog** - Resume generation history
- **ApiUsageLog** - API usage tracking

## 🔄 Environment Variables

Required:
- `GEMINI_API_KEY` - Google Gemini API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `SHAMCASH_MERCHANT_ID` - Payment gateway merchant ID
- `SHAMCASH_SECRET_KEY` - Payment gateway secret

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origins
- `RATE_LIMIT_AI` - Rate limit for AI endpoints

## 📈 Performance

- Response times: ~2-3 seconds for resume generation
- Database indexed queries for fast lookups
- Redis caching for repeated requests
- Fallback generator for API outages

## 🐛 Troubleshooting

**Database connection fails:**
```bash
npm run db:push
```

**Tests fail:**
```bash
npm test -- --reporter=verbose
```

**Clear cache:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

MIT

## 👨‍💻 Author

Zien153 - ATS Resume Builder
