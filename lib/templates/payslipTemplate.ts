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
  } = props;

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
    @font-face {
      font-family: 'CrashNumberingGothic';
      src: local('CrashNumberingGothic');
    }
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
    .header-title {
      font-size: 14px;
      font-weight: bold;
      text-align: center;
      padding: 5px 0;
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
    
    <!-- Header -->
    <table style="margin-bottom: 10px;">
      <tr>
        <td colspan="6" class="header-title">Hegra Holdings Lanka (Pvt) Ltd</td>
      </tr>
    </table>

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

      <tr>
        <td class="col-label" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;"> Days: ${workingdays.toFixed(0)}</td>
        <td class="col-label" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;">RC: ${Number(numberofRC).toFixed(0)}</td>
        <td class="col-label" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;">DC: ${Number(numberofDC).toFixed(0)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">${deductionRows[0].label}</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${deductionRows[0].value.toFixed(2)}</td>
      </tr>

      <tr>
        <td class="col-label">Basic</td>
        <td class="col-value" colspan="2" style="font-weight: bold; font-family: 'CrashNumberingGothic', monospace;">${basicSalary.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">${deductionRows[1].label}</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${deductionRows[1].value.toFixed(2)}</td>
      </tr>

      <tr>
        <td class="col-label">Bike & Fuel</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${bikeFuelValue.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">${deductionRows[2].label}</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${deductionRows[2].value.toFixed(2)}</td>
      </tr>

      ${dynamicAllowanceRowsHtml}

      <tr>
        <td class="col-label">Mobile Data</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${mobilDataValue.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">${deductionRows[3].label}</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${deductionRows[3].value.toFixed(2)}</td>
      </tr>

      <tr>
        <td class="col-label">Mobile Phone</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${mobilePhoneValue.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label bold">TOTAL DEDUCTION</td>
        <td class="col-value bold" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${totalDeduction.toFixed(2)}</td>
      </tr>

      <tr class="section-header">
        <td colspan="3"></td>
        <td style="width: 3%;"></td>
        <td colspan="4" class="text-center bold">Employer Contribution</td>
      </tr>

      <tr>
        <td class="col-label">80%</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${valueof80.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">EPF 12%</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${epfEmployer.toFixed(2)}</td>
      </tr>

      <tr>
        <td class="col-label">Visit</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${valueofVisit.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label">ETF 3%</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${etfEmployer.toFixed(2)}</td>
      </tr>

      <tr>
        <td class="col-label">RC</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${valueofRC.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label"></td>
        <td class="col-value" colspan="2"></td>
      </tr>

      <tr>
        <td class="col-label">100%</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${valueof100.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label"></td>
        <td class="col-value" colspan="2"></td>
      </tr>

      <tr>
        <td class="col-label">Adjustment</td>
        <td class="col-value" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${adjustmentNetValue.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td class="col-label bold">Total Contribution</td>
        <td class="col-value bold" colspan="2" style="font-family: 'CrashNumberingGothic', monospace;">${contributionTotal.toFixed(2)}</td>
      </tr>

      <tr class="summary-row">
        <td colspan="2" class="text-center">TOTAL EARNINGS</td>
        <td class="col-value" style="font-size: 12px; font-family: 'CrashNumberingGothic', monospace;">${grossSalary.toFixed(2)}</td>
        <td style="width: 3%;"></td>
        <td colspan="2" class="text-center">NET PAY</td>
        <td class="col-value bold" style="font-size: 13px; font-family: 'CrashNumberingGothic', monospace;">${netSalary.toFixed(2)}</td>
      </tr>
    </table>

    <p style="margin: 5px 0; text-align: center; font-weight: bold; font-size: 14px;">Thank You for Being a Part with Us</p>

    <div class="footer" style="display: flex; justify-content: space-between; margin-top: 0; padding-top: 5px;">
      <div style="flex: 1;">
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
      <div style="flex: 0;">
        <img src="${logoBase64}" alt="Company Logo" style="max-width: 100px; max-height: 100px;">
      </div>
    </div>

  </div>
</body>
</html>
`;
}
