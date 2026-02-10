import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Use chromium for production (Vercel), puppeteer for development
let puppeteer: any;
let chromium: any;

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  chromium = require('@sparticuz/chromium');
  puppeteer = require('puppeteer-core');
} else {
  puppeteer = require('puppeteer');
}

// Template imports
import { generatePayslipTemplate } from '@/lib/templates/payslipTemplate';
import { generateSalarySheetTemplate } from '@/lib/templates/salarySheetTemplate';
import { generateBankslipTemplate } from '@/lib/templates/bankslipTemplate';
import { generateAdvancePayrollHTML } from '@/lib/templates/advancePayrollTemplate';
import { generateCustomAdvanceReportHTML } from '@/lib/templates/customAdvanceReportTemplate';
import { generateMonthlyAdvanceSummaryHTML } from '@/lib/templates/monthlyAdvanceSummaryTemplate';
import { generateAttendanceReportHTML } from '@/lib/templates/attendanceReportTemplate';
import { generateDepositToolsPDFContent } from '@/lib/templates/depositToolsPDFTemplate';
import { generateLossesRecoveryPDFContent } from '@/lib/templates/lossesRecoveryPDFTemplate';
import { generateOtherDeductionsPDFContent } from '@/lib/templates/otherDeductionsPDFTemplate';
import { salarySheetSummaryTemplate } from '@/lib/templates/salarySheetSummaryTemplate';

export type TemplateName =
  | 'payslip'
  | 'salary-sheet'
  | 'bankslip'
  | 'advance-payroll'
  | 'custom-advance-report'
  | 'monthly-advance-summary'
  | 'attendance-report'
  | 'deposit-tools'
  | 'losses-recovery'
  | 'other-deductions'
  | 'salary-sheet-summary';

const availableTemplates: TemplateName[] = [
  'payslip',
  'salary-sheet',
  'bankslip',
  'advance-payroll',
  'custom-advance-report',
  'monthly-advance-summary',
  'attendance-report',
  'deposit-tools',
  'losses-recovery',
  'other-deductions',
  'salary-sheet-summary',
];

