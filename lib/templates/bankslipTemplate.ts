export interface BankslipEmployee {
  employeeCode: string;
  employeeName: string;
  projectName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  accountHolder: string;
}

export interface BankslipTemplateProps {
  period: string;
  employees: BankslipEmployee[];
}

export function generateBankslipTemplate(props: BankslipTemplateProps): string {
  const { period, employees } = props;

  return `
<!DOCTYPE html>
<html>
<head>
  <title>Bank Slip - ${period}</title>
  <style>
    @page {
      margin: 10mm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      margin: 0;
      padding: 10px 10px 40px 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      font-weight: bold;
      font-size: 14px;
    }
    .period {
      text-align: center;
      font-size: 12px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">Bank Slip Report</div>
  <div class="period">Period: ${period}</div>
  <table>
    <thead>
      <tr>
        <th>Employee Code</th>
        <th>Employee Name</th>
        <th>Project</th>
        <th>Bank Name</th>
        <th>Branch</th>
        <th>Account Number</th>
        <th>Account Holder</th>
      </tr>
    </thead>
    <tbody>
      ${employees.map(row => `
        <tr>
          <td>${row.employeeCode || ''}</td>
          <td>${row.employeeName}</td>
          <td>${row.projectName || ''}</td>
          <td>${row.bankName}</td>
          <td>${row.branchName}</td>
          <td>${row.accountNumber}</td>
          <td>${row.accountHolder}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
`;
}
