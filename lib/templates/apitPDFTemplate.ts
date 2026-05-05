const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface ApitRecord {
  period: string;
  paymentDate: string | null;
  grossSalary: number;
  apitRate: number;
  apitBracketLabel: string;
  apitAmount: number;
}

interface ApitTemplateData {
  employeeId: string;
  employeeName: string;
  company: any;
  records: ApitRecord[];
  fromYear: number;
  fromMonth: number;
  toYear: number;
  toMonth: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPeriod(period: string): string {
  const parts = period?.split('-');
  if (parts?.length === 2) {
    const month = parseInt(parts[1]);
    return `${MONTH_NAMES[month] || parts[1]} ${parts[0]}`;
  }
  return period || '-';
}

function formatBracketLabel(label: string): string {
  if (!label) return '-';
  return label.replace(' - ', ' – ').replace('and above', '& above');
}

export function generateApitPDFContent(data: ApitTemplateData): string {
  const { employeeId, employeeName, company, records, fromYear, fromMonth, toYear, toMonth } = data;

  const totalGross = records.reduce((s, r) => s + (r.grossSalary || 0), 0);
  const totalApit = records.reduce((s, r) => s + (r.apitAmount || 0), 0);

  const fromLabel = `${MONTH_NAMES[fromMonth] || fromMonth} ${fromYear}`;
  const toLabel = `${MONTH_NAMES[toMonth] || toMonth} ${toYear}`;
  const periodRange = fromYear === toYear && fromMonth === toMonth ? fromLabel : `${fromLabel} – ${toLabel}`;

  const tableRows = records
    .map(
      (r) => `
    <tr>
      <td>${formatPeriod(r.period)}</td>
      <td>${formatDate(r.paymentDate)}</td>
      <td class="text-right">${formatCurrency(r.grossSalary)}</td>
      <td>${formatBracketLabel(r.apitBracketLabel)}</td>
      <td class="text-center">${r.apitRate}%</td>
      <td class="text-right apit-amount">${formatCurrency(r.apitAmount)}</td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      size: A4 landscape;
      margin: 15mm 10mm 15mm 10mm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: white;
      font-size: 11px;
      color: #222;
    }
    .company-name {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 4px;
    }
    .report-title {
      font-size: 13px;
      text-align: center;
      color: #444;
      margin-bottom: 14px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 11px;
      color: #333;
    }
    .meta-block { line-height: 1.8; }
    .meta-label { color: #666; display: inline-block; width: 120px; }
    .meta-value { font-weight: bold; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
    }
    thead { border-bottom: 2px solid #222; }
    th {
      padding: 6px 8px;
      font-size: 10px;
      font-weight: bold;
      text-align: left;
      white-space: nowrap;
    }
    td {
      padding: 4px 8px;
      font-size: 10px;
      border-bottom: 1px solid #f0f0f0;
      white-space: nowrap;
    }
    tfoot tr { border-top: 2px solid #222; }
    tfoot td { padding: 6px 8px; border-bottom: none; font-size: 10px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .apit-amount { font-weight: bold; color: #dc2626; }
    .footer {
      margin-top: 20px;
      font-size: 9px;
      color: #999;
      text-align: center;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }
    .notice {
      margin-top: 14px;
      font-size: 9px;
      color: #666;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 6px 10px;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div class="company-name">${company?.companyName || ''}</div>
  <div class="report-title">APIT (Tax on Employment Income) Summary</div>

  <div class="meta">
    <div class="meta-block">
      <div><span class="meta-label">Employee ID</span><span class="meta-value">: ${employeeId}</span></div>
      <div><span class="meta-label">Employee Name</span><span class="meta-value">: ${employeeName || '-'}</span></div>
    </div>
    <div class="meta-block">
      <div><span class="meta-label">Period</span><span class="meta-value">: ${periodRange}</span></div>
      <div><span class="meta-label">Total Records</span><span class="meta-value">: ${records.length}</span></div>
    </div>
    <div class="meta-block">
      <div><span class="meta-label">Total APIT</span><span class="meta-value">: Rs ${formatCurrency(totalApit)}</span></div>
      <div><span class="meta-label">Generated On</span><span class="meta-value">: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Period</th>
        <th>Payment Date</th>
        <th class="text-right">Gross Salary (Rs)</th>
        <th>Tax Bracket</th>
        <th class="text-center">Rate %</th>
        <th class="text-right">APIT Amount (Rs)</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" class="text-right"><strong>TOTAL</strong></td>
        <td class="text-right"><strong>${formatCurrency(totalGross)}</strong></td>
        <td colspan="2"></td>
        <td class="text-right"><strong>${formatCurrency(totalApit)}</strong></td>
      </tr>
    </tfoot>
  </table>

  <div class="notice">
    This document is generated for internal payroll records. APIT is deducted at source as per the Inland Revenue Act of Sri Lanka.
  </div>

  <div class="footer">
    This is a system-generated report — ${company?.companyName || ''}
  </div>
</body>
</html>`;
}