interface PDFGenerateRequest {
  templateName: TemplateName;
  data: Record<string, any>;
  options?: {
    filename?: string;
    format?: 'A4' | 'Letter' | 'Legal';
    orientation?: 'portrait' | 'landscape';
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
}

function generateHTMLFromTemplate(templateName: TemplateName, data: any): string {
  switch (templateName) {
    case 'payslip':
      return generatePayslipTemplate(data);

    case 'salary-sheet':
      return generateSalarySheetTemplate(data);

    case 'bankslip':
      return generateBankslipTemplate(data);

    case 'advance-payroll':
      return generateAdvancePayrollHTML(data);

    case 'custom-advance-report':
      return generateCustomAdvanceReportHTML(data);

    case 'monthly-advance-summary':
      return generateMonthlyAdvanceSummaryHTML(data);

    case 'attendance-report':
      return generateAttendanceReportHTML(data);

    case 'deposit-tools':
      return generateDepositToolsPDFContent(data.record, data.details, data.company);

    case 'losses-recovery':
      return generateLossesRecoveryPDFContent(data.record, data.details, data.company);

    case 'other-deductions':
      return generateOtherDeductionsPDFContent(data.record, data.details, data.company);

    case 'salary-sheet-summary':
      return salarySheetSummaryTemplate(data);

    default:
      throw new Error(`Unknown template: ${templateName}`);
  }
}

function generateVerificationCode(templateName: string): string {
  const prefix = templateName.toUpperCase().substring(0, 3);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `${prefix}-${date}-${randomCode}`;
}

async function loadCompanyLogoAsBase64(logoPath?: string): Promise<string> {
  if (!logoPath) return '';

  try {
    if (logoPath.startsWith('data:')) {
      return logoPath;
    }

    const publicPath = path.join(process.cwd(), 'public', logoPath.replace(/^\//, ''));
    
    try {
      const logoBuffer = await fs.readFile(publicPath);
      const extension = path.extname(logoPath).toLowerCase().replace('.', '');
      const mimeType = extension === 'png' ? 'image/png' : 'image/jpeg';
      return `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
    } catch {
      return '';
    }
  } catch (error) {
    console.error('Error loading company logo:', error);
    return '';
  }
}

function buildFooterHTML(company?: any, logoBase64?: string, verificationCode?: string,): string {
  const companyName = company?.companyName || '';
  const addressParts = [
    company?.address?.street,
    company?.address?.city,
    company?.address?.state,
    company?.address?.country,
  ].filter(Boolean);
  
  const phoneText = company?.companyPhone ? `Tel: ${company.companyPhone}` : '';
  const emailText = company?.companyEmail ? `E-mail: ${company.companyEmail}` : '';
  const contactSeparator = phoneText && emailText ? ' | ' : '';
  const contactText = `${phoneText}${contactSeparator}${emailText}`;

  return `
    <div style="width: 100%; font-family: Arial, sans-serif; padding: 1.5mm 10mm 1mm 10mm; box-sizing: border-box; position: relative; margin: 0; line-height: 0.9;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin: 0;">
        <div style="flex: 1; max-width: 75%;">
          <div style="font-size: 6px; font-weight: bold; color: #333333; margin: 0; line-height: 0.9;">
            ${companyName}${addressParts.length ? ' | ' + addressParts.join(', ') : ''}${contactText ? ' | ' + contactText : ''}
          </div>
        </div>
        ${(logoBase64 ) ? `
          <div style="flex: 0 0 auto; max-width: 2%; text-align: right;">
            <img src="${logoBase64}" alt="Company Logo" style="max-height: 5m; max-width: 100%; object-fit: contain;" />
          </div>
        ` : ''}
       
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 0.2px solid #cccccc; padding-top: 0.3mm; margin-top: 0.3mm;">
        <div style="font-size: 5px; color: #666666; margin: 0; line-height: 0.9;">
          Ref: ${verificationCode || 'N/A'} | ${new Date().toLocaleDateString()}
        </div>
        <div style="font-size: 5px; color: #666666; margin: 0; line-height: 0.9;">
          Page <span class="pageNumber"></span>/<span class="totalPages"></span>
        </div>
      </div>
    </div>
  `;
}

async function generatePDFBuffer(
  html: string,
  options: {
    format: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margin: { top?: string; right?: string; bottom?: string; left?: string };
    company?: any;
    logoBase64?: string;
    verificationCode?: string;
    templateName?: string;
  }
): Promise<Uint8Array> {
  let browser = null;

  try {
    const showFooter = options.templateName !== 'payslip';
    const footerHTML = showFooter 
      ? buildFooterHTML(options.company, options.logoBase64, options.verificationCode)
      : '<div></div>';

    let launchConfig: any = {
      headless: true,
    };

    if (isProduction && chromium) {
      launchConfig = {
        ...launchConfig,
        args: chromium.args,
        executablePath: await chromium.executablePath(),
      };
    } else {
      launchConfig = {
        ...launchConfig,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      };
    }

    browser = await puppeteer.launch(launchConfig);
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: options.format,
      landscape: options.orientation === 'landscape',
      margin: options.margin,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: footerHTML,
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * POST /api/generate-pdf
 * Generates a PDF from a template and data
 * 
 * Headers:
 * - X-PDF-Service-Secret: Secret key for authentication
 * 
 * Body:
 * {
 *   templateName: string - Name of template
 *   data: object - Template data
 *   options?: object - PDF options
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify secret if configured
    const secret = req.headers.get('x-pdf-service-secret');
    const expectedSecret = process.env.PDF_SERVICE_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: PDFGenerateRequest = await req.json();
    const { templateName, data, options = {} } = body;

    if (!templateName || !data) {
      return NextResponse.json(
        { error: 'Missing templateName or data' },
        { status: 400 }
      );
    }

    if (!availableTemplates.includes(templateName)) {
      return NextResponse.json(
        {
          error: `Template '${templateName}' not found`,
          availableTemplates,
        },
        { status: 404 }
      );
    }

    console.log(`Generating PDF: ${templateName}`);

    const html = generateHTMLFromTemplate(templateName, data);
    const verificationCode = generateVerificationCode(templateName);
    const logoBase64 = await loadCompanyLogoAsBase64(data.company?.companyLogo);

    const isPayslip = templateName === 'payslip';

    // Very large bottom margin to ensure footer never overlaps
    const defaultMargin = {
      top: '10mm',
      right: '10mm',
      bottom: isPayslip ? '10mm' : '50mm',
      left: '10mm',
    };

    const pdfBuffer = await generatePDFBuffer(html, {
      format: options.format || 'A4',
      orientation: options.orientation || 'portrait',
      margin: {
        ...defaultMargin,
        ...(options.margin || {}),
      },
      company: data.company,
      logoBase64: logoBase64,
      verificationCode: verificationCode,
      templateName: templateName,
    });

    const filename = options.filename || `${templateName}-${Date.now()}.pdf`;
    const responseBuffer = Buffer.from(pdfBuffer);

    return new NextResponse(responseBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(responseBuffer.length),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-pdf
 * Returns available templates and service info
 */
export async function GET() {
  return NextResponse.json({
    service: 'ERAPPO PDF Generation Service',
    version: '1.0.0',
    availableTemplates,
    endpoints: {
      post: {
        path: '/api/generate-pdf',
        description: 'Generate PDF from template',
        authentication: 'X-PDF-Service-Secret header (if configured)',
      },
    },
  });
}