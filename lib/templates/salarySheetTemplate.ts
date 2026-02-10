export interface SalarySheetEmployee {
  employeeId: string;
  projectDepartment: string;
  employeeName: string;
  jobTitle: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  deductions?: {
    epfEmployee?: number;
    epfEmployer?: number;
    etfEmployer?: number;
    advance?: number;
    noPay?: number;
    other?: number;
    depositTools?: number;
    lossRecovery?: number;
  };
}

export interface SalarySheetTemplateProps {
  period: string;
  sheetType: string;
  sheetName: string;
  employees: SalarySheetEmployee[];
  totals?: {
    totalBasicSalary: number;
    totalGrossSalary: number;
    totalEpfEmp: number;
    totalEpfEmployer: number;
    totalEtfEmployer: number;
    totalAdvance: number;
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

  // Calculate totals if not provided
  const totals = props.totals || {
    totalBasicSalary: employees.reduce((sum, emp) => sum + (emp.basicSalary || 0), 0),
    totalGrossSalary: employees.reduce((sum, emp) => sum + (emp.grossSalary || 0), 0),
    totalEpfEmp: employees.reduce((sum, emp) => sum + (emp.deductions?.epfEmployee || 0), 0),
    totalEpfEmployer: employees.reduce((sum, emp) => sum + (emp.deductions?.epfEmployer || 0), 0),
    totalEtfEmployer: employees.reduce((sum, emp) => sum + (emp.deductions?.etfEmployer || 0), 0),
    totalAdvance: employees.reduce((sum, emp) => sum + (emp.deductions?.advance || 0), 0),
    totalNoPay: employees.reduce((sum, emp) => sum + (emp.deductions?.noPay || 0), 0),
    totalOther: employees.reduce((sum, emp) => sum + (emp.deductions?.other || 0), 0),
    totalNetSalary: employees.reduce((sum, emp) => sum + (emp.netSalary || 0), 0),
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
          }
          thead {
            border-bottom: 2px solid #000;
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
                <th class="text-right">GROSS</th>
                <th class="text-right">EPF(8%)</th>
                <th class="text-right">EPF(12%)</th>
                <th class="text-right">ETF(3%)</th>
                <th class="text-right">ADV</th>
                <th class="text-right">NO-PAY</th>
                <th class="text-right">OTHER</th>
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
                  <td class="text-right">${(emp.grossSalary || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.epfEmployee || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.epfEmployer || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.etfEmployer || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.advance || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.noPay || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.deductions?.other || 0).toFixed(2)}</td>
                  <td class="text-right">${(emp.netSalary || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="text-center">TOTAL</td>
                <td class="text-right">${totals.totalBasicSalary.toFixed(2)}</td>
                <td class="text-right">${totals.totalGrossSalary.toFixed(2)}</td>
                <td class="text-right">${totals.totalEpfEmp.toFixed(2)}</td>
                <td class="text-right">${totals.totalEpfEmployer.toFixed(2)}</td>
                <td class="text-right">${totals.totalEtfEmployer.toFixed(2)}</td>
                <td class="text-right">${totals.totalAdvance.toFixed(2)}</td>
                <td class="text-right">${totals.totalNoPay.toFixed(2)}</td>
                <td class="text-right">${totals.totalOther.toFixed(2)}</td>
                <td class="text-right">${totals.totalNetSalary.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;
}
