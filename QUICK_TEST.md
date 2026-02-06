# Quick Local Test Commands

## Setup (Run Once)

```bash
# Run the setup script
~/pdf-service/test-local.sh
```

## Run Services (In Separate Terminals)

### Terminal 1: PDF Service
```bash
cd ~/pdf-service && npm run dev
```
Will start at: **http://localhost:3001**

### Terminal 2: Main App
```bash
cd ~/erappo/erappo && npm run dev
```
Will start at: **http://localhost:3000**

## Test Commands (Terminal 3)

### 1. Check PDF Service Status
```bash
curl http://localhost:3001/api/generate-pdf
```

Expected: JSON with service info and templates list

### 2. Generate PDF (Direct Service Call)
```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": {
        "name": "John Doe",
        "position": "Engineer"
      },
      "company": {
        "companyName": "ACME Corp",
        "companyPhone": "+1-555-0100",
        "companyEmail": "info@acme.com"
      }
    }
  }' \
  --output ~/Downloads/test.pdf

open ~/Downloads/test.pdf
```

### 3. Generate Multiple PDFs (Different Templates)

**Salary Sheet:**
```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{
    "templateName": "salary-sheet",
    "data": {
      "employees": [
        { "name": "Employee 1", "salary": 50000 },
        { "name": "Employee 2", "salary": 60000 }
      ],
      "company": { "companyName": "ACME" }
    }
  }' \
  --output ~/Downloads/salary-sheet.pdf
```

**Bank Slip:**
```bash
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{
    "templateName": "bankslip",
    "data": {
      "bankDetails": {
        "bankName": "First National Bank",
        "accountNumber": "1234567890"
      },
      "totalAmount": 100000,
      "company": { "companyName": "ACME" }
    }
  }' \
  --output ~/Downloads/bankslip.pdf
```

### 4. Check Main App Endpoint
```bash
curl http://localhost:3000/api/pdf/generate
```

Expected: Same as service, but via main app proxy

### 5. Watch Service Logs

```bash
# Terminal 1 (PDF Service) shows:
# - Incoming requests
# - PDF generation status
# - Errors

# Terminal 2 (Main App) shows:
# - Service calls
# - Authentication
# - Activity logs
```

## Quick Test Script (One-Liner)

Save as `~/test-pdf.sh`:

```bash
#!/bin/bash
echo "Testing PDF Service..."
curl -X POST http://localhost:3001/api/generate-pdf \
  -H "Content-Type: application/json" \
  -H "X-PDF-Service-Secret: local-test-secret-key" \
  -d '{
    "templateName": "payslip",
    "data": {
      "employee": { "name": "Test User" },
      "company": { "companyName": "Test Company" }
    }
  }' \
  --output ~/Downloads/test.pdf && \
echo "✓ PDF generated: ~/Downloads/test.pdf" && \
open ~/Downloads/test.pdf
```

Run it:
```bash
chmod +x ~/test-pdf.sh
~/test-pdf.sh
```

## Testing with Postman

1. Open Postman
2. Create new POST request
3. URL: `http://localhost:3001/api/generate-pdf`
4. Headers:
   - `Content-Type: application/json`
   - `X-PDF-Service-Secret: local-test-secret-key`
5. Body (raw JSON):
```json
{
  "templateName": "payslip",
  "data": {
    "employee": {
      "name": "John Doe",
      "position": "Software Engineer"
    },
    "company": {
      "companyName": "ACME Corporation",
      "companyPhone": "+1-555-0100",
      "companyEmail": "info@acme.com"
    }
  }
}
```
6. Click Send
7. Response will be PDF file (download automatically)

## Common Issues

### "Connection refused" on port 3001
- **Fix**: Make sure Terminal 1 is running `npm run dev` in pdf-service

### "Unauthorized" (401)
- **Fix**: Check secret key matches in both `.env.local` files

### "Port already in use"
- **Fix**: Kill process: `lsof -i :3001` then `kill -9 <PID>`

### Blank or incomplete PDF
- **Fix**: Check browser console logs, make sure required data is provided

## Performance Notes

- **First PDF**: Takes 3-5 seconds (Chromium setup)
- **Subsequent PDFs**: Much faster (< 1 second)
- **Memory**: Uses 200-300MB RAM while running
- **CPU**: High during PDF generation, idle otherwise

## Next Steps

Once local testing works perfectly:
1. Deploy to Vercel (see DEPLOYMENT.md)
2. Update main app `.env.local` with Vercel URL
3. Test with production service
4. Commit changes and push to GitHub
