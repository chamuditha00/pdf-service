export interface SalarySheetEmployee {
  employeeId: string;
  projectDepartment: string;
  employeeName: string;
  jobTitle: string;
  basicSalary: number;
  days?: number;
  numberOfDC?: number;
  numberOfRC?: number;
  bikeFuel?: number;
  grossSalary: number;
  netSalary: number;
  deductions?: {
    epfEmployee?: number;
    epfEmployer?: number;
    etfEmployer?: number;
    advance?: number;
    noPay?: number;
    other?: number;
    losses?: number;
    deposit?: number;
  };
}

export interface SalarySheetTemplateProps {
  period: string;
  sheetType: string;
  sheetName: string;
  employees: SalarySheetEmployee[];
  totals?: {
    totalBasicSalary: number;
    totalDays?: number;
    totalDC?: number;
    totalRC?: number;
    totalBikeFuel?: number;
    totalGrossSalary: number;
    totalEpfEmp: number;
    totalEpfEmployer: number;
    totalEtfEmployer: number;
    totalAdvance: number;
    totalLosses: number;
    totalDeposit: number;
    totalNoPay: number;
    totalOther: number;
    totalNetSalary: number;
  };
  company?: {
    companyName?: string;
  };
}

export function generateSalarySheetTemplate(props: SalarySheetTemplateProps): string {
  const { period, sheetType, sheetName, employees } = props;

  // Counts (days / DC / RC) print without forced decimals; money always gets 2dp.
  const formatCount = (val: number) =>
    Number.isInteger(val) ? String(val) : val.toFixed(2);

  // Each total falls back to a column sum when the caller omits it, so a caller
  // that predates a column still renders instead of throwing on undefined.
  const sum = (pick: (emp: SalarySheetEmployee) => number | undefined) =>
    employees.reduce((acc, emp) => acc + (pick(emp) || 0), 0);
  const given: Partial<NonNullable<SalarySheetTemplateProps['totals']>> = props.totals || {};
  const resolve = (val: number | undefined, fallback: number) =>
    typeof val === 'number' && isFinite(val) ? val : fallback;

  const totals = {
    totalBasicSalary: resolve(given.totalBasicSalary, sum((e) => e.basicSalary)),
    totalDays: resolve(given.totalDays, sum((e) => e.days)),
    totalDC: resolve(given.totalDC, sum((e) => e.numberOfDC)),
    totalRC: resolve(given.totalRC, sum((e) => e.numberOfRC)),
    totalBikeFuel: resolve(given.totalBikeFuel, sum((e) => e.bikeFuel)),
    totalGrossSalary: resolve(given.totalGrossSalary, sum((e) => e.grossSalary)),
    totalEpfEmp: resolve(given.totalEpfEmp, sum((e) => e.deductions?.epfEmployee)),
    totalEpfEmployer: resolve(given.totalEpfEmployer, sum((e) => e.deductions?.epfEmployer)),
    totalEtfEmployer: resolve(given.totalEtfEmployer, sum((e) => e.deductions?.etfEmployer)),
    totalAdvance: resolve(given.totalAdvance, sum((e) => e.deductions?.advance)),
    totalLosses: resolve(given.totalLosses, sum((e) => e.deductions?.losses)),
    totalDeposit: resolve(given.totalDeposit, sum((e) => e.deductions?.deposit)),
    totalNoPay: resolve(given.totalNoPay, sum((e) => e.deductions?.noPay)),
    totalOther: resolve(given.totalOther, sum((e) => e.deductions?.other)),
    totalNetSalary: resolve(given.totalNetSalary, sum((e) => e.netSalary)),
  };

  return `
    <html>
      <head>
        <title>Payroll Report - ${period}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px 20px 40px 20px;
            background-color: white;
          }
          .container {
            max-width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
          }
          .title {
            font-size: 14px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .period-info {
            font-size: 9px;
            color: #666;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            border-bottom: 2px solid #000;
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
          th {
            padding: 4px 6px;
            text-align: left;
            font-weight: bold;
            border: none;
            font-size: 9px;
          }
          td {
            padding: 2px 6px;
            border: none;
            font-size: 8px;
            line-height: 1.15;
          }
          tbody tr:nth-child(even) {
            background-color: transparent;
          }
          tbody tr:hover {
            background-color: transparent;
          }
          tfoot tr {
            background-color: transparent;
            font-weight: bold;
            border-top: 2px solid #000;
          }
          tfoot td {
            padding: 6px 8px;
            border: none;
          }
          .th-sub {
            font-weight: normal;
            font-size: 7px;
            color: #666;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .emp-id {
            font-weight: 500;
          }
          .footer-section {
            margin-top: 30px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding-top: 10px;
          }
          .footer-left {
            flex: 1;
          }
          .footer-left p {
            margin: 3px 0;
            font-size: 8px;
            color: #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">Payroll Report</div>
            <div class="period-info">
              Period: ${period} | Type: ${sheetType} | Sheet: ${sheetName} | Total Employees: ${employees.length}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>JOB ROLE</th>
                <th class="text-right">BASIC</th>
                <th class="text-center">DAYS</th>
                <th class="text-center">DC</th>
                <th class="text-center">RC</th>
                <th class="text-right">PAYSHEET<br><span class="th-sub">(Bike &amp; Fuel)</span></th>
                <th class="text-right">GROSS</th>
                <th class="text-right">EPF(8%)</th>
                <th class="text-right">LOSSES</th>
                <th class="text-right">DEPOSIT</th>
                <th class="text-right">ADV</th>
                <th class="text-right">NO-PAY</th>
                <th class="text-right">OTHER</th>
                <th class="text-right">EPF(12%)</th>
                <th class="text-right">ETF(3%)</th>
                <th class="text-right">NET</th>
              </tr>
            </thead>
            <tbody>
              ${employees.map(emp => `
                <tr>
                  <td class="emp-id">${emp.employeeId || 'N/A'}</td>
                  <td>${emp.employeeName || 'N/A'}</td>
                  <td>${emp.jobTitle || 'N/A'}</td>
                  <td class="text-right">${(emp.basicSalary || 0).toFixed(2)}</td>
                  <td class="text-center">${formatCount(emp.days || 0)}</td>
                  <td class="text-center">${formatCount(emp.numberOfDC || 0)}</td>
                  <td class="text-center">${formatCount(emp.numberOfRC || 0)}</td>
                  <td class="text-right">${(emp.bikeFuel || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.grossSalary || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.epfEmployee || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.losses || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.deposit || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.advance || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.noPay || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.other || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.epfEmployer || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.etfEmployer || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.netSalary || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-center">TOTAL</td>
                <td class="text-right">${totals.totalBasicSalary.toFixed(2)}</td>
                <td class="text-center">${formatCount(totals.totalDays)}</td>
                <td class="text-center">${formatCount(totals.totalDC)}</td>
                <td class="text-center">${formatCount(totals.totalRC)}</td>
                <td class="text-right">${totals.totalBikeFuel.toFixed(2)}</td>
                <td class="text-right">${totals.totalGrossSalary.toFixed(2)}</td>
                <td class="text-right">${totals.totalEpfEmp.toFixed(2)}</td>
                <td class="text-right">${totals.totalLosses.toFixed(2)}</td>
                <td class="text-right">${totals.totalDeposit.toFixed(2)}</td>
                <td class="text-right">${totals.totalAdvance.toFixed(2)}</td>
                <td class="text-right">${totals.totalNoPay.toFixed(2)}</td>
                <td class="text-right">${totals.totalOther.toFixed(2)}</td>                
                <td class="text-right">${totals.totalEpfEmployer.toFixed(2)}</td>
                <td class="text-right">${totals.totalEtfEmployer.toFixed(2)}</td>
                <td class="text-right">${totals.totalNetSalary.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;
}
