/**
 * Monthly Advance Summary PDF Template
 */

export interface MonthlyAdvanceEmployee {
  displayId: string;
  employeeName: string;
  jobRole: string;
  advances: Array<{
    amount: number;
    date: string;
  }>;
  totalAdvance: number;
}

export interface MonthlyAdvanceSummaryData {
  company: {
    companyName?: string;
  };
  periodYear: number;
  periodMonth: number;
  months: string[];
  employees: MonthlyAdvanceEmployee[];
  grandTotal: number;
  title?: string;
}

export function generateMonthlyAdvanceSummaryHTML(data: MonthlyAdvanceSummaryData): string {
  const { company, periodYear, periodMonth, months, employees, grandTotal, title } = data;

  const tableRows = employees.map(emp => {
    const advCount = emp.advances.length || 1;

    if (emp.advances.length === 0) {
      // No advances — single row with dash
      return `
        <tbody>
          <tr class="emp-last-row">
            <td style="text-align: left; vertical-align: middle;">${emp.displayId || 'N/A'}</td>
            <td style="text-align: left; vertical-align: middle;">${emp.employeeName || 'N/A'}</td>
            <td style="text-align: left; vertical-align: middle;">${emp.jobRole || 'N/A'}</td>
            <td style="text-align: left; vertical-align: middle; padding: 6px 12px;">-</td>
            <td style="text-align: left; vertical-align: middle; padding: 6px 12px;">-</td>
            <td style="text-align: right; font-weight: bold; vertical-align: middle;">${emp.totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      `;
    }

    // Build rows: first row has rowspan cells, subsequent rows only have amount+date
    const rows = emp.advances.map((adv, idx) => {
      const dateObj = new Date(adv.date);
      const dateStr = `${String(dateObj.getMonth() + 1).padStart(2, '0')}/${String(dateObj.getDate()).padStart(2, '0')}/${dateObj.getFullYear()}`;
      const amountStr = adv.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      if (idx === 0) {
        // First row with rowspan cells (EMP ID, NAME, JOB ROLE, TOTAL)
        const rowspanAttr = advCount > 1 ? `rowspan="${advCount}"` : '';
        
        return `
          <tr>
            <td style="text-align: left; vertical-align: middle;" ${rowspanAttr}>${emp.displayId || 'N/A'}</td>
            <td style="text-align: left; vertical-align: middle;" ${rowspanAttr}>${emp.employeeName || 'N/A'}</td>
            <td style="text-align: left; vertical-align: middle;" ${rowspanAttr}>${emp.jobRole || 'N/A'}</td>
            <td style="text-align: left; padding: 4px 12px;">${amountStr}</td>
            <td style="text-align: left; padding: 4px 12px;">${dateStr}</td>
            <td style="text-align: right; font-weight: bold; vertical-align: middle;" ${rowspanAttr}>${emp.totalAdvance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `;
      } else {
        // Subsequent advance rows: only amount and date cells
        return `
          <tr>
            <td style="text-align: left; padding: 4px 12px;">${amountStr}</td>
            <td style="text-align: left; padding: 4px 12px;">${dateStr}</td>
          </tr>
        `;
      }
    });

    return `<tbody>${rows.join('')}</tbody>`;
  }).join('');

  const grandTotalRow = `
    <tbody>
      <tr>
         <td colspan="5" class="text-center" style="padding: 8px 12px; font-weight: bold; border-top: 1px solid #000;">GRAND TOTAL</td>
        <td class="text-right" style="padding: 8px 12px; font-weight: bold; border-top: 1px solid #000;">
          ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </td>
      </tr>
    </tbody>
  `;

  return `
    <html>
      <head>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          @page {
            size: A4;
            margin: 20mm 10mm 25mm 10mm;
          }
          @page :last {
            margin-bottom: 30mm;
          }
          html {
            height: 100%;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: white;
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          .container {
            max-width: 100%;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }
          .header {
            display: flex;
            justify-content: center;
            gap: 200px;
            margin-bottom: 20px;
            font-size: 14px;
            text-align: left;
          }
          .header-left, .header-right {
            line-height: 1.6;
          }
          .title {
            font-size: 14px;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
            width: 100%;
          }
          .period-value {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            display: inline;
            margin-right: 20px;
          }
          .employees-value {
            font-size: 12px;
            color: #333;
            display: inline;
            margin-right: 20px;
          }
          .total-value {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            display: inline;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          thead {
            border-bottom: 1px solid #000;
          }
          th {
            padding: 8px 12px;
            text-align: left;
            font-weight: bold;
            border: none;
            font-size: 12px;
          }
          td {
            padding: 6px 12px;
            border: none;
            font-size: 11px;
          }
          tbody {
            page-break-inside: avoid;
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
            border-top: 1px solid #000;
          }
          tfoot td {
            padding: 8px 12px;
            border: none;
          }
          .text-right {
            text-align: right;
          }
          .text-center {
            text-align: center;
          }
          .company-name {
            font-size: 18px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 5px;
            width: 100%;
          }
          .label {
            display: inline-block;
            width: 120px;
            color: #666;
          }
          .grand-total-row {
             page-break-inside: avoid;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="company-name">${company?.companyName || ''}</div>
          <div class="title">${title || 'Monthly Salary Advance Summary Report'}</div>
          <div class="header">
            <div class="header-left">
              <div><span class="label">Period </span> <span class="period-value">:    ${periodYear} ${months[periodMonth - 1]}</span></div>
              <div><span class="label">Generated </span> <span class="employees-value">:    ${new Date().toLocaleDateString()}</span></div>
            </div>
            <div class="header-right">
              <div><span class="label">Total Employees </span> <span class="employees-value">:  ${employees.length}</span></div>
              <div><span class="label">Total </span> <span class="total-value">:  Rs ${grandTotal.toLocaleString()}</span></div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align: left; width: 10%;">EMP ID</th>
                <th style="text-align: left; width: 18%;">NAME</th>
                <th style="text-align: left; width: 22%;">JOB ROLE</th>
                <th style="text-align: left; width: 15%;">AMOUNT</th>
                <th style="text-align: left; width: 15%;">DATE</th>
                <th style="text-align: right; width: 20%;">TOTAL ADVANCE</th>
              </tr>
            </thead>
            ${tableRows}
            ${grandTotalRow}
          </table>
        </div>
      </body>
    </html>
  `;
}
