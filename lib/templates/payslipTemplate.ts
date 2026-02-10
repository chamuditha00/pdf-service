import { CRASH_NUMBERING_GOTHIC_BASE64 } from '../fonts';

export interface PayslipTemplateProps {
  employeeName: string;
  jobTitle: string;
  employeeCode: string;
  bankName: string;
  branchName: string;
  accountNo: string;
  formattedPaymentDate: string;
  projectName: string;
  departmentName: string;
  periodStr: string;
  
  // Numerical values
  workingdays: number;
  numberofRC: number;
  numberofDC: number;
  basicSalary: number;
  bikeFuelValue: number;
  mobilDataValue: number;
  mobilePhoneValue: number;
  valueof80: number;
  valueofVisit: number;
  valueofRC: number;
  valueofDC: number;
  valueof100: number;
  adjustmentNetValue: number;
  grossSalary: number;
  netSalary: number;
  
  // Deductions
  epfEmployee: number;
  epfEmployer: number;
  etfEmployer: number;
  totalDeduction: number;
  contributionTotal: number;
  
  // Rows data
  deductionRows: Array<{ label: string; value: number }>;
  dynamicAllowanceRowsHtml: string;
  
  // Company info
  company: {
    companyName?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    companyPhone?: string;
    companyEmail?: string;
  };
  
  // Logo
  logoBase64: string;
  specificCode: string;

  // Custom Font
  fontBase64?: string;

  // Dynamic Content (from JobRole)
  headerRows?: Array<{ label: string; value: number }>;
  earningsRows?: Array<{ label: string; value: number }>;
}

