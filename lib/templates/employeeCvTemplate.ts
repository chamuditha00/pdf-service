export interface EmployeeCvPhone {
  number: string;
  type?: 'mobile' | 'home' | 'work' | 'other';
  isWhatsApp?: boolean;
}

export interface EmployeeCvAddress {
  streetName?: string;
  city?: string;
  province?: string;
}

export interface EmployeeCvRelation {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  address?: string;
}

export interface EmployeeCvDocument {
  fileName?: string;
  documentCategory?: string;
  documentType?: 'original' | 'copy';
  nameOnly?: boolean;
  uploadedAt?: string;
  expiryDate?: string;
}

export interface EmployeeCvSalaryHold {
  status?: string;
  period?: string;
  amount?: number;
  deductionAmount?: number;
  releaseAmount?: number;
  heldOn?: string;
  releasedOn?: string;
  reason?: string;
  releaseReason?: string;
}

export interface EmployeeCvTemplateProps {
  company?: {
    companyName?: string;
    companyLogo?: string;
    companyEmail?: string;
    companyPhone?: string;
  };
  logoBase64?: string;
  generatedDate: string;
  employee: {
    employeeId?: string;
    fullName?: string;
    nameWithInitial?: string;
    status?: string;
    employmentType?: string;
  };
  sections: {
    personalInfo?: {
      fullName?: string;
      initial?: string;
      surname?: string;
      commonName?: string;
      idCardNumber?: string;
      tinNumber?: string;
      dateOfBirth?: string;
      gender?: string;
    };
    employment?: {
      employmentType?: string;
      joinDate?: string;
      durationMonths?: number;
      employmentEndDate?: string;
      resignationDate?: string;
      jobTitle?: string;
      reportingManager?: string;
      project?: string;
      department?: string;
    };
    contact?: {
      email?: string;
      phoneNumbers?: EmployeeCvPhone[];
    };
    bankDetails?: {
      bankName?: string;
      branchName?: string;
      branchCode?: string;
      accountNumber?: string;
    };
    address?: {
      residentialAddress?: EmployeeCvAddress;
      permanentAddress?: EmployeeCvAddress;
    };
    relations?: EmployeeCvRelation[];
    documents?: EmployeeCvDocument[];
    leaveSummary?: {
      totalLeaveDays?: number;
      monthlyDays?: { month: string; days: number }[];
    };
    salaryHolds?: EmployeeCvSalaryHold[];
  };
}

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function formatAddress(address?: { streetName?: string; city?: string; province?: string }): string {
  if (!address) return '-';
  const parts = [address.streetName, address.city, address.province].filter(Boolean);
  return parts.length ? escapeHtml(parts.join(', ')) : '-';
}

