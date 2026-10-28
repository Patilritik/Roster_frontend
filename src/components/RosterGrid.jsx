import React, { useState } from 'react';
import { Download, Calendar, Users, Moon, Sun, ShieldAlert, Pencil } from 'lucide-react';

export default function RosterGrid({ roster, dailyStats, month, onMonthChange, onDownloadExcel, onCellUpdate }) {
  const [editMode, setEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  
  // Format Month name (e.g. '2026-08' -> 'August 2026')
  const formatMonthName = (mStr) => {
    if (!mStr) return '';
    const [year, month] = mStr.split('-');
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[parseInt(month, 10) - 1]} ${year}`;
  };

  // Get day of week abbreviation for header
  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };

  // Check if a date string is Saturday or Sunday
  const isWeekend = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
  };

  // Extract date headers from the first roster row
  const dateKeys = roster.length > 0 ? Object.keys(roster[0].shifts).sort() : [];

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2 className="card-title">
          <Calendar size={20} className="text-primary" />
          Roster Schedule ({formatMonthName(month)})
        </h2>
        <div className="header-controls">
          <div className="month-picker-container">
            <input 
              type="month" 
              className="month-picker" 
              value={month} 
              onChange={(e) => onMonthChange(e.target.value)} 
            />
          </div>
          <button 
            className="btn btn-primary" 
            onClick={onDownloadExcel}
            disabled={roster.length === 0}
          >
            <Download size={16} /> Export Excel
          </button>
          <button
            className={`btn ${editMode ? 'btn-edit-active' : ''}`}
            onClick={() => setEditMode(value => !value)}
            title="Click a cell to cycle Morning, Evening and Off"
          >
            <Pencil size={16} /> {editMode ? 'Done Editing' : 'Edit Roster'}
          </button>
        </div>
      </div>

      {roster.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
          <ShieldAlert size={48} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
          <h3>No Data Available</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Add team members to generate the schedule.</p>
        </div>
      ) : (
        <>
          {/* Main Roster Grid */}
          <div className="roster-table-container">
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="emp-meta-header" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: '#e8eef5', zIndex: 6 }}>Emp ID</th>
                  <th className="emp-meta-header name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: '#e8eef5', zIndex: 6, borderRight: '2px solid var(--border-color)' }}>Name</th>
                  {dateKeys.map(dateStr => {
                    const dayNum = dateStr.split('-')[2];
                    const dayName = getDayName(dateStr);
                    const weekend = isWeekend(dateStr);
                    return (
                      <th 
                        key={dateStr} 
                        className={weekend ? 'weekend-header' : ''}
                        style={{ textAlign: 'center', minWidth: '90px', width: '90px' }}
                      >
                        <div>{dayNum}</div>
                        <div style={{ fontSize: '10px', opacity: 0.7 }}>{dayName}</div>
                      </th>
                    );
                  })}
                  <th style={{ textAlign: 'center', background: '#dce7f1', color: '#1f456b', minWidth: '85px', width: '85px' }}>Working</th>
                  <th style={{ textAlign: 'center', background: '#dce7f1', color: '#1f456b', minWidth: '85px', width: '85px' }}>Offs</th>
                  <th style={{ textAlign: 'center', background: '#fff8e6', color: '#946200', minWidth: '85px', width: '85px' }}>Leaves</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((row) => (
                  <tr key={row.employeeId}>
                    <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: '#ffffff', zIndex: 3 }}>{row.employeeId}</td>
                    <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: '#ffffff', zIndex: 3, borderRight: '2px solid var(--border-color)' }}>{row.name}</td>
                    {dateKeys.map(dateStr => {
                      const shift = row.shifts[dateStr];
                      const leaveType = row.leaveTypes?.[dateStr];
                      const displayValue = leaveType || (shift === 'off' ? 'WO' : shift);
                      const badgeClass = `shift-badge ${leaveType ? 'leave' : shift}`;
                      return (
                        <td
                          key={dateStr}
                          style={{ textAlign: 'center', cursor: editMode ? 'pointer' : 'default' }}
                          onClick={() => editMode && setEditingCell({ employeeId: row.employeeId, date: dateStr })}
                          title={editMode ? 'Choose Morning, Evening, or Off' : undefined}
                        >
                          {editingCell?.employeeId === row.employeeId && editingCell.date === dateStr ? (
                            <div
                              className="roster-edit-actions"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button type="button" onClick={() => {
                                setEditingCell(null);
                                onCellUpdate(row.employeeId, dateStr, 'morning');
                              }}>M</button>
                              <button type="button" onClick={() => {
                                setEditingCell(null);
                                onCellUpdate(row.employeeId, dateStr, 'evening');
                              }}>E</button>
                              <button type="button" onClick={() => {
                                setEditingCell(null);
                                onCellUpdate(row.employeeId, dateStr, 'off');
                              }}>WO</button>
                              <button type="button" className="roster-edit-cancel" onClick={() => setEditingCell(null)}>×</button>
                            </div>
                          ) : (
                            <span className={badgeClass} style={editMode ? { outline: '2px dashed var(--accent-color)', outlineOffset: '2px' } : undefined}>
                              {shift === 'morning' && <Sun size={10} style={{ marginRight: '4px' }} />}
                              {shift === 'evening' && <Moon size={10} style={{ marginRight: '4px' }} />}
                              {displayValue}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-morning-text)', background: 'var(--color-morning-bg)', minWidth: '85px', width: '85px' }}>
                      {row.workingDaysCount}d
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-off-text)', background: 'var(--color-off-bg)', minWidth: '85px', width: '85px' }}>
                      {row.offDaysCount}d
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold', color: '#946200', background: '#fff8e6', minWidth: '85px', width: '85px' }}>
                      {row.leaveDaysCount}d
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {/* Total Working Summary */}
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: 'var(--bg-tertiary)', zIndex: 3, fontWeight: 'bold', color: 'var(--color-morning-text)' }}>TW</td>
                  <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: 'var(--bg-tertiary)', zIndex: 3, borderRight: '2px solid var(--border-color)', fontWeight: 'bold', color: 'var(--color-morning-text)' }}>Total Working</td>
                  {dateKeys.map(dateStr => {
                    const stat = dailyStats.find(s => s.dateStr === dateStr);
                    return (
                      <td key={dateStr} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-morning-text)', background: 'rgba(55, 168, 117, 0.08)' }}>
                        {stat ? stat.working : 0}
                      </td>
                    );
                  })}
                  <td colSpan={3} style={{ background: 'var(--bg-tertiary)' }}></td>
                </tr>

                {/* Morning Shift Summary */}
                <tr style={{ background: 'var(--bg-tertiary)', borderTop: '2px solid var(--border-color)' }}>
                  <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: 'var(--bg-tertiary)', zIndex: 3, fontWeight: 'bold', color: 'var(--color-morning-text)' }}>M</td>
                  <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: 'var(--bg-tertiary)', zIndex: 3, borderRight: '2px solid var(--border-color)', fontWeight: 'bold', color: 'var(--color-morning-text)' }}>Total Morning</td>
                  {dateKeys.map(dateStr => {
                    const stat = dailyStats.find(s => s.dateStr === dateStr);
                    return (
                      <td key={dateStr} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-morning-text)', background: 'rgba(16, 185, 129, 0.05)' }}>
                        {stat ? stat.morning : 0}
                      </td>
                    );
                  })}
                  <td colSpan={3} style={{ background: 'var(--bg-tertiary)' }}></td>
                </tr>

                {/* Evening Shift Summary */}
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: 'var(--bg-tertiary)', zIndex: 3, fontWeight: 'bold', color: 'var(--color-evening-text)' }}>E</td>
                  <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: 'var(--bg-tertiary)', zIndex: 3, borderRight: '2px solid var(--border-color)', fontWeight: 'bold', color: 'var(--color-evening-text)' }}>Total Evening</td>
                  {dateKeys.map(dateStr => {
                    const stat = dailyStats.find(s => s.dateStr === dateStr);
                    return (
                      <td key={dateStr} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-evening-text)', background: 'rgba(99, 102, 241, 0.05)' }}>
                        {stat ? stat.evening : 0}
                      </td>
                    );
                  })}
                  <td colSpan={3} style={{ background: 'var(--bg-tertiary)' }}></td>
                </tr>

                {/* Week Off Summary */}
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: 'var(--bg-tertiary)', zIndex: 3, fontWeight: 'bold', color: 'var(--color-off-text)' }}>WO</td>
                  <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: 'var(--bg-tertiary)', zIndex: 3, borderRight: '2px solid var(--border-color)', fontWeight: 'bold', color: 'var(--color-off-text)' }}>Total Weekoff</td>
                  {dateKeys.map(dateStr => {
                    const stat = dailyStats.find(s => s.dateStr === dateStr);
                    return (
                      <td key={dateStr} style={{ textAlign: 'center', fontWeight: 'bold', color: 'var(--color-off-text)', background: 'rgba(239, 68, 68, 0.05)' }}>
                        {stat ? stat.off : 0}
                      </td>
                    );
                  })}
                  <td colSpan={3} style={{ background: 'var(--bg-tertiary)' }}></td>
                </tr>

                {['SL', 'CL', 'FL', 'EL', 'Leave'].map((leaveType) => (
                  <tr key={leaveType} style={{ background: 'var(--bg-tertiary)' }}>
                    <td className="emp-meta" style={{ position: 'sticky', left: 0, minWidth: '90px', width: '90px', maxWidth: '90px', background: 'var(--bg-tertiary)', zIndex: 3, fontWeight: 'bold', color: '#946200' }}>{leaveType}</td>
                    <td className="emp-meta name-column" style={{ position: 'sticky', left: '90px', minWidth: '200px', width: '200px', maxWidth: '200px', background: 'var(--bg-tertiary)', zIndex: 3, borderRight: '2px solid var(--border-color)', fontWeight: 'bold', color: '#946200' }}>
                      {leaveType === 'SL' ? 'Sick Leave' : leaveType === 'CL' ? 'Casual Leave' : leaveType === 'FL' ? 'Festival Leave' : leaveType === 'EL' ? 'Earned Leave' : 'Leave'}
                    </td>
                    {dateKeys.map(dateStr => {
                      const stat = dailyStats.find(s => s.dateStr === dateStr);
                      return (
                        <td key={dateStr} style={{ textAlign: 'center', fontWeight: 'bold', color: '#946200', background: '#fff8e6' }}>
                          {stat?.leave?.[leaveType] || 0}
                        </td>
                      );
                    })}
                    <td colSpan={3} style={{ background: 'var(--bg-tertiary)' }}></td>
                  </tr>
                ))}
              </tfoot>
            </table>
          </div>

          <div className="info-alert" style={{ fontSize: '12px', display: 'flex', gap: '20px' }}>
            <div>☀️ <strong>Morning Shift</strong>: 08:00 AM - 04:00 PM</div>
            <div>🌙 <strong>Evening Shift</strong>: 12:00 PM - 09:00 PM</div>
            <div>ℹ️ Normal target is 22 working days. Saturday and Sunday week-offs are paired into weekend rotations, with up to 10 weekend employees scheduled when the team size allows. Approved leaves are shown separately.</div>
          </div>

          {/* Daily Load Balancing Section */}
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} className="text-secondary" />
              Daily Shift Allocation & Load Balance
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
              {dailyStats.map(stat => {
                const totalEmployees = roster.length;
                const workingPct = totalEmployees > 0 ? (stat.working / totalEmployees) * 100 : 0;
                const isWknd = isWeekend(stat.dateStr);
                const dateParts = stat.dateStr.split('-');
                const displayDate = `${dateParts[2]} ${getDayName(stat.dateStr)}`;

                return (
                  <div 
                    key={stat.dateStr} 
                    style={{ 
                      background: isWknd ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-tertiary)', 
                      border: `1px solid ${isWknd ? 'rgba(239, 68, 68, 0.15)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      padding: '10px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'between', fontWeight: '600', marginBottom: '6px' }}>
                      <span style={{ color: isWknd ? 'var(--color-off-text)' : 'var(--text-primary)' }}>{displayDate}</span>
                      <span style={{ color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                        {stat.working}/{totalEmployees} Active
                      </span>
                    </div>
                    
                    <div className="daily-load-bar" style={{ marginBottom: '8px' }}>
                      <div className="daily-load-indicator">
                        <div 
                          className="daily-load-fill" 
                          style={{ 
                            width: `${workingPct}%`,
                            background: isWknd ? 'linear-gradient(90deg, #d64545, #b4232f)' : 'linear-gradient(90deg, #37a875, #147d52)' 
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      Total Working: {stat.working}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                      <span>M: {stat.morning}</span>
                      <span>E: {stat.evening}</span>
                      <span>Off: {stat.off}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
