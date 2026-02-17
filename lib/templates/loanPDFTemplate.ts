// PDF Template for Loan Reports
// Uses the unified advancePayrollTemplate with dynamic columns
import { generateAdvancePayrollHTML, ColumnConfig } from './advancePayrollTemplate';

interface EmployeeDetail {
  displayId: string;
  employeeName: string;
  loanAmount: number;
  monthlyDeduction: number;
  installmentMonths: number;
  startMonth: number;
  startYear: number;
}

interface LoanRecord {
  period: string;
  periodMonth: number;
  periodYear: number;
  loanDate: string | Date;
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

export const generateLoanPDFContent = (
  record: LoanRecord,
  details: EmployeeDetail[],
  company?: Company | null
): string => {
  // Define columns for loan report
  const columns: ColumnConfig[] = [
    { label: 'EMP ID', key: 'displayId', align: 'left' },
    { label: 'NAME', key: 'employeeName', align: 'left' },
    { 
      label: 'START MONTH', 
      key: 'startMonthDisplay', 
      align: 'center',
      format: (v) => v || 'N/A'
    },
    { label: 'INSTALLMENTS', key: 'installmentMonths', align: 'center' },
    { label: 'MONTHLY', key: 'monthlyDeduction', align: 'right', format: (v) => (v || 0).toLocaleString() },
    { label: 'AMOUNT', key: 'loanAmount', align: 'right', format: (v) => (v || 0).toLocaleString() },
  ];
  

  // Month array for display
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Map details to match expected format for template
  const enrichedEmployees = details.map(emp => ({
    displayId: emp.displayId,
    employeeName: emp.employeeName,
    startMonth: emp.startMonth,
    startYear: emp.startYear,
    startMonthDisplay: `${months[emp.startMonth - 1]} ${emp.startYear}`,
    installmentMonths: emp.installmentMonths,
    monthlyDeduction: emp.monthlyDeduction,
    loanAmount: emp.loanAmount,
   
  }));

  // Use the unified template with configured columns
  return generateAdvancePayrollHTML({
    company: company || null,
    viewingRecord: record,
    employeeDetails: enrichedEmployees,
    months: months,
    title: 'Loan Management Report',
    reportType: 'advance',
    totalAmount: record.totalAmount,
    columns: columns,
    customTotalLabel: 'TOTAL LOAN',
  });
};
