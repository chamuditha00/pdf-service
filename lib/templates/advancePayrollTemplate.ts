export interface ColumnConfig {
  label: string;
  key: string;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

interface TemplateProps {
  company: any;
  viewingRecord: any;
  employeeDetails: any[];
  months: string[];
  title: string;
  reportType?: 'advance' | 'other-deductions' | 'losses' | 'deposit-tools';
  totalAmount?: number;
  totalAdvance?: number;
  columns?: ColumnConfig[];
  customTotalLabel?: string;
}

export function generateAdvancePayrollHTML({
  company,
  viewingRecord,
  employeeDetails,
  months,
  title,
  reportType = 'advance',
  totalAmount,
  totalAdvance,
  columns,
  customTotalLabel = 'TOTAL',
}: TemplateProps): string {
  // Default columns for backwards compatibility
  const defaultColumns: ColumnConfig[] = [
    { label: 'EMP ID', key: 'displayId', align: 'left' },
    { label: 'NAME', key: 'employeeName', align: 'left' },
    { label: 'JOB ROLE', key: 'jobRole', align: 'left' },
    { label: 'ADVANCE', key: 'advanceAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
  ];

  const tableColumns = columns || defaultColumns;
  const total = totalAdvance || totalAmount || 0;
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
            margin: 20mm 10mm 10mm 10mm;
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
            padding-bottom: 40px;
          }
          .container {
            max-width: 100%;
            display: flex;
            flex-direction: column;
            flex-grow: 1;
          }
          .header {
        display: flex;
        justify-content: center; /* Centers the entire block */
        gap: 200px;               /* Reduced gap between left and right columns */
        margin-bottom: 20px;
        font-size: 14px;
        text-align: left;
          }
          .header-left, .header-right {
          line-height: 1.6
    }
          .title {
            font-size: 14px;
            color: #333;
            margin-bottom: 15px;
            text-align: center;
            width: 100%;
          }
          .period-label {
            font-size: 11px;
            color: #666;
            display: inline;
          }
          .period-value {
            font-size: 13px;
            font-weight: bold;
            color: #333;
            display: inline;
            margin-right: 20px;
          }
          .date-label {
            font-size: 11px;
            color: #666;
            display: inline;
          }
          .date-value {
            font-size: 12px;
            color: #333;
            display: inline;
          }
          .employees-label {
            font-size: 11px;
            color: #666;
            display: inline;
          }
          .employees-value {
            font-size: 12px;
            color: #333;
            display: inline;
            margin-right: 20px;
          }
          .total-label {
            font-size: 11px;
            color: #666;
            display: inline;
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
            padding: 3px 12px;
            margin-bottom: 2px;
            border: none;
            font-size: 11px;
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
          .emp-id {
            font-weight: 500;
          }
          .footer-section {
            margin-top: 15px;
            padding-top: 10px;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .footer-left {
            flex: 1;
          }
          .footer-left p {
            margin: 3px 0;
            font-size: 10px;
            color: #333;
          }
          .footer-right {
            text-align: right;
          }
          .footer-right img {
            max-width: 80px;
            max-height: 50px;
          }
          .page-footer {
            text-align: center;
            font-size: 9px;
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 8px;
            margin-top: 20px;
          }
          .verification-code {
            font-weight: bold;
            color: #333;
            font-family: 'Courier New', monospace;
            letter-spacing: 1px;
          }
          .page-number {
            margin-top: 3px;
            font-size: 8px;
          }
          .company-name{
            font-size:18px;
            font-weight:bold;
            text-align:center;
            margin-bottom:5px;
            width:100%;
          }
        .label {
        display: inline-block;
        width: 120px; 
        color: #666;   
        </style>
      </head>
      <body>
        <div class="container">
        <div class="company-name">${company?.companyName || ''}</div>
          <div class="title">${title || 'Salary Advance Payroll Report'}</div>
          <div class="header">
            <div class="header-left">
              <div><span class="label">Period </span> <span class="period-value">:    ${viewingRecord.periodYear} ${months[viewingRecord.periodMonth - 1]}</span></div>
              <div><span class="label">Date </span> <span class="date-value">:    ${new Date(viewingRecord.advanceDate || viewingRecord.recoveryDate || viewingRecord.depositDate || viewingRecord.deductionDate).toLocaleDateString()}</span></div>
            </div>
            <div class="header-right">
              <div><span class="label">Total Employees </span> <span class="employees-value">:  ${employeeDetails.length}</span></div>
              <div><span class="label">Total </span> <span class="total-value">:  Rs ${total.toLocaleString()}</span></div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                ${tableColumns.map(col => `<th style="text-align: ${col.align || 'left'}">${col.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${employeeDetails.map(emp => `
                <tr>
                  ${tableColumns.map(col => `
                    <td class="emp-id" style="text-align: ${col.align || 'left'}">
                      ${col.format ? col.format(emp[col.key]) : (emp[col.key] || 'N/A')}
                    </td>
                  `).join('')}
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="${tableColumns.length - 1}" class="text-center">${customTotalLabel}</td>
                <td class="text-right">${total.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;
}
