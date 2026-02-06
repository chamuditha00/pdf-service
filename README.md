# ERAPPO PDF Generation Service

A dedicated Next.js microservice for generating PDFs from HTML templates. This service is designed to be deployed on Vercel and called from the main ERAPPO application.

## Features

- Generates PDFs from multiple templates (payslip, salary sheet, bankslip, etc.)
- Supports Puppeteer with Chromium optimization
- Includes company branding (logo, contact info)
- PDF verification codes
- Production-ready Vercel deployment

## Available Templates

- `payslip` - Employee payslip
- `salary-sheet` - Monthly salary sheet
- `bankslip` - Bank deposit slip
- `advance-payroll` - Advance payroll report
- `custom-advance-report` - Custom advance report
- `attendance-report` - Attendance report
- `deposit-tools` - Deposit tools report
- `losses-recovery` - Losses recovery report
- `other-deductions` - Other deductions report

## Local Development

```bash
npm install
npm run dev
```

Service will run at `http://localhost:3000`

## API Endpoint

### POST /api/generate-pdf

Generates a PDF from a template.

**Headers:**
- `X-PDF-Service-Secret`: Authentication secret (if configured in env)

**Request Body:**
```json
{
  "templateName": "payslip",
  "data": {
    "employee": { "name": "John Doe", ... },
    "company": { "companyName": "ACME Corp", ... }
  },
  "options": {
    "filename": "payslip.pdf",
    "format": "A4",
    "orientation": "portrait"
  }
}
```

**Response:**
- PDF file as binary attachment

### GET /api/generate-pdf

Returns service information and available templates.

## Deployment to Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Add environment variable: `PDF_SERVICE_SECRET` (optional, for security)
5. Deploy

After deployment, you'll get a URL like: `https://erappo-pdf-service.vercel.app`

## Usage from Main App

Update `.env.local` in main ERAPPO app:

```env
PDF_SERVICE_URL=https://erappo-pdf-service.vercel.app/api/generate-pdf
PDF_SERVICE_SECRET=your-secret-key
```

The main app will call this service via the `/api/pdf/generate` endpoint.

## Performance

- Vercel serverless functions scale automatically
- Chromium-min optimized for fast startup times
- PDF generation is isolated from main app
- Each request spawns independent browser instance

## Security

- Optional secret key authentication via `PDF_SERVICE_SECRET`
- Main app should verify responses
- All logs are isolated to this service
