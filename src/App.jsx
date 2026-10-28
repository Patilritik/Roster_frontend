import React, { useState, useEffect } from 'react';
import { CalendarRange, Info, ServerCrash } from 'lucide-react';
import axios from 'axios';
import EmployeeManager from './components/EmployeeManager';
import RosterGrid from './components/RosterGrid';
import AISidebar from './components/AISidebar';

const BACKEND_URL = 'http://localhost:5000/api';

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [roster, setRoster] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  
  // Set default month to current month formatted as YYYY-MM
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dbError, setDbError] = useState(false);

  // Fetch all employees and current roster
  const fetchData = async (currentMonth = month) => {
    setLoading(true);
    setError('');
    setDbError(false);
    try {
      // 1. Get employees
      const empRes = await axios.get(`${BACKEND_URL}/employees`);
      setEmployees(empRes.data);

      // 2. Generate/fetch roster for the month
      const rosterRes = await axios.get(`${BACKEND_URL}/roster/generate`, {
        params: { month: currentMonth }
      });
      
      setRoster(rosterRes.data.roster);
      setDailyStats(rosterRes.data.dailyStats);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Please verify the Express server is running on port 5000 and MongoDB is active.');
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  // Add Employee Handler
  const handleAddEmployee = async (newEmp) => {
    try {
      await axios.post(`${BACKEND_URL}/employees`, newEmp);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to add employee');
    }
  };

  // Delete Employee Handler
  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm(`Are you sure you want to remove employee ${employeeId}? All associated leaves will also be deleted.`)) {
      try {
        await axios.delete(`${BACKEND_URL}/employees/${employeeId}`);
        fetchData();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.error || 'Failed to delete employee');
      }
    }
  };

  // Download Excel Handler
  const handleDownloadExcel = () => {
    window.location.href = `${BACKEND_URL}/roster/export?month=${month}`;
  };

  // Triggered by AISidebar when a leave is successfully added and roster should be refreshed
  const handleRosterUpdate = () => {
    fetchData();
  };

  const handleCellUpdate = async (employeeId, date, nextShift) => {
    const isOff = nextShift === 'off';
    try {
      await axios.post(`${BACKEND_URL}/roster/adjustments`, {
        employeeId,
        date,
        action: isOff ? 'off' : 'shift',
        shift: isOff ? undefined : nextShift
      });
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update roster cell');
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-title">
          <div className="header-logo">
            <CalendarRange />
          </div>
          <div>
            <h1>Smart Roster Maker</h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.72)' }}>Automated 22-Day Shift Planner with AI Leave Copilot</p>
          </div>
        </div>
        
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.78)' }}>
            <span className="loading-dot">●</span> Syncing data...
          </div>
        )}
      </header>

      {/* Main Panel */}
      <main className="main-content">
        {dbError ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', border: '1px solid #f2b8b8' }}>
          <ServerCrash size={48} style={{ color: '#b4232f', marginBottom: '16px' }} />
            <h2 style={{ marginBottom: '12px' }}>Connection Error</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 20px', lineHeight: '1.6' }}>
              {error}
            </p>
            <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '8px', display: 'inline-block', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px' }}>
              <div>1. Run backend server: <span style={{ color: '#3b82f6' }}>npm run dev</span> (inside ./backend)</div>
              <div>2. Verify local MongoDB service is running (port 27017)</div>
            </div>
            <div style={{ marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={() => fetchData()}>Retry Connection</button>
            </div>
          </div>
        ) : (
          <>
            {/* Top widgets showing overall stats */}
            <div className="stats-summary">
              <div className="stat-widget">
                <div className="stat-icon blue">
                  <CalendarRange size={24} />
                </div>
                <div className="stat-info">
                  <h3>Target Working Days</h3>
                  <p>22 Days / mo</p>
                </div>
              </div>

              <div className="stat-widget">
                <div className="stat-icon green">
                  <Info size={24} />
                </div>
                <div className="stat-info">
                  <h3>Total Employees</h3>
                  <p>{employees.length} Members</p>
                </div>
              </div>

              <div className="stat-widget">
                <div className="stat-icon purple">
                  <Info size={24} />
                </div>
                <div className="stat-info">
                  <h3>Roster Target Status</h3>
                  <p style={{ fontSize: '15px', color: employees.length > 0 ? '#147d52' : '#b4232f', fontWeight: 'bold', marginTop: '4px' }}>
                    {employees.length > 0 ? '✓ Balanced Capacity' : 'Waiting for Staff'}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee management pane */}
            <EmployeeManager
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />

            {/* Roster display grid */}
            <RosterGrid
              roster={roster}
              dailyStats={dailyStats}
              month={month}
              onMonthChange={(m) => setMonth(m)}
              onDownloadExcel={handleDownloadExcel}
              onCellUpdate={handleCellUpdate}
            />
          </>
        )}
      </main>

      {/* AI Assistant Sidebar Panel */}
      {!dbError && (
        <AISidebar
          month={month}
          onRosterUpdate={handleRosterUpdate}
        />
      )}

      <style>{`
        .loading-dot {
          animation: pulse 1s infinite alternate;
          color: #3b82f6;
        }
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
