// PDF Template for Other Deductions Reports
// Now uses the unified advancePayrollTemplate with dynamic columns
import { generateAdvancePayrollHTML, ColumnConfig } from './advancePayrollTemplate';

interface EmployeeDetail {
  displayId: string;
  employeeName: string;
  fullName?: string;
  jobRole: string;
  deductionAmount: number;
}

interface OtherDeductionsRecord {
  period: string;
  deductionDate: string | Date;
  totalAmount?: number;
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

export const generateOtherDeductionsPDFContent = (
  record: OtherDeductionsRecord,
  details: EmployeeDetail[],
  company?: Company | null
): string => {
  // Define columns for other deductions report
  const columns: ColumnConfig[] = [
    { label: 'EMP ID', key: 'displayId', align: 'left' },
    { label: 'NAME', key: 'employeeName', align: 'left' },
    { label: 'JOB ROLE', key: 'jobRole', align: 'left' },
    { 
      label: 'DEDUCTION', 
      key: 'deductionAmount', 
      align: 'right', 
      format: (v) => (v || 0).toLocaleString() 
    },
  ];

  // Map details to match expected format for template
  const enrichedEmployees = details.map(emp => ({
    displayId: emp.displayId,
    employeeName: emp.employeeName,
    jobRole: emp.jobRole,
    deductionAmount: emp.deductionAmount,
  }));

  // Use the unified template with configured columns
  return generateAdvancePayrollHTML({
    company: company || null,
    viewingRecord: record,
    employeeDetails: enrichedEmployees,
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    title: 'Other Deductions Report',
    reportType: 'other-deductions',
    totalAmount: record.totalAmount || 0,
    columns: columns,
    customTotalLabel: 'TOTAL DEDUCTIONS',
  });
};
