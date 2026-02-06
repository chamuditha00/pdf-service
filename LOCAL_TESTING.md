# Local Testing Guide: ERAPPO PDF Service

## Architecture

```
┌─────────────────────────────────────────┐
│      Main App (ERAPPO)                 │
│      http://localhost:3000              │
│                                         │
│  GET  /api/pdf/generate (list info)    │
│  POST /api/pdf/generate (call service)  │
└────────────────┬──────────────────────┘
                 │
                 │ HTTP Request
                 │ PDF_SERVICE_URL=http://localhost:3001/api/generate-pdf
                 ↓
┌─────────────────────────────────────────┐
│      PDF Service                        │
│      http://localhost:3001              │
│                                         │
│  GET  /api/generate-pdf (service info)  │
│  POST /api/generate-pdf (generate PDF)  │
└─────────────────────────────────────────┘
```

## Step 1: Install Dependencies

### PDF Service
```bash
cd ~/pdf-service
npm install
```

This installs:
- `next` - Framework
- `react` & `react-dom` - UI
- `puppeteer-core` - Headless browser
- `@sparticuz/chromium-min` - Optimized Chromium

### Main App (Already installed)
```bash
cd ~/erappo/erappo
# Already has dependencies, but verify:
npm install
```

## Step 2: Setup Environment Variables

### PDF Service (.env.local)

File: `~/pdf-service/.env.local`

```env
# PDF Service Configuration
PDF_SERVICE_SECRET=local-test-secret-key
NODE_ENV=development
```

### Main App (.env.local)

Update: `~/erappo/erappo/.env.local`

Add these lines:
```env
# PDF Service (Local Testing)
PDF_SERVICE_URL=http://localhost:3001/api/generate-pdf
PDF_SERVICE_SECRET=local-test-secret-key
```

**Important**: The `PDF_SERVICE_SECRET` must match in both files!

## Step 3: Run Both Services Locally

### Terminal 1: PDF Service (Port 3001)

```bash
cd ~/pdf-service
npm run dev
```

Expected output:
```
> next dev
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3001
  - Environments: .env.local

✓ Ready in 2.5s
```

### Terminal 2: Main App (Port 3000)

```bash
cd ~/erappo/erappo
npm run dev
```

Expected output:
```
> next dev
  ▲ Next.js 16.0.0
  - Local:        http://localhost:3000
  - Environments: .env.local

✓ Ready in 3.2s
```

### Terminal 3: For Testing (Optional)

Keep a third terminal open for running curl commands or other tests.

## Step 4: Test PDF Service Directly

### Check Service Status

```bash
curl http://localhost:3001/api/generate-pdf
```

Expected response:
```json
{
  "service": "ERAPPO PDF Generation Service",
  "version": "1.0.0",
  "availableTemplates": [
    "payslip",
    "salary-sheet",
    "bankslip",
    ...
  ]
}
```

### Generate a Simple Payslip PDF

```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": {
        "name": "John Doe",
        "position": "Software Engineer",
        "department": "IT"
      },
      "company": {
        "companyName": "ACME Corporation",
        "companyPhone": "+1-555-0100",
        "companyEmail": "info@acme.com",
        "address": {
          "street": "123 Business St",
          "city": "New York",
          "state": "NY",
          "country": "USA"
        }
      },
      "payrollData": {
        "month": "January 2026",
        "basicSalary": 50000,
        "allowances": 5000,
        "deductions": 2000,
        "netSalary": 53000
      }
    },
    "options": {
      "filename": "payslip-jan-2026.pdf"
    }
  }' \
  --output ~/Downloads/test-payslip.pdf
```

Then open the PDF:
```bash
open ~/Downloads/test-payslip.pdf
```

## Step 5: Test Main App Integration

### Check Main App PDF Endpoint

```bash
curl http://localhost:3000/api/pdf/generate
```

Expected response:
```json
{
  "availableTemplates": ["payslip", "salary-sheet", ...],
  "service": "PDF generation via external Vercel service"
}
```

### Generate PDF via Main App

