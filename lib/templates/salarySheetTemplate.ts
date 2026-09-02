/** One label/value pair as it appears on the payslip. */
export interface SalarySheetItem {
  label: string;
  value: number;
}

export interface SalarySheetEmployee {
  employeeId: string;
  projectDepartment: string;
  employeeName: string;
  jobTitle: string;
  basicSalary: number;
  /** Payslip header row - counts such as Working Days / RC / DC. */
  headerItems?: SalarySheetItem[];
  /** Payslip earnings rows - Bike & Fuel, Mobile Data, 100%, ... (Basic excluded). */
  earningItems?: SalarySheetItem[];
  /** @deprecated Superseded by headerItems/earningItems; still honoured as a fallback. */
  days?: number;
  /** @deprecated */ numberOfDC?: number;
  /** @deprecated */ numberOfRC?: number;
  /** @deprecated */ bikeFuel?: number;
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
  /**
   * Column plan derived from the job roles in play. Establishes which payslip
   * columns exist and in what order, so the sheet keeps a stable shape even for
   * employees whose own rows are missing a field. Labels found on employees but
   * absent here are appended rather than dropped.
   */
  columns?: {
    headerLabels?: string[];
    earningLabels?: string[];
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

  // ── Dynamic payslip columns ────────────────────────────────────────────────
  //
  // Every job role designs its own payslip, so the columns between BASIC and
  // GROSS are the union of the labels actually present across these employees,
  // in first-seen order. An employee whose role lacks a column simply prints 0
  // there.

  // Employees sent before headerItems/earningItems existed still carry the four
  // flat fields; fold those into the item shape so there is one rendering path.
  const rows = employees.map((emp) => {
    const legacy =
      emp.days !== undefined ||
      emp.numberOfDC !== undefined ||
      emp.numberOfRC !== undefined ||
      emp.bikeFuel !== undefined;

    return {
      emp,
      headerItems:
        emp.headerItems?.length
          ? emp.headerItems
          : legacy
            ? [
                { label: 'Working Days', value: emp.days || 0 },
                { label: 'RC', value: emp.numberOfRC || 0 },
                { label: 'DC', value: emp.numberOfDC || 0 },
              ]
            : [],
      earningItems:
        emp.earningItems?.length
          ? emp.earningItems
          : legacy
            ? [{ label: 'Bike & Fuel', value: emp.bikeFuel || 0 }]
            : [],
    };
  });

  const collectLabels = (
    pick: (r: (typeof rows)[number]) => SalarySheetItem[],
    seedLabels: string[] = []
  ) => {
    const order: string[] = [];
    const seen = new Set<string>();
    seedLabels.forEach((raw) => {
      const label = String(raw ?? '').trim();
      if (!label || seen.has(label.toLowerCase())) return;
      seen.add(label.toLowerCase());
      order.push(label);
    });
    rows.forEach((row) =>
      pick(row).forEach((item) => {
        const label = String(item?.label ?? '').trim();
        if (!label) return;
        const key = label.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          order.push(label);
        }
      })
    );
    return order;
  };

  const headerLabels = collectLabels((r) => r.headerItems, props.columns?.headerLabels);
  // Basic already has its own column - don't repeat it.
  const earningLabels = collectLabels(
    (r) => r.earningItems,
    props.columns?.earningLabels
  ).filter((label) => !/^basic(\s+salary)?$/i.test(label));

  const itemValue = (items: SalarySheetItem[], label: string) => {
    const hit = items.find(
      (i) => String(i?.label ?? '').trim().toLowerCase() === label.toLowerCase()
    );
    const val = Number(hit?.value);
    return isFinite(val) ? val : 0;
  };

  const columnTotal = (
    pick: (r: (typeof rows)[number]) => SalarySheetItem[],
    label: string
  ) => rows.reduce((acc, row) => acc + itemValue(pick(row), label), 0);

