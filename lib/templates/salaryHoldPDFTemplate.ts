import { ColumnConfig, generateAdvancePayrollHTML } from './advancePayrollTemplate';

interface SalaryHoldRecord {
  period?: string;
  periodMonth?: number;
  periodYear?: number;
  holdDate?: string;
  releasedDate?: string;
  reportType?: 'hold' | 'release';
  totalHoldAmount?: number;
  totalDeductionAmount?: number;
  totalReleaseAmount?: number;
}

interface SalaryHoldDetail {
  displayId: string;
  employeeName: string;
  holdType?: string;
  holdAmount?: number;
  holdReason?: string;
  releaseAmount?: number;
  totalDeductionAmount?: number;
  releaseReason?: string;
}

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const generateSalaryHoldPDFContent = (
  record: SalaryHoldRecord,
  details: SalaryHoldDetail[],
  company: any
): string => {
  const isRelease = record?.reportType === 'release';

  const columns: ColumnConfig[] = isRelease
    ? [
        { label: 'EMP ID', key: 'displayId', align: 'left' },
        { label: 'NAME', key: 'employeeName', align: 'left' },
        { label: 'HOLD', key: 'holdAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
        { label: 'DEDUCTION', key: 'totalDeductionAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
        { label: 'RELEASE', key: 'releaseAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
        { label: 'RELEASE REASON', key: 'releaseReason', align: 'left' },
      ]
    : [
        { label: 'EMP ID', key: 'displayId', align: 'left' },
        { label: 'NAME', key: 'employeeName', align: 'left' },
        { label: 'HOLD TYPE', key: 'holdType', align: 'left' },
        { label: 'HOLD AMOUNT', key: 'holdAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
        { label: 'HOLD REASON', key: 'holdReason', align: 'left' },
      ];

  const periodMonth = record?.periodMonth || 1;
  const periodYear = record?.periodYear || new Date().getFullYear();
  const reportDate =
    record?.releasedDate || record?.holdDate || new Date().toISOString();

  const viewingRecord = {
    periodMonth,
    periodYear,
    advanceDate: reportDate,
  };

  const total = isRelease
    ? record?.totalReleaseAmount || 0
    : record?.totalHoldAmount || 0;

  return generateAdvancePayrollHTML({
    company,
    viewingRecord,
    employeeDetails: details,
    months,
    title: isRelease ? 'Salary Hold Release Report' : 'Salary Hold Report',
    columns,
    totalAdvance: total,
    customTotalLabel: isRelease ? 'TOTAL RELEASE' : 'TOTAL HOLD',
  });
};
