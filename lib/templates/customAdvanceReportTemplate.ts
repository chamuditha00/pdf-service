export function generateCustomAdvanceReportHTML({
  company,
  reportTitle,
  period,
  monthName,
  year,
  employeeDetails,
  totalAmount,
}: {
  company: any;
  reportTitle: string;
  period: string;
  monthName: string;
  year: number;
  employeeDetails: Array<{
    employeeId: string;
    employeeName: string;
    advances: Array<{ amount: number; date: string }>;
    totalAdvance: number;
  }>;
  totalAmount: number;
}): string {
  const companyName = company?.companyName || 'Company';
  const companyPhone = company?.companyPhone || '';
  const companyEmail = company?.companyEmail || '';

  const formattedTotalAmount = totalAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  let tableRows = '';
  employeeDetails.forEach((emp) => {
    // First row for employee
    let advancesList = '';
    emp.advances.forEach((adv) => {
      const dateObj = new Date(adv.date);
      const advDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const advAmount = adv.amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      advancesList += `
        <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #e5e7eb;">
          <span style="font-weight: 500;">${advAmount}</span>
          <span style="color: #666;">${advDate}</span>
        </div>
      `;
    });

    const empTotal = emp.totalAdvance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    tableRows += `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; text-align: left; font-weight: 600; border-right: 1px solid #e5e7eb;">${emp.employeeName}</td>
        <td style="padding: 12px; text-align: left;">
          ${advancesList}
        </td>
        <td style="padding: 12px; text-align: right; font-weight: bold; border-left: 1px solid #e5e7eb;">${empTotal}</td>
      </tr>
    `;
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 20mm 10mm 10mm 10mm;
          }
          
          html {
            height: 100%;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0 0 40px 0;
          }
          
          .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 0 8px;
          }
          
          .header {
            text-align: center;
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px solid #ddd;
            page-break-inside: avoid;
          }
          
          .title {
            font-size: 16px;
            font-weight: bold;
            color: #333;
            margin: 0;
            padding: 0;
          }
          
          .company-info {
            font-size: 12px;
            color: #333;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          .period-info {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: #333;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid #ddd;
          }
          
          .period-info-item {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .period-label {
            color: #666;
            font-weight: normal;
          }
          
          .period-value {
            font-weight: 600;
            color: #333;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          
          thead {
            background-color: #f3f4f6;
          }
          
          thead tr {
            border-bottom: 2px solid #333;
          }
          
          th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 12px;
            color: #333;
            border-right: 1px solid #d1d5db;
          }
          
          th:last-child {
            border-right: none;
            text-align: right;
          }
          
          td {
            padding: 12px;
            font-size: 11px;
            border-right: 1px solid #d1d5db;
          }
          
          td:last-child {
            border-right: none;
            text-align: right;
          }
          
          tfoot tr {
            background-color: #f9fafb;
            font-weight: bold;
            border-top: 2px solid #333;
          }
          
          tfoot td {
            padding: 12px;
            border-right: 1px solid #d1d5db;
          }
          
          tfoot td:last-child {
            border-right: none;
            text-align: right;
          }
          
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
          
          .page-number {
            text-align: center;
            font-size: 10px;
            color: #999;
            margin-top: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">${companyName} </div>
            <div class="company-info">Salary Advance Report</div>
            <div class="period-info">
              <div class="period-info-item">
                <span class="period-label">Period</span>
                <span class="period-value">: ${monthName} ${year}</span>
              </div>
              <div class="period-info-item">
                <span class="period-label">Total Employees</span>
                <span class="period-value">: ${employeeDetails.length}</span>
              </div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 30%;">Employee Name</th>
                <th style="width: 40%; text-align: left;">Advances (Amount / Date)</th>
                <th style="width: 30%; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2">TOTAL</td>
                <td>${formattedTotalAmount}</td>
              </tr>
            </tfoot>
          </table>
      </body>
    </html>
  `;
}