  // Working Days gets pulled out of the generic header columns to sit ahead of
  // BASIC, and RC/DC combine into one "Work Done" column placed just before
  // GROSS - both are removed from the generic list so they don't also render
  // in their usual spot between BASIC and the earning columns.
  const isLabel = (label: string, target: string) => label.trim().toLowerCase() === target;
  const hasWorkingDays = headerLabels.some((l) => isLabel(l, 'working days'));
  const hasWorkDone = headerLabels.some((l) => isLabel(l, 'rc') || isLabel(l, 'dc'));
  const otherHeaderLabels = headerLabels.filter(
    (l) => !isLabel(l, 'working days') && !isLabel(l, 'rc') && !isLabel(l, 'dc')
  );
  const workDoneValue = (items: SalarySheetItem[]) => itemValue(items, 'RC') + itemValue(items, 'DC');
  const workDoneTotal = () =>
    columnTotal((r) => r.headerItems, 'RC') + columnTotal((r) => r.headerItems, 'DC');

  // Wider tables need smaller type to stay inside one landscape page.
  const columnCount =
    12 +
    (hasWorkingDays ? 1 : 0) +
    otherHeaderLabels.length +
    (hasWorkDone ? 1 : 0) +
    earningLabels.length;
  const sizeClass =
    columnCount >= 30 ? 'size-xxs' : columnCount >= 23 ? 'size-xs' : columnCount >= 19 ? 'size-sm' : '';

  const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

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
          /* Wide sheets shrink so they still fit one landscape page. */
          table.size-sm th { font-size: 8px; padding: 3px 4px; }
          table.size-sm td { font-size: 7px; padding: 2px 4px; }
          table.size-xs th { font-size: 7px; padding: 3px 2px; }
          table.size-xs td { font-size: 6px; padding: 2px 2px; }
          table.size-xxs th { font-size: 6px; padding: 2px 1px; }
          table.size-xxs td { font-size: 5px; padding: 1px 1px; }
          /* Figures must never break across lines - only the text columns wrap. */
          td {
            white-space: nowrap;
          }
          th {
            white-space: normal;
          }
          td.wrap {
            white-space: normal;
            overflow-wrap: break-word;
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
          <table class="${sizeClass}">
            <thead>
              <tr>
                <th>EMP ID</th>
                <th>NAME</th>
                <th>JOB ROLE</th>
                ${hasWorkingDays ? '<th class="text-center">WORKING DAYS</th>' : ''}
                <th class="text-right">BASIC</th>
                ${otherHeaderLabels.map((label) => `<th class="text-center">${escapeHtml(label.toUpperCase())}</th>`).join('')}
                ${earningLabels.map((label) => `<th class="text-right">${escapeHtml(label.toUpperCase())}</th>`).join('')}
                ${hasWorkDone ? '<th class="text-center">WORK DONE</th>' : ''}
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
              ${rows.map(({ emp, headerItems, earningItems }) => `
                <tr>
                  <td class="emp-id">${emp.employeeId || 'N/A'}</td>
                  <td class="wrap">${emp.employeeName || 'N/A'}</td>
                  <td class="wrap">${emp.jobTitle || 'N/A'}</td>
                  ${hasWorkingDays ? `<td class="text-center">${formatCount(itemValue(headerItems, 'Working Days'))}</td>` : ''}
                  <td class="text-right">${(emp.basicSalary || 0).toFixed(2)}</td>
                  ${otherHeaderLabels.map((label) => `<td class="text-center">${formatCount(itemValue(headerItems, label))}</td>`).join('')}
                  ${earningLabels.map((label) => `<td class="text-right">${itemValue(earningItems, label).toFixed(2)}</td>`).join('')}
                  ${hasWorkDone ? `<td class="text-center">${formatCount(workDoneValue(headerItems))}</td>` : ''}
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
                ${hasWorkingDays ? `<td class="text-center">${formatCount(columnTotal((r) => r.headerItems, 'Working Days'))}</td>` : ''}
                <td class="text-right">${totals.totalBasicSalary.toFixed(2)}</td>
                ${otherHeaderLabels.map((label) => `<td class="text-center">${formatCount(columnTotal((r) => r.headerItems, label))}</td>`).join('')}
                ${earningLabels.map((label) => `<td class="text-right">${columnTotal((r) => r.earningItems, label).toFixed(2)}</td>`).join('')}
                ${hasWorkDone ? `<td class="text-center">${formatCount(workDoneTotal())}</td>` : ''}
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
