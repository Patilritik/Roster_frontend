import React, { useState } from 'react';
import { UserPlus, Trash2, Users, AlertTriangle } from 'lucide-react';

export default function EmployeeManager({ employees, onAddEmployee, onDeleteEmployee }) {
  const [showModal, setShowModal] = useState(false);
  const [employeeId, setEmployeeId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!employeeId.trim() || !name.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Check duplicate
    if (employees.some(emp => emp.employeeId.toLowerCase() === employeeId.trim().toLowerCase())) {
      setError('Employee ID already exists.');
      return;
    }

    onAddEmployee({ employeeId: employeeId.trim().toUpperCase(), name: name.trim() });
    setEmployeeId('');
    setName('');
    setShowModal(false);
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <h2 className="card-title">
          <Users size={20} className="text-primary" />
          Manage Team ({employees.length})
        </h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {employees.length < 5 && (
        <div className="warning-alert">
          <AlertTriangle size={16} />
          <span>At least 5-8 employees are recommended to generate balanced rosters with sufficient daily capacity.</span>
        </div>
      )}

      <div className="employee-list">
        {employees.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>No employees added yet.</p>
        ) : (
          employees.map((emp) => (
            <div className="employee-item" key={emp.employeeId}>
              <div className="emp-details">
                <h4>{emp.name}</h4>
                <p>ID: {emp.employeeId}</p>
              </div>
              <button 
                className="btn btn-danger" 
                style={{ padding: '6px 10px' }}
                onClick={() => onDeleteEmployee(emp.employeeId)}
                title="Delete Employee"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            
            {error && <div className="warning-alert" style={{ marginBottom: '15px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. EMP101" 
                  value={employeeId} 
                  onChange={(e) => setEmployeeId(e.target.value)}
                  maxLength={10}
                />
              </div>

              <div className="form-group">
                <label>Employee Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Rahul Sharma" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Employee</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
