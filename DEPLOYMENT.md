# Deployment Guide: ERAPPO PDF Service

## Quick Start

### 1. Prepare PDF Service for Deployment

```bash
cd ~/pdf-service

# Initialize git repository
git init
git add .
git commit -m "Initial commit: ERAPPO PDF service"
```

### 2. Push to GitHub

1. Create a new repository on GitHub: `erappo-pdf-service`
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/erappo-pdf-service.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose your GitHub `erappo-pdf-service` repository
5. Configure:
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variables:
   - Key: `PDF_SERVICE_SECRET`
   - Value: `your-secret-key-here` (or any secure string)
7. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy from pdf-service directory
cd ~/pdf-service
vercel

# Follow prompts:
# - Link to existing project or create new
# - Set project name (e.g., erappo-pdf-service)
# - Set environment variables when prompted
```

### 4. Get Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://erappo-pdf-service.vercel.app
```

### 5. Update Main App Environment

Add to `/Users/chamudithagunawardene/erappo/erappo/.env.local`:

```env
# PDF Service (Vercel)
PDF_SERVICE_URL=https://erappo-pdf-service.vercel.app/api/generate-pdf
PDF_SERVICE_SECRET=your-secret-key-here
```

Make sure `your-secret-key-here` matches the secret you set in Vercel.

## Testing

### Test PDF Service Endpoint

```bash
curl -X POST https://erappo-pdf-service.vercel.app/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: your-secret-key-here" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": { "name": "John Doe" },
      "company": { "companyName": "ACME Corp" }
    }
  }' \
  --output test.pdf
```

### Test from Main App

Once main app is updated:

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": { "name": "John Doe" },
      "company": { "companyName": "ACME Corp" }
    }
  }' \
  --output test.pdf
```

## Local Development (Before Deployment)

### Run Both Services Locally

**Terminal 1: Main App**
```bash
cd ~/erappo/erappo
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2: PDF Service**
```bash
cd ~/pdf-service
npm run dev
# Runs on http://localhost:3001
```

Update main app `.env.local` for local testing:
```env
PDF_SERVICE_URL=http://localhost:3001/api/generate-pdf
PDF_SERVICE_SECRET=test-secret
```

## Troubleshooting

### PDF Service Returns 401 Unauthorized
- Check that `X-PDF-Service-Secret` header matches Vercel environment variable
- Verify `PDF_SERVICE_SECRET` is set in main app `.env.local`

### Service Timeout
- PDF generation can take 3-5 seconds
- Vercel serverless functions have 60-second timeout (Pro plan: up to 900s)
- For large PDFs, consider upgrading to Pro

### Chromium Binary Issues
- This is handled by `@sparticuz/chromium-min` automatically
- No manual setup needed on Vercel

### CORS Issues
- Vercel allows same-origin requests
- Main app calls service via server-side fetch (no CORS needed)

## Production Checklist

- [ ] PDF Service deployed to Vercel
- [ ] `PDF_SERVICE_SECRET` configured in Vercel environment variables
- [ ] Main app `.env.local` updated with `PDF_SERVICE_URL` and `PDF_SERVICE_SECRET`
- [ ] Tested PDF generation from main app
- [ ] Verified PDF downloads work in UI
- [ ] Activity logs show successful PDF exports

## Monitoring

Check Vercel dashboard for:
- Function invocations and duration
- Error logs
- Cold start times

View logs:
```bash
vercel logs erappo-pdf-service
```

## Scaling

- **Free tier**: Limited serverless function executions (enough for small teams)
- **Pro tier**: More executions, higher memory, longer timeouts
- **Enterprise**: Custom scaling, dedicated infrastructure

## Updates

To update the PDF service:

```bash
cd ~/pdf-service
git add .
git commit -m "Update: [description]"
git push origin main

# Vercel auto-deploys on git push
# Check deployment status at vercel.com/dashboard
```

To rollback:
1. Go to Vercel dashboard
2. Select project → Deployments
3. Click on previous deployment → Promote to Production