```bash
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": {
        "name": "Jane Smith",
        "position": "Manager"
      },
      "company": {
        "companyName": "ACME Corp",
        "companyPhone": "+1-555-0100",
        "companyEmail": "info@acme.com"
      }
    }
  }' \
  --output ~/Downloads/test-via-main-app.pdf
```

**Note**: This requires authentication. If you get a 401 error, you need to be logged in to the main app.

## Step 6: Browser Testing

### Via Postman (Recommended)

1. Download [Postman](https://www.postman.com/downloads/)
2. Create a new POST request
3. URL: `http://localhost:3000/api/pdf/generate`
4. Headers:
   - `Content-Type: application/json`
   - `Authorization: Bearer <your-session-token>` (from browser cookies)
5. Body (JSON):
```json
{
  "templateName": "payslip",
  "data": {
    "employee": { "name": "Test User" },
    "company": { "companyName": "Test Company" }
  }
}
```
6. Click Send → PDF downloads

### Via Browser Console

Go to http://localhost:3000 in your browser, login, then:

```javascript
// In browser console
const response = await fetch('/api/pdf/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    templateName: 'payslip',
    data: {
      employee: { name: 'Test' },
      company: { companyName: 'Test Corp' }
    }
  })
});

const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'test.pdf';
a.click();
```

## Troubleshooting

### Problem: `ECONNREFUSED` when calling PDF service

```
Error: Failed to generate PDF from external service: 
fetch failed: connect ECONNREFUSED 127.0.0.1:3001
```

**Solution**: Make sure PDF service is running on Terminal 1:
```bash
cd ~/pdf-service
npm run dev
```

### Problem: `401 Unauthorized` from PDF service

```
Error: Unauthorized
```

**Solution**: Check secret key matches:
```bash
# In ~/pdf-service/.env.local:
PDF_SERVICE_SECRET=local-test-secret-key

# In ~/erappo/erappo/.env.local:
PDF_SERVICE_SECRET=local-test-secret-key
```

### Problem: Chromium installation fails

```
Error: Failed to launch chromium
```

**Solution**: Reinstall puppeteer:
```bash
cd ~/pdf-service
rm -rf node_modules package-lock.json
npm install
```

### Problem: Port 3001 already in use

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solution**: Kill process on port 3001:
```bash
# Find process
lsof -i :3001

# Kill it
kill -9 <PID>

# Or just use a different port:
PORT=3002 npm run dev
```

Then update `.env.local`:
```env
PDF_SERVICE_URL=http://localhost:3002/api/generate-pdf
```

### Problem: PDF is blank or incomplete

**Solution**: Check your data structure matches the template requirements. View browser console/server logs for details:

```bash
# Check PDF Service logs (Terminal 1)
# Shows PDF generation process

# Check Main App logs (Terminal 2)
# Shows authentication and service calls
```

## Performance Tips

1. **First run is slow**: Chromium downloads on first PDF generation (~100MB)
2. **Cold starts**: First PDF takes 3-5 seconds, subsequent ones are faster
3. **Development mode**: Hot reload enabled - changes apply instantly
4. **Memory**: Puppeteer can use 200-300MB RAM - ensure your Mac has available memory

## Complete Test Workflow

```bash
# 1. Terminal 1: Start PDF Service
cd ~/pdf-service && npm run dev

# 2. Terminal 2: Start Main App
cd ~/erappo/erappo && npm run dev

# 3. Terminal 3: Test PDF Service directly
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{"templateName":"payslip","data":{"employee":{"name":"Test"},"company":{"companyName":"Test"}}}' \
  --output ~/Downloads/test1.pdf

# 4. Open generated PDF
open ~/Downloads/test1.pdf

# 5. Test via main app (requires auth)
# - Go to http://localhost:3000
# - Login with your credentials
# - Generate PDF from UI or API
```

## Next Steps

Once local testing works:
1. Deploy PDF service to Vercel (see DEPLOYMENT.md)
2. Update main app `.env.local` with Vercel URL
3. Test with production service
4. Commit and push changes