function formatCurrency(value?: number): string {
  if (value === undefined || value === null) return '-';
  return `LKR ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function sectionCard(title: string, bodyHtml: string): string {
  return `
    <div class="section">
      <div class="section-title">${escapeHtml(title)}</div>
      <div class="section-body">${bodyHtml}</div>
    </div>
  `;
}

function infoGrid(items: Array<{ label: string; value?: string }>): string {
  return `
    <div class="info-grid">
      ${items
        .map(
          (item) => `
        <div class="info-item">
          <div class="info-label">${escapeHtml(item.label)}</div>
          <div class="info-value">${item.value ? escapeHtml(item.value) : '-'}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

export function generateEmployeeCvTemplate(props: EmployeeCvTemplateProps): string {
  const { company, logoBase64, generatedDate, employee, sections = {} } = props;
  const companyName = company?.companyName || '';
  const logoImg = logoBase64 ? `<img src="${logoBase64}" alt="Company Logo" class="company-logo" />` : '';

  const sectionsHtml: string[] = [];

  if (sections.personalInfo) {
    const p = sections.personalInfo;
    sectionsHtml.push(
      sectionCard(
        'Personal Information',
        infoGrid([
          { label: 'Full Name', value: p.fullName },
          { label: 'Initial', value: p.initial },
          { label: 'Surname', value: p.surname },
          { label: 'Common Name', value: p.commonName },
          { label: 'ID Card Number', value: p.idCardNumber },
          { label: 'TIN Number', value: p.tinNumber },
          { label: 'Date of Birth', value: p.dateOfBirth },
          { label: 'Gender', value: p.gender ? p.gender.charAt(0).toUpperCase() + p.gender.slice(1) : undefined },
        ])
      )
    );
  }

  if (sections.employment) {
    const e = sections.employment;
    const items = [
      { label: 'Employment Type', value: e.employmentType ? e.employmentType.charAt(0).toUpperCase() + e.employmentType.slice(1) : undefined },
      { label: 'Join Date', value: e.joinDate },
      { label: 'Job Title', value: e.jobTitle },
      { label: 'Reporting Manager', value: e.reportingManager },
      { label: 'Project', value: e.project },
      { label: 'Department', value: e.department },
    ];
    if (e.durationMonths) items.push({ label: 'Duration', value: `${e.durationMonths} Month(s)` });
    if (e.employmentEndDate) items.push({ label: 'End Date', value: e.employmentEndDate });
    if (e.resignationDate) items.push({ label: 'Resignation Date', value: e.resignationDate });
    sectionsHtml.push(sectionCard('Employment & Job Details', infoGrid(items)));
  }

  if (sections.contact) {
    const c = sections.contact;
    const phonesHtml = (c.phoneNumbers || [])
      .map(
        (phone) => `
        <div class="info-item">
          <div class="info-label">${phone.isWhatsApp ? 'WhatsApp' : (phone.type || 'Phone').replace(/^\w/, (ch) => ch.toUpperCase())}</div>
          <div class="info-value">${escapeHtml(phone.number)}</div>
        </div>
      `
      )
      .join('');
    sectionsHtml.push(
      sectionCard(
        'Contact Information',
        `
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${c.email ? escapeHtml(c.email) : '-'}</div>
          </div>
          ${phonesHtml}
        </div>
      `
      )
    );
  }

  if (sections.bankDetails) {
    const b = sections.bankDetails;
    sectionsHtml.push(
      sectionCard(
        'Bank Account Details',
        infoGrid([
          { label: 'Bank Name', value: b.bankName },
          { label: 'Branch Name', value: b.branchName },
          { label: 'Branch Code', value: b.branchCode },
          { label: 'Account Number', value: b.accountNumber },
        ])
      )
    );
  }

  if (sections.address) {
    const a = sections.address;
    sectionsHtml.push(
      sectionCard(
        'Address Information',
        `
        <div class="address-grid">
          <div class="address-box">
            <div class="info-label">Residential Address</div>
            <div class="info-value">${formatAddress(a.residentialAddress)}</div>
          </div>
          <div class="address-box">
            <div class="info-label">Permanent Address</div>
            <div class="info-value">${formatAddress(a.permanentAddress)}</div>
          </div>
        </div>
      `
      )
    );
  }

  if (sections.relations && sections.relations.length > 0) {
    sectionsHtml.push(
      sectionCard(
        'Emergency Contacts',
        `
        <div class="address-grid">
          ${sections.relations
            .map(
              (r) => `
            <div class="address-box">
              <div class="info-value" style="font-weight:bold;">${escapeHtml(r.name)} <span class="badge">${escapeHtml(r.relationship)}</span></div>
              <div class="info-value">${escapeHtml(r.phoneNumber)}</div>
              ${r.address ? `<div class="info-value">${escapeHtml(r.address)}</div>` : ''}
            </div>
          `
            )
            .join('')}
        </div>
      `
      )
    );
  } else if (sections.relations) {
    sectionsHtml.push(sectionCard('Emergency Contacts', '<div class="empty-note">No emergency contacts on record</div>'));
  }

  if (sections.documents && sections.documents.length > 0) {
    sectionsHtml.push(
      sectionCard(
        'Documents',
        `
        <table class="doc-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Uploaded</th>
              <th>Expiry</th>
            </tr>
          </thead>
          <tbody>
            ${sections.documents
              .map(
                (doc) => `
              <tr>
                <td>${escapeHtml(doc.fileName)}</td>
                <td class="capitalize">${escapeHtml(doc.documentCategory)}</td>
                <td class="capitalize">${doc.nameOnly ? 'Name only' : escapeHtml(doc.documentType || '-')}</td>
                <td>${escapeHtml(doc.uploadedAt || '-')}</td>
                <td>${escapeHtml(doc.expiryDate || '-')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
      )
    );
  } else if (sections.documents) {
    sectionsHtml.push(sectionCard('Documents', '<div class="empty-note">No documents on record</div>'));
  }

  if (sections.leaveSummary) {
    const l = sections.leaveSummary;
    const chips = (l.monthlyDays || [])
      .map((m) => `<span class="badge">${escapeHtml(m.month)}: ${m.days}</span>`)
      .join(' ');
    sectionsHtml.push(
      sectionCard(
        'Leave Summary',
        `
        <div class="chip-row">
          ${chips || '<div class="empty-note">No leave records found</div>'}
          ${l.monthlyDays && l.monthlyDays.length > 0 ? `<span class="badge badge-strong">Total: ${l.totalLeaveDays ?? 0}</span>` : ''}
        </div>
      `
      )
    );
  }

  if (sections.salaryHolds && sections.salaryHolds.length > 0) {
    sectionsHtml.push(
      sectionCard(
        'Salary Hold History',
        `
        <table class="doc-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Held On</th>
              <th>Released On</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            ${sections.salaryHolds
              .map(
                (h) => `
              <tr>
                <td>${escapeHtml(h.status)}</td>
                <td>${escapeHtml(h.period)}</td>
                <td>${formatCurrency(h.amount)}</td>
                <td>${escapeHtml(h.heldOn || '-')}</td>
                <td>${escapeHtml(h.releasedOn || '-')}</td>
                <td>${escapeHtml(h.reason || '-')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `
      )
    );
  } else if (sections.salaryHolds) {
    sectionsHtml.push(sectionCard('Salary Hold History', '<div class="empty-note">No salary hold records</div>'));
  }

  return `
    <html>
      <head>
        <title>Employee CV - ${escapeHtml(employee.fullName)}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 20px 24px 40px 24px;
            background-color: white;
            color: #222;
          }
          .header {
            text-align: center;
            margin-bottom: 16px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
          }
          .company-logo {
            max-height: 48px;
            max-width: 160px;
            object-fit: contain;
            margin-bottom: 6px;
          }
          .company-name {
            font-size: 12px;
            font-weight: bold;
            color: #333;
            margin-bottom: 4px;
          }
          .title {
            font-size: 18px;
            font-weight: bold;
            color: #111;
            margin-bottom: 4px;
          }
          .subtitle {
            font-size: 11px;
            color: #555;
          }
          .meta-row {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 6px;
            font-size: 9px;
            color: #666;
          }
          .badge {
            display: inline-block;
            background-color: #eef2ff;
            color: #3730a3;
            border-radius: 10px;
            padding: 1px 8px;
            font-size: 8.5px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .badge-strong {
            background-color: #111;
            color: #fff;
          }
          .section {
            margin-bottom: 14px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #fff;
            background-color: #333;
            padding: 4px 8px;
            border-radius: 3px 3px 0 0;
          }
          .section-body {
            border: 1px solid #ddd;
            border-top: none;
            padding: 8px;
            border-radius: 0 0 3px 3px;
          }
          .info-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 16px;
          }
          .info-item {
            min-width: 140px;
            flex: 1 1 140px;
          }
          .info-label {
            font-size: 8px;
            color: #777;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 1px;
          }
          .info-value {
            font-size: 9.5px;
            font-weight: 500;
            color: #222;
          }
          .address-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .address-box {
            flex: 1 1 45%;
            background-color: #fafafa;
            border: 1px solid #eee;
            border-radius: 3px;
            padding: 6px 8px;
          }
          .chip-row {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            align-items: center;
          }
          .empty-note {
            font-size: 9px;
            color: #999;
            font-style: italic;
          }
          table.doc-table {
            width: 100%;
            border-collapse: collapse;
          }
          .doc-table th {
            text-align: left;
            font-size: 8px;
            text-transform: uppercase;
            color: #777;
            padding: 3px 6px;
            border-bottom: 1px solid #ccc;
          }
          .doc-table td {
            font-size: 9px;
            padding: 3px 6px;
            border-bottom: 1px solid #f0f0f0;
          }
          .capitalize {
            text-transform: capitalize;
          }
        </style>
      </head>
      <body>
        <div class="header">
          ${logoImg}
          ${companyName ? `<div class="company-name">${escapeHtml(companyName)}</div>` : ''}
          <div class="title">${escapeHtml(employee.fullName || employee.nameWithInitial)}</div>
          <div class="subtitle">${escapeHtml(employee.nameWithInitial)}</div>
          <div class="meta-row">
            <span>Employee ID: ${escapeHtml(employee.employeeId)}</span>
            ${employee.status ? `<span class="badge">${escapeHtml(employee.status)}</span>` : ''}
            ${employee.employmentType ? `<span class="badge">${escapeHtml(employee.employmentType)}</span>` : ''}
            <span>Generated: ${escapeHtml(generatedDate)}</span>
          </div>
        </div>
        ${sectionsHtml.join('')}
      </body>
    </html>
  `;
}