export function generatePayslipTemplate(props: PayslipTemplateProps): string {
  const {
    employeeName,
    jobTitle,
    employeeCode,
    bankName,
    branchName,
    accountNo,
    formattedPaymentDate,
    projectName,
    departmentName,
    periodStr,
    workingdays,
    numberofRC,
    numberofDC,
    basicSalary,
    bikeFuelValue,
    mobilDataValue,
    mobilePhoneValue,
    valueof80,
    valueofVisit,
    valueofRC,
    valueofDC,
    valueof100,
    adjustmentNetValue,
    grossSalary,
    netSalary,
    epfEmployee,
    epfEmployer,
    etfEmployer,
    totalDeduction,
    contributionTotal,
    deductionRows,
    dynamicAllowanceRowsHtml,
    company,
    logoBase64,
    specificCode,
    fontBase64 = CRASH_NUMBERING_GOTHIC_BASE64,
    headerRows = [],
    earningsRows = [],
  } = props;

  const formatValue = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0.00';
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumber = (val: number | undefined | null) => {
    if (val === undefined || val === null) return '0';
    return val.toLocaleString('en-US');
  };

  // Only include @font-face if we have the base64 string
  const fontFaceStyle = fontBase64 
    ? `@font-face {
      font-family: 'CrashNumberingGothic';
      src: url(data:font/truetype;charset=utf-8;base64,${fontBase64}) format('truetype');
      font-weight: normal;
      font-style: normal;
    }`
    : `/* Font base64 not provided */`;

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Payslip - ${employeeName}</title>
  <style>
    @page {
      margin: 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.35;
      margin: 0;
      padding: 10px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .payslip-container {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
    }
    ${fontFaceStyle}
    table {
      width: 100%;
      border-collapse: collapse;
    }
    td {
      padding: 1px 3px;
      vertical-align: middle;
      line-height: 1.2;
    }
    tr {
      height: auto;
    }
    
    /* Header styling */
    .header-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
      min-height: 60px;
    }
    .header-logo {
      position: absolute;
      right: 0;
      top: 0;
    }
    .header-title {
      font-size: 16px;
      font-weight: bold;
      text-align: center;
    }
    
    /* Info section styling */
    .info-label {
      font-weight: bold;
      width: 15%;
    }
    .info-value {
      width: 35%;
      padding: 1px 2px;
    }
    .info-right-label {
      font-weight: bold;
      width: 15%;
      text-align: right;
      padding-right: 10px;
    }
    .info-right-value {
      width: 35%;
      padding: 1px 2px;
    }
    
    /* Section headers */
    .section-header {
      font-weight: bold;
      text-align: center;
    }
    
    /* Text alignment */
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    
    /* Column widths */
    .col-label { width: 18%; }
    .col-value { width: 8%; text-align: right; font-family: 'CrashNumberingGothic', monospace; }
    
    /* Summary row */
    .summary-row {
      font-weight: bold;
    }
    
    .footer {
      text-align: center;
      margin-top: 15px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="payslip-container">
    
    <!-- Header with Logo -->
    <div class="header-container">
      <div class="header-title">${company?.companyName || 'Hegra Holdings Lanka (Pvt) Ltd'}</div>
      <div class="header-logo">
        <img src="${logoBase64}" alt="Company Logo" style="max-width: 65px; max-height: 65px;">
      </div>
    </div>

    <!-- Employee Info -->
    <table style="margin-bottom: 15px;">
      <tr>
        <td class="info-label">Name</td>
        <td class="info-value" colspan="2">${employeeName}</td>
        <td style="width: 5%;"></td>
        <td class="info-right-label">Pay Slip</td>
        <td class="info-right-value">${periodStr}</td>
      </tr>
      <tr>
        <td class="info-label">Occupation</td>
        <td class="info-value" colspan="2">${jobTitle || ''}</td>
        <td style="width: 5%;"></td>
        <td class="info-right-label">E.P.F No</td>
        <td class="info-right-value">${employeeCode || ''}</td>
      </tr>
      <tr>
        <td class="info-label">Bank</td>
        <td class="info-value" colspan="2">${bankName}</td>
        <td style="width: 5%;"></td>
        <td class="info-right-label">Branch</td>
        <td class="info-right-value">${branchName}</td>
      </tr>
      <tr>
        <td class="info-label">Account No</td>
        <td class="info-value" colspan="2">${accountNo}</td>
        <td style="width: 5%;"></td>
        <td class="info-right-label">Paid On</td>
        <td class="info-right-value">${formattedPaymentDate || ''}</td>
      </tr>
      <tr>
        <td class="info-label">Contract No</td>
        <td class="info-value" colspan="2">${projectName || ''}</td>
        <td style="width: 5%;"></td>
        <td class="info-right-label">Location</td>
        <td class="info-right-value">${projectName || departmentName || ''}</td>
      </tr>
    </table>

    <!-- Payroll Details Table -->
    <table class="grid-border">
      <tr class="section-header">
        <td colspan="4" class="text-center">EARNINGS</td>
        <td style="width: 3%;"></td>
        <td colspan="3" class="text-center">DEDUCTIONS</td>
      </tr>

      ${(() => {
        const leftSideRows: string[] = [];
        
        // --- PREPARE LEFT SIDE (EARNINGS) ---
        // Header Row (Days, RC, DC or Custom)
        if (headerRows && headerRows.length > 0) {
          leftSideRows.push(headerRows.map((h, idx) => {
            const isLast = idx === headerRows.length - 1;
            const remaining = 4 - idx;
            const colspan = (isLast && remaining > 1) ? ` colspan="${remaining}"` : '';
            return `
              <td class="col-label" ${colspan} style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;">${h.label}: ${formatNumber(h.value)}</td>
            `;
          }).join(''));
        } else {
          leftSideRows.push(`
            <td class="col-label" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;"> Working Days: ${formatNumber(workingdays)}</td>
            <td class="col-label" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;"> RC: ${formatNumber(Number(numberofRC))}</td>
            <td class="col-label" colspan="2" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;"> DC: ${formatNumber(Number(numberofDC))}</td>
          `);
        }

        // Earnings Rows
        if (earningsRows && earningsRows.length > 0) {
          earningsRows.forEach(e => {
            leftSideRows.push(`
              <td class="col-label">${e.label}</td>
              <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(e.value)}</td>
            `);
          });
        } else {
          // Default Earnings
          leftSideRows.push(`
            <td class="col-label">Basic</td>
            <td class="col-value" colspan="3" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;">${formatValue(basicSalary)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">Bike & Fuel</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(bikeFuelValue)}</td>
          `);
          
          // Note: dynamicAllowanceRowsHtml is special because it's already HTML
          // We'll handle it below by injecting it if no earningsRows
          
          leftSideRows.push(`
            <td class="col-label">Mobile Data</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(mobilDataValue)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">Mobile Phone</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(mobilePhoneValue)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">80%</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(valueof80)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">Visit</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(valueofVisit)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">100%</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(valueof100)}</td>
          `);
          leftSideRows.push(`
            <td class="col-label">Adjustment</td>
            <td class="col-value" colspan="3" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(adjustmentNetValue)}</td>
          `);
        }

        // --- PREPARE RIGHT SIDE (DEDUCTIONS) ---
        const rightSideRows: string[] = [];
        
        // Loop through all provided deduction rows
        if (deductionRows && deductionRows.length > 0) {
          deductionRows.forEach(d => {
            if (d.label || d.value > 0) {
              rightSideRows.push(`
                <td class="col-label">${d.label || ''}</td>
                <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${d.value ? formatValue(d.value) : ''}</td>
              `);
            }
          });
        }

        // Row for Total Deduction
        rightSideRows.push(`
          <td class="col-label bold">TOTAL DEDUCTION</td>
          <td class="col-value bold" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(totalDeduction)}</td>
        `);
        // Row 5: Section Header (Employer Contribution)
        rightSideRows.push(`
          <td colspan="3" class="text-center bold" style="padding: 5px 0;">Employer Contribution</td>
        `);
        // Row 6: EPF 12%
        rightSideRows.push(`
          <td class="col-label">EPF 12%</td>
          <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(epfEmployer)}</td>
        `);
        // Row 7: ETF 3%
        rightSideRows.push(`
          <td class="col-label">ETF 3%</td>
          <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(etfEmployer)}</td>
        `);
        // Row 8: Total Contribution
        rightSideRows.push(`
          <td class="col-label bold">Total Contribution</td>
          <td class="col-value bold" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${formatValue(contributionTotal)}</td>
        `);

        // --- BALANCE ROWS (Add empty rows to shorter side) ---
        // Count dynamic allowance rows if they'll be injected (only for default earnings)
        let dynamicRowCount = 0;
        if ((!earningsRows || earningsRows.length === 0) && dynamicAllowanceRowsHtml) {
          const trMatches = dynamicAllowanceRowsHtml.match(/<tr[^>]*>/g);
          dynamicRowCount = trMatches ? trMatches.length : 0;
        }
        
        // Calculate effective row counts
        const effectiveLeftCount = leftSideRows.length + dynamicRowCount;
        const effectiveRightCount = rightSideRows.length;
        
        // Balance: add empty rows to the shorter side
        if (effectiveLeftCount < effectiveRightCount) {
          // Left side needs more rows
          const rowsToAdd = effectiveRightCount - effectiveLeftCount;
          for (let i = 0; i < rowsToAdd; i++) {
            leftSideRows.push('<td colspan="4"></td>');
          }
        } else if (effectiveRightCount < effectiveLeftCount) {
          // Right side needs more rows
          const rowsToAdd = effectiveLeftCount - effectiveRightCount;
          for (let i = 0; i < rowsToAdd; i++) {
            rightSideRows.push('<td colspan="3"></td>');
          }
        }

        // --- MERGE ROWS ---
        let htmlRows = '';
        const maxRows = Math.max(leftSideRows.length, rightSideRows.length);
        
        for (let i = 0; i < maxRows; i++) {
          const left = leftSideRows[i] || '<td colspan="4"></td>';
          const right = rightSideRows[i] || '<td colspan="3"></td>';
          
          htmlRows += `
            <tr>
              ${left}
              <td style="width: 3%;"></td>
              ${right}
            </tr>
          `;
          
          // If we are at Row 2 and NOT using dynamic earnings, inject dynamicAllowanceRowsHtml
          if (i === 2 && (!earningsRows || earningsRows.length === 0) && dynamicAllowanceRowsHtml) {
            htmlRows += dynamicAllowanceRowsHtml;
          }
        }
        
        return htmlRows;
      })()}

      <tr class="summary-row">
        <td colspan="2" class="text-center">TOTAL EARNINGS</td>
        <td class="col-value" colspan="2" style="font-size: 12px; font-family: 'CrashNumberingGothic', monospace;">${formatValue(grossSalary)}</td>
        <td style="width: 3%;"></td>
        <td colspan="2" class="text-center">NET PAY</td>
        <td class="col-value bold" style="font-size: 13px; font-family: 'CrashNumberingGothic', monospace;">${formatValue(netSalary)}</td>
      </tr>
    </table>

    <p style="margin: 5px 0; text-align: center; font-weight: bold; font-size: 14px;">Thank You for Being a Part with Us</p>

    <div class="footer">
      <p style="margin: 5px 0; text-align: left;">${company?.companyName || 'Company Name'}${
        company?.address
          ? ` | ${[
              company.address.street,
              company.address.city,
              company.address.state,
              company.address.country,
            ]
              .filter(Boolean)
              .join(', ')}`
          : ''
      }</p>
      <p style="margin: 5px 0; text-align: left;">${company?.companyPhone ? `Tel: ${company.companyPhone}` : ''}${
        company?.companyPhone && company?.companyEmail ? ' | ' : ''
      }${company?.companyEmail ? `E-mail: ${company.companyEmail}` : ''}</p>
      <p style="margin: 5px 0; text-align: left; font-size: 9px; color: #666;">${specificCode}</p>
    </div>

  </div>
</body>
</html>
`;
}