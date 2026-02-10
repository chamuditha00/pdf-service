interface AttendanceReportProps {
  reportStartDate: string;
  reportEndDate: string;
  selectedEmps: any[];
  reportData: any[];
  employees: any[];
  reportSummary: any;
  attendanceConfig: any;
  companyName: string;
  companyAddress: string;
  companyPhone?: string;
  companyEmail?: string;
  logoBase64: string;
}

export const generateAttendanceReportHTML = ({
  reportStartDate,
  reportEndDate,
  selectedEmps,
  reportData,
  employees,
  reportSummary,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  logoBase64,
}: AttendanceReportProps): string => {
  const addressLine = companyAddress ? ` | ${companyAddress}` : '';
  const phoneEmailLine = `${companyPhone ? `Tel: ${companyPhone}` : ''}${companyPhone && companyEmail ? ' | ' : ''}${companyEmail ? `E-mail: ${companyEmail}` : ''}`;
  const logoImg = logoBase64 ? `<img src="${logoBase64}" alt="Company Logo">` : '';

  return `
 <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Attendance Report</title>
            <style>
              * {
                margin: 0;
                padding: 0;
              }
              .footer-reserve {
                height: 30px;
                page-break-inside: avoid;
              }
              .employee-section {
                page-break-before: auto;
                page-break-inside: avoid;
                page-break-after: auto;
              }
              .employee-header {
                page-break-inside: avoid;
              }
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0 0 40px 0;
              }
              .container {
                max-width: 900px;
                margin: 0 auto;
                padding: 0 8px;
              }
              .header {
                text-align: center;
                margin-bottom: 10px;
                padding-bottom: 8px;
                border-bottom: 1px solid #ddd;
                page-break-inside: avoid;
              }
              .title {
                font-size: 16px;
                font-weight: bold;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .period-info {
                font-size: 11px;
                color: #666;
                margin: 3px 0 0 0;
                padding: 0;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                page-break-inside: auto;
                margin-bottom: 5px;
              }
              tbody tr {
                page-break-inside: avoid;
                page-break-after: auto;
                height: auto;
              }
              thead {
                border-bottom: 2px solid #000;
                display: table-header-group;
                page-break-inside: avoid;
              }
              tfoot {
                display: table-footer-group;
                page-break-inside: avoid;
              }
              th {
                padding: 8px;
                text-align: left;
                font-weight: bold;
                border: none;
                font-size: 10px;
              }
              td {
                padding: 4px 8px;
                border: none;
                font-size: 9px;
              }
              .late-checkin {
                color: #dc2626;
                font-weight: bold;
              }
              .early-checkout {
                color: #f97316;
                font-weight: bold;
              }
              .on-time {
                color: #22c55e;
              }
              .working-hours {
                color: #2563eb;
                font-weight: bold;
              }
              tbody tr:nth-child(even) {
                background-color: transparent;
              }
              tbody tr:hover {
                background-color: transparent;
              }
              .charts-section {
                margin-top: 15px;
                page-break-before: auto;
                page-break-inside: avoid;
                page-break-after: auto;
              }
              .charts-title {
                font-size: 14px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 12px;
                page-break-inside: avoid;
              }
              .charts-grid {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 10px;
                page-break-inside: avoid;
              }
              .chart-box {
                width: 160px;
                text-align: center;
                padding: 10px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                background: #fff;
                page-break-inside: avoid;
              }
              .chart-title {
                font-size: 10px;
                font-weight: bold;
                margin-bottom: 8px;
              }
              .donut-container {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 6px auto;
              }
              .donut-center {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
                font-weight: bold;
              }
              .chart-legend {
                margin-top: 6px;
                font-size: 8px;
              }
              .legend-item {
                display: inline-block;
                margin: 1px 2px;
              }
              .legend-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
                vertical-align: middle;
                margin-right: 3px;
              }
           
             
                
              .footer-section {
                margin-top: 15px;
                page-break-inside: avoid;
                page-break-before: auto;
                padding-top: 8px;
                border-top: 1px solid #ddd;
              }
              .footer {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-top: 8px;
                page-break-inside: avoid;
                font-size: 9px;
              }
              .footer-left {
                flex: 1;
              }
              .footer-left p {
                margin: 2px 0;
                font-size: 9px;
                color: #333;
                line-height: 1.2;
              }
              .footer-right {
                text-align: right;
              }
              .footer-right img {
                max-width: 80px;
                max-height: 40px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div class="title">Attendance Report</div>
                <div class="period-info">
                  Period: ${reportStartDate} to ${reportEndDate} | Total Employees: ${selectedEmps.length}
                </div>
              </div>

              ${selectedEmps.map((emp: any, empIndex: number) => {
                const employeeData = reportData.filter((row: any) => row.empId === emp.employeeId);
                if (employeeData.length === 0) return '';

                // Get full employee details from employees array
                const fullEmpDetails = employees.find(e => e._id === emp._id || e.employeeId === emp.employeeId);
                const empName = emp.commonName || emp.nameWithInitial || fullEmpDetails?.nameWithInitial || 'Unknown';

                // Calculate employee-specific stats
                let empActualMinutes = 0;
                let empLateCount = 0;
                let empOnTimeCheckInCount = 0;
                let empEarlyCheckOutCount = 0;
                let empOnTimeCheckOutCount = 0;

                employeeData.forEach((record: any) => {
                  if (record.checkInTime && record.checkOutTime) {
                    const [inH, inM] = record.checkInTime.split(':').map(Number);
                    const [outH, outM] = record.checkOutTime.split(':').map(Number);
                    const diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
                    if (diffMinutes > 0) empActualMinutes += diffMinutes;
                  }
                  if (record.checkInTime) {
                    if (record.isLateCheckIn) empLateCount++;
                    else empOnTimeCheckInCount++;
                  }
                  if (record.checkOutTime) {
                    if (record.isEarlyCheckOut) empEarlyCheckOutCount++;
                    else empOnTimeCheckOutCount++;
                  }
                });

                const empExpectedHours = reportSummary.totalWorkingDays * reportSummary.hoursPerDay;
                const empActualHours = empActualMinutes / 60;

                return `
                  <div class="employee-section" style="page-break-inside: auto; margin-bottom: 0; margin-top: 8px;">
                    <div class="employee-header" style="background-color: #f5f5f5; padding: 4px 5px; border-radius: 4px; margin-bottom: 6px; page-break-inside: avoid;">
                      <div style="font-size: 12px; font-weight: bold; color: #333; margin: 0;">${empName}</div>
                      <div style="font-size: 10px; color: #666; margin: 2px 0 0 0;">Employee ID: ${emp.employeeId}</div>
                    </div>
                    
                    <table>
                      <thead>
                        <tr>
                          <th>DATE</th>
                          <th>CHECK-IN</th>
                          <th>STATUS</th>
                          <th>CHECK-OUT</th>
                          <th>STATUS</th>
                          <th>HOURS</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${employeeData.map((row: any) => {
                          let workingHours = '-';
                          if (row.checkInTime && row.checkOutTime) {
                            const checkInParts = row.checkInTime.split(':');
                            const checkOutParts = row.checkOutTime.split(':');
                            const checkInMinutes = parseInt(checkInParts[0]) * 60 + parseInt(checkInParts[1]);
                            const checkOutMinutes = parseInt(checkOutParts[0]) * 60 + parseInt(checkOutParts[1]);
                            const totalMinutes = checkOutMinutes - checkInMinutes;
                            if (totalMinutes > 0) {
                              const hours = Math.floor(totalMinutes / 60);
                              const mins = totalMinutes % 60;
                              workingHours = `${hours}h ${mins}m`;
                            }
                          }
                          const checkInStatus = row.checkInTime ? (row.isLateCheckIn ? 'Late' : 'On Time') : '-';
                          const checkOutStatus = row.checkOutTime ? (row.isEarlyCheckOut ? 'Early' : 'On Time') : '-';
                          return `
                            <tr>
                              <td>${row.date || 'N/A'}</td>
                              <td class="${row.isLateCheckIn ? 'late-checkin' : ''}">${row.checkInTime || '-'}</td>
                              <td class="${row.isLateCheckIn ? 'late-checkin' : 'on-time'}">${checkInStatus}</td>
                              <td class="${row.isEarlyCheckOut ? 'early-checkout' : ''}">${row.checkOutTime || '-'}</td>
                              <td class="${row.isEarlyCheckOut ? 'early-checkout' : 'on-time'}">${checkOutStatus}</td>
                              <td class="working-hours">${workingHours}</td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>

                    <!-- Employee Charts -->
                    <div style="margin-top: 8px; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; page-break-inside: avoid;">
                      <!-- Working Hours Chart -->
                      <div class="chart-box">
                        <div class="chart-title">Working Hours</div>
                        <div class="donut-container">
                          <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" stroke-width="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" stroke-width="12" stroke-dasharray="${Math.min((empActualHours / empExpectedHours) * 251.2, 251.2)} 251.2" stroke-linecap="round" transform="rotate(-90 50 50)"/>
                          </svg>
                          <div class="donut-center" style="color: #2563eb;">${Math.round((empActualHours / empExpectedHours) * 100) || 0}%</div>
                        </div>
                        <div class="chart-legend">
                          <span class="legend-item"><span class="legend-dot" style="background-color:#2563eb"></span>${empActualHours.toFixed(1)}h / ${empExpectedHours.toFixed(1)}h</span>
                        </div>
                      </div>

                      <!-- Check-In Status Chart -->
                      <div class="chart-box">
                        <div class="chart-title">Check-In Status</div>
                        <div class="donut-container">
                          <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" stroke-width="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" stroke-width="12" stroke-dasharray="${(empLateCount + empOnTimeCheckInCount) > 0 ? (empOnTimeCheckInCount / (empLateCount + empOnTimeCheckInCount)) * 251.2 : 0} 251.2" stroke-linecap="round" transform="rotate(-90 50 50)"/>
                          </svg>
                          <div class="donut-center" style="color: #22c55e;">${(empLateCount + empOnTimeCheckInCount) > 0 ? Math.round((empOnTimeCheckInCount / (empLateCount + empOnTimeCheckInCount)) * 100) : 0}%</div>
                        </div>
                        <div class="chart-legend">
                          <span class="legend-item"><span class="legend-dot" style="background-color:#22c55e"></span>On Time: ${empOnTimeCheckInCount}</span>
                          <span class="legend-item"><span class="legend-dot" style="background-color:#ef4444"></span>Late: ${empLateCount}</span>
                        </div>
                      </div>

                      <!-- Check-Out Status Chart -->
                      <div class="chart-box">
                        <div class="chart-title">Check-Out Status</div>
                        <div class="donut-container">
                          <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" stroke-width="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" stroke-width="12" stroke-dasharray="${(empEarlyCheckOutCount + empOnTimeCheckOutCount) > 0 ? (empOnTimeCheckOutCount / (empEarlyCheckOutCount + empOnTimeCheckOutCount)) * 251.2 : 0} 251.2" stroke-linecap="round" transform="rotate(-90 50 50)"/>
                          </svg>
                          <div class="donut-center" style="color: #22c55e;">${(empEarlyCheckOutCount + empOnTimeCheckOutCount) > 0 ? Math.round((empOnTimeCheckOutCount / (empEarlyCheckOutCount + empOnTimeCheckOutCount)) * 100) : 0}%</div>
                        </div>
                        <div class="chart-legend">
                          <span class="legend-item"><span class="legend-dot" style="background-color:#22c55e"></span>On Time: ${empOnTimeCheckOutCount}</span>
                          <span class="legend-item"><span class="legend-dot" style="background-color:#f97316"></span>Early: ${empEarlyCheckOutCount}</span>
                        </div>
                      </div>

                      <!-- Working Days vs Leave Chart -->
                      <div class="chart-box">
                        <div class="chart-title">Working Days vs Leave</div>
                        <div class="donut-container">
                          <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" stroke-width="12"/>
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="${reportSummary.totalWorkingDays > 0 ? (employeeData.length / reportSummary.totalWorkingDays) * 251.2 : 0} 251.2" stroke-linecap="round" transform="rotate(-90 50 50)"/>
                          </svg>
                          <div class="donut-center" style="color: #10b981;">${employeeData.length}d</div>
                        </div>
                        <div class="chart-legend">
                          <span class="legend-item"><span class="legend-dot" style="background-color:#10b981"></span>Present: ${employeeData.length}</span>
                          <span class="legend-item"><span class="legend-dot" style="background-color:#fbbf24"></span>Expected: ${reportSummary.totalWorkingDays}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="footer-reserve"></div>
                `;
              }).join('')}

            

         
          
                </div>
              </div>
            </div>
          </body>
        </html>
  `;
};
