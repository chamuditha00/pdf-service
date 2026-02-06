// PDF Template for Losses Recovery Reports
// Now uses the unified advancePayrollTemplate with dynamic columns
import { generateAdvancePayrollHTML, ColumnConfig } from './advancePayrollTemplate';

interface EmployeeDetail {
  displayId: string;
  employeeName: string;
  fullName?: string;
  jobRole: string;
  lossesAmount: number;
}

interface LossesRecoveryRecord {
  period: string;
  recoveryDate: string | Date;
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

export const generateLossesRecoveryPDFContent = (
  record: LossesRecoveryRecord,
  details: EmployeeDetail[],
  company?: Company | null
): string => {
  // Define columns for losses recovery report
  const columns: ColumnConfig[] = [
    { label: 'EMP ID', key: 'displayId', align: 'left' },
    { label: 'NAME', key: 'employeeName', align: 'left' },
    { label: 'JOB ROLE', key: 'jobRole', align: 'left' },
    { 
      label: 'LOSSES AMOUNT', 
      key: 'lossesAmount', 
      align: 'right', 
      format: (v) => (v || 0).toLocaleString() 
    },
  ];

  // Map details to match expected format for template
  const enrichedEmployees = details.map(emp => ({
    displayId: emp.displayId,
    employeeName: emp.employeeName,
    jobRole: emp.jobRole,
    lossesAmount: emp.lossesAmount,
  }));

  // Use the unified template with configured columns
  return generateAdvancePayrollHTML({
    company: company || null,
    viewingRecord: record,
    employeeDetails: enrichedEmployees,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    title: 'Losses Recovery Report',
    reportType: 'losses',
    totalAmount: record.totalAmount,
    columns: columns,
    customTotalLabel: 'TOTAL LOSSES',
  });
};
