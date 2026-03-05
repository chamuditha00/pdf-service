import { SalarySheetTemplateProps, SalarySheetEmployee } from './salarySheetTemplate';

export const salarySheetSummaryTemplate = (data: SalarySheetTemplateProps) => {
  const { period, employees } = data;

  const formatAmount = (value: number): string =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const calculateTotalDeductions = (emp: SalarySheetEmployee): number => {
    const deductions = emp.deductions;
    return (
      (deductions?.epfEmployee ?? 0) +
      (deductions?.epfEmployer ?? 0) +
      (deductions?.etfEmployer ?? 0) +
      (deductions?.advance ?? 0) +
      (deductions?.losses ?? 0) +
      (deductions?.deposit ?? 0) +
      (deductions?.noPay ?? 0) +
      (deductions?.other ?? 0)
    );
  };

  // Group employees by project/department
  const groupedEmployees = employees.reduce((groups: { [key: string]: SalarySheetEmployee[] }, emp: SalarySheetEmployee) => {
    const project = emp.projectDepartment;
    if (!groups[project]) {
      groups[project] = [];
    }
    groups[project].push(emp);
    return groups;
  }, {});

  // Generate table rows with project headers
  const tableRows = Object.entries(groupedEmployees)
    .map(([project, projectEmployees]) => {
      const projectName = project || 'Unassigned Project';
      const projectTotals = projectEmployees.reduce(
        (totals, emp) => ({
          basicSalary: totals.basicSalary + emp.basicSalary,
          grossSalary: totals.grossSalary + emp.grossSalary,
          epfEmployee: totals.epfEmployee + (emp.deductions?.epfEmployee ?? 0),
          losses: totals.losses + (emp.deductions?.losses ?? 0),
          deposit: totals.deposit + (emp.deductions?.deposit ?? 0),
          advance: totals.advance + (emp.deductions?.advance ?? 0),
          noPay: totals.noPay + (emp.deductions?.noPay ?? 0),
          other: totals.other + (emp.deductions?.other ?? 0),
          epfEmployer: totals.epfEmployer + (emp.deductions?.epfEmployer ?? 0),
          etfEmployer: totals.etfEmployer + (emp.deductions?.etfEmployer ?? 0),
          netSalary: totals.netSalary + emp.netSalary,
        }),
        {
          basicSalary: 0,
          grossSalary: 0,
          epfEmployee: 0,
          losses: 0,
          deposit: 0,
          advance: 0,
          noPay: 0,
          other: 0,
          epfEmployer: 0,
          etfEmployer: 0,
          netSalary: 0,
        }
      );

      const projectHeader = `
        <tr class="project-header">
          <td colspan="14">PROJECT: ${projectName}</td>
        </tr>
      `;
      
      const employeeRows = projectEmployees
        .map((emp: SalarySheetEmployee) => `
          <tr>
            <td>${emp.employeeId}</td>
            <td>${emp.employeeName}</td>
            <td>${emp.jobTitle}</td>
            <td class="currency">${formatAmount(emp.basicSalary)}</td>
            <td class="currency">${formatAmount(emp.grossSalary)}</td>
            <td class="currency">${formatAmount(emp.deductions?.epfEmployee ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.losses ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.deposit ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.advance ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.noPay ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.other ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.epfEmployer ?? 0)}</td>
            <td class="currency">${formatAmount(emp.deductions?.etfEmployer ?? 0)}</td>
            <td class="currency bold">${formatAmount(emp.netSalary)}</td>
          </tr>
        `)
        .join('');

      const projectTotalRow = `
        <tr class="project-total-row">
          <td colspan="3"></td>
          <td class="currency">${formatAmount(projectTotals.basicSalary)}</td>
          <td class="currency">${formatAmount(projectTotals.grossSalary)}</td>
          <td class="currency">${formatAmount(projectTotals.epfEmployee)}</td>
          <td class="currency">${formatAmount(projectTotals.losses)}</td>
          <td class="currency">${formatAmount(projectTotals.deposit)}</td>
          <td class="currency">${formatAmount(projectTotals.advance)}</td>
          <td class="currency">${formatAmount(projectTotals.noPay)}</td>
          <td class="currency">${formatAmount(projectTotals.other)}</td>
          <td class="currency">${formatAmount(projectTotals.epfEmployer)}</td>
          <td class="currency">${formatAmount(projectTotals.etfEmployer)}</td>
          <td class="currency bold">${formatAmount(projectTotals.netSalary)}</td>
        </tr>
      `;
      
      return projectHeader + employeeRows + projectTotalRow;
    })
    .join('');

  const totalNetSalary = employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + emp.netSalary, 0);
  const totalGrossSalary = employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + emp.grossSalary, 0);
  const totalDeductions = employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + calculateTotalDeductions(emp), 0);
  const totalEmployees = employees.length;
  const currentDate = new Date().toLocaleDateString('en-GB');

  return `
    <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px 20px 40px 20px; 
          }
          .container { 
            max-width: 100%; 
          }
          .header { 
            margin-bottom: 5px;
          }
          .company-header {
            text-align: center;
            margin-bottom: 5px;
          }
          .company-header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 10px 0;
          }
          .report-title {
            font-size: 14px;
            color: #333;
            margin: 0;
          }
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 10px;
          }
          .left-info, .right-info {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .info-row .label {
            font-weight: normal;
            min-width: 140px;
            font-size: 11px;
          }
          .info-row .colon {
            margin: 0 5px;
          }
          .info-row .value {
            font-weight: normal;
            font-size: 11px;
            font-weight: bold;
          }
          .content h2 { 
            text-align: center; 
            margin: 20px 0; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
          }
          th, td { 
            border: none;
            padding: 4px 5px; 
            font-size: 10px;
          }
          th { 
            background-color: #fff; 
            font-weight: bold;
            text-align: center;
            white-space: nowrap;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          td {
            background-color: #fff;
            text-align: left;
          }
          .project-header td {
            font-weight: bold;
            background-color: #f5f5f5;
            padding: 4px 5px;
            font-size: 11px;
            border-top: 1px solid #ddd;
            border-bottom: 1px solid #ddd;
            text-align: left;
          }
          .project-total-row td {
            font-weight: bold;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            background-color: #fafafa;
          }
          .footer { 
            text-align: center; 
            margin-top: 20px; 
            font-size: 10px; 
            color: #777; 
          }
          .currency { 
            text-align: right; 
          }
          .bold { 
            font-weight: bold; 
          }
          .total-row td { 
            background-color: #fff; 
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
          }
          .total-row td:first-child {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="company-header">
              <h1>Hegra Holdings Lanka (PVT) Ltd</h1>
              <h3>Salary Sheet Summary - ${period}</h3>
              <p class="report-title">Salary Advance Payroll Report</p>
            </div>
            
            <div class="header-info">
              <div class="left-info">
                <div class="info-row">
                  <span class="label">Period</span>
                  <span class="colon">:</span>
                  <span class="value">${period}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date</span>
                  <span class="colon">:</span>
                  <span class="value">${currentDate}</span>
                </div>
              </div>
              
              <div class="right-info">
                <div class="info-row">
                  <span class="label">Total Employees</span>
                  <span class="colon">:</span>
                  <span class="value">${totalEmployees}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total</span>
                  <span class="colon">:</span>
                  <span class="value">Rs ${formatAmount(totalNetSalary)}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="content">
            
            <table>
              <thead>
                <tr>
                  <th>EMP ID</th>
                  <th>NAME</th>
                  <th>JOB ROLE</th>
                  <th>BASIC</th>
                  <th>GROSS</th>
                  <th>EPF(8%)</th>
                  <th>LOSSES</th>
                  <th>DEPOSIT</th>
                  <th>ADV</th>
                  <th>NO-PAY</th>
                  <th>OTHER</th>
                  <th>EPF(12%)</th>
                  <th>ETF(3%)</th>
                  <th>NET</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
                <tr class="total-row">
                  <td colspan="3">TOTAL</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + emp.basicSalary, 0))}</td>
                  <td class="currency">${formatAmount(totalGrossSalary)}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.epfEmployee ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.losses ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.deposit ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.advance ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.noPay ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.other ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.epfEmployer ?? 0), 0))}</td>
                  <td class="currency">${formatAmount(employees.reduce((sum: number, emp: SalarySheetEmployee) => sum + (emp.deductions?.etfEmployer ?? 0), 0))}</td>
                  <td class="currency bold">${formatAmount(totalNetSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  `;
};