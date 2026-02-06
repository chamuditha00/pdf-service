// PDF Template for Deposit/Tools Reports
// Now uses the unified advancePayrollTemplate with dynamic columns
import { generateAdvancePayrollHTML, ColumnConfig } from './advancePayrollTemplate';

interface EmployeeDetail {
  employeeId: string;
  employeeName: string;
  jobRole?: string;
  depositAmount: number;
}

interface DepositToolsRecord {
  period: string;
  depositDate: string | Date;
  totalAmount: number;
}

interface Company {
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

export const generateDepositToolsPDFContent = (
  record: DepositToolsRecord,
  details: EmployeeDetail[],
  company?: Company | null
): string => {
  // Define columns for deposit/tools report
  const columns: ColumnConfig[] = [
    { label: 'EMP ID', key: 'employeeId', align: 'left' },
    { label: 'NAME', key: 'employeeName', align: 'left' },
    { label: 'JOB ROLE', key: 'jobRole', align: 'left' },
    { 
      label: 'DEPOSIT AMOUNT', 
      key: 'depositAmount', 
      align: 'right', 
      format: (v) => (v || 0).toLocaleString() 
    },
  ];

  // Map details to match expected format for template
  const enrichedEmployees = details.map(emp => ({
    employeeId: emp.employeeId,
    employeeName: emp.employeeName,
    jobRole: emp.jobRole || 'N/A',
    depositAmount: emp.depositAmount,
  }));

  // Use the unified template with configured columns
  return generateAdvancePayrollHTML({
    company: company || null,
    viewingRecord: record,
    employeeDetails: enrichedEmployees,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    title: 'Deposit/Tools Report',
    reportType: 'deposit-tools',
    totalAmount: record.totalAmount,
    columns: columns,
    customTotalLabel: 'TOTAL DEPOSIT',
  });
};
