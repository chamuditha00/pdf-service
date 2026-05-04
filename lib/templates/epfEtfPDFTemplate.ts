const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface FixedAllowance {
  name: string;
  value: number;
}

interface EPFRecord {
  period: string;
  year: string;
  month: string;
  paymentDate: string | null;
  basicSalary: number;
  fixedAllowances: FixedAllowance[];
  fixedAllowanceTotal: number;
  epfEmployeeContribution: number;
  epfEmployerContribution: number;
  totalEPF: number;
  status: string;
}

interface ETFRecord {
  period: string;
  year: string;
  month: string;
  paymentDate: string | null;
  basicSalary: number;
  fixedAllowances: FixedAllowance[];
  fixedAllowanceTotal: number;
  etfEmployerContribution: number;
  totalETF: number;
  status: string;
}

interface EPFETFTemplateData {
  type: 'epf' | 'etf';
  employeeId: string;
  employeeName: string;
  nic: string;
  company: any;
  records: EPFRecord[] | ETFRecord[];
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

export function generateEPFETFPDFContent(data: EPFETFTemplateData): string {
  const { type, employeeId, employeeName, nic, company, records } = data;
  const isEPF = type === 'epf';
  const title = isEPF ? 'EPF Contribution Request' : 'ETF Contribution Request';

  const epfRecords = records as EPFRecord[];
  const etfRecords = records as ETFRecord[];

  const totalEPFEmployee = isEPF
    ? epfRecords.reduce((s, r) => s + r.epfEmployeeContribution, 0)
    : 0;
  const totalEPFEmployer = isEPF
    ? epfRecords.reduce((s, r) => s + r.epfEmployerContribution, 0)
    : 0;
  const totalEPF = isEPF
    ? epfRecords.reduce((s, r) => s + r.totalEPF, 0)
    : 0;
  const totalETFEmployer = !isEPF
    ? etfRecords.reduce((s, r) => s + r.etfEmployerContribution, 0)
    : 0;
  const grandTotal = isEPF ? totalEPF : totalETFEmployer;

  const epfRows = isEPF
    ? epfRecords
        .map(
          (r) => `
      <tr>
        <td>${r.year}</td>
        <td>${MONTH_NAMES[parseInt(r.month)] || r.month}</td>
        <td>${formatDate(r.paymentDate)}</td>
        <td class="text-right">${formatCurrency(r.basicSalary)}</td>
        <td class="text-right">${r.fixedAllowanceTotal > 0 ? formatCurrency(r.fixedAllowanceTotal) : '-'}</td>
        <td class="text-right">${formatCurrency(r.epfEmployeeContribution)}</td>
        <td class="text-right">${formatCurrency(r.epfEmployerContribution)}</td>
        <td class="text-right"><strong>${formatCurrency(r.totalEPF)}</strong></td>
        <td class="status-${r.status}">${r.status === 'complete' ? 'Paid' : 'Pending'}</td>
      </tr>`
        )
        .join('')
    : etfRecords
        .map(
          (r) => `
      <tr>
        <td>${r.year}</td>
        <td>${MONTH_NAMES[parseInt(r.month)] || r.month}</td>
        <td>${formatDate(r.paymentDate)}</td>
        <td class="text-right">${formatCurrency(r.basicSalary)}</td>
        <td class="text-right">${r.fixedAllowanceTotal > 0 ? formatCurrency(r.fixedAllowanceTotal) : '-'}</td>
        <td class="text-right"><strong>${formatCurrency(r.etfEmployerContribution)}</strong></td>
        <td class="status-${r.status}">${r.status === 'complete' ? 'Paid' : 'Pending'}</td>
      </tr>`
        )
        .join('');

  const epfFooter = isEPF
    ? `
    <tfoot>
      <tr>
        <td colspan="5" class="text-right"><strong>TOTAL</strong></td>
        <td class="text-right"><strong>${formatCurrency(totalEPFEmployee)}</strong></td>
        <td class="text-right"><strong>${formatCurrency(totalEPFEmployer)}</strong></td>
        <td class="text-right"><strong>${formatCurrency(totalEPF)}</strong></td>
        <td></td>
      </tr>
    </tfoot>`
    : `
    <tfoot>
      <tr>
        <td colspan="5" class="text-right"><strong>TOTAL</strong></td>
        <td class="text-right"><strong>${formatCurrency(totalETFEmployer)}</strong></td>
        <td></td>
      </tr>
    </tfoot>`;

  const epfHeaders = isEPF
    ? `<th>Year</th><th>Month</th><th>Payment Date</th><th class="text-right">Basic Salary</th><th class="text-right">Fix Allowance</th><th class="text-right">EPF (Employee)</th><th class="text-right">EPF (Employer)</th><th class="text-right">Total EPF</th><th>Status</th>`
    : `<th>Year</th><th>Month</th><th>Payment Date</th><th class="text-right">Basic Salary</th><th class="text-right">Fix Allowance</th><th class="text-right">ETF (Employer)</th><th>Status</th>`;

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
    .meta-label { color: #666; display: inline-block; width: 110px; }
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
    .status-complete { color: #10b981; font-weight: bold; }
    .status-incomplete { color: #f59e0b; font-weight: bold; }
    .footer {
      margin-top: 20px;
      font-size: 9px;
      color: #999;
      text-align: center;
      border-top: 1px solid #ddd;
      padding-top: 6px;
    }
  </style>
</head>
<body>
  <div class="company-name">${company?.companyName || ''}</div>
  <div class="report-title">${title}</div>

  <div class="meta">
    <div class="meta-block">
      <div><span class="meta-label">Employee ID</span><span class="meta-value">: ${employeeId}</span></div>
      <div><span class="meta-label">NIC</span><span class="meta-value">: ${nic || '-'}</span></div>
      <div><span class="meta-label">Employee Name</span><span class="meta-value">: ${employeeName}</span></div>
    </div>
    <div class="meta-block">
      <div><span class="meta-label">Total Records</span><span class="meta-value">: ${records.length}</span></div>
      <div><span class="meta-label">Grand Total</span><span class="meta-value">: Rs ${formatCurrency(grandTotal)}</span></div>
    </div>
    <div class="meta-block">
      <div><span class="meta-label">Generated On</span><span class="meta-value">: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>${epfHeaders}</tr>
    </thead>
    <tbody>
      ${epfRows}
    </tbody>
    ${epfFooter}
  </table>

  <div class="footer">
    This is a system-generated report — ${company?.companyName || ''}
  </div>
</body>
</html>`;
}
