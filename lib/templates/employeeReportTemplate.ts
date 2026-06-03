export interface EmployeeReportRow {
  index?: number;
  employeeId: string;
  name: string;
  commonName: string;
  department: string;
  project: string;
  status: string;
  dateOfBirth: string;
  age: string;
  joinDate: string;
  serviceDuration: string;
}

export interface EmployeeReportTemplateProps {
  reportTitle?: string;
  generatedDate: string;
  statusFilter?: string;
  departmentFilter?: string;
  projectFilter?: string;
  totalEmployees?: number;
  employeeDetails: EmployeeReportRow[];
  company?: {
    companyName?: string;
  };
}

export function generateEmployeeReportTemplate(props: EmployeeReportTemplateProps): string {
  const {
    reportTitle = 'Employee Report',
    generatedDate,
    statusFilter = 'All',
    departmentFilter = 'All',
    projectFilter = 'All',
    employeeDetails = [],
    company,
  } = props;

  const totalEmployees = props.totalEmployees ?? employeeDetails.length;
  const companyName = company?.companyName || '';

  const escapeHtml = (value: unknown): string =>
    String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');

  return `
    <html>
      <head>
        <title>${escapeHtml(reportTitle)} - ${escapeHtml(generatedDate)}</title>
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
          .company-name {
            font-size: 13px;
            font-weight: bold;
            color: #222;
            margin-bottom: 3px;
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
            padding: 3px 6px;
            border: none;
            font-size: 8.5px;
            line-height: 1.2;
          }
          tbody tr {
            border-bottom: 1px solid #e5e5e5;
          }
          tfoot tr {
            background-color: transparent;
            font-weight: bold;
            border-top: 2px solid #000;
          }
          tfoot td {
            padding: 6px 8px;
            border: none;
            font-size: 9px;
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
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            ${companyName ? `<div class="company-name">${escapeHtml(companyName)}</div>` : ''}
            <div class="title">${escapeHtml(reportTitle)}</div>
            <div class="period-info">
              Generated: ${escapeHtml(generatedDate)} | Status: ${escapeHtml(statusFilter)} | Department: ${escapeHtml(departmentFilter)} | Project: ${escapeHtml(projectFilter)} | Total Employees: ${totalEmployees}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>COMMON NAME</th>
                <th>DEPARTMENT</th>
                <th>PROJECT</th>
                <th class="text-center">STATUS</th>
                <th class="text-center">DATE OF BIRTH</th>
                <th class="text-center">AGE</th>
                <th class="text-center">JOIN DATE</th>
                <th>SERVICE DURATION</th>
              </tr>
            </thead>
            <tbody>
              ${employeeDetails.map((emp, i) => `
                <tr>
                  <td class="text-center">${emp.index ?? i + 1}</td>
                  <td class="emp-id">${escapeHtml(emp.employeeId || 'N/A')}</td>
                  <td>${escapeHtml(emp.name || 'N/A')}</td>
                  <td>${escapeHtml(emp.commonName || '-')}</td>
                  <td>${escapeHtml(emp.department || '-')}</td>
                  <td>${escapeHtml(emp.project || '-')}</td>
                  <td class="text-center">${escapeHtml(emp.status || '-')}</td>
                  <td class="text-center">${escapeHtml(emp.dateOfBirth || '-')}</td>
                  <td class="text-center">${escapeHtml(emp.age || '-')}</td>
                  <td class="text-center">${escapeHtml(emp.joinDate || '-')}</td>
                  <td>${escapeHtml(emp.serviceDuration || '-')}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="11" class="text-right">Total Employees: ${totalEmployees}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </body>
    </html>
  `;
}
