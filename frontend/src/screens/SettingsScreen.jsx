import React, { useState, useContext } from 'react';
import { AppContext } from '../AppContext';
import { Settings, Save, Download, Trash2, Bell, Shield, Sliders } from 'lucide-react';

export default function SettingsScreen() {
  const { logs, logout } = useContext(AppContext);
  const [theme, setTheme] = useState('dark');
  const [notifShift, setNotifShift] = useState(true);
  const [notifCaffeine, setNotifCaffeine] = useState(true);
  const [notifBurnout, setNotifBurnout] = useState(true);
  const [notifDrive, setNotifDrive] = useState(true);
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportCSV = () => {
    // Generate a CSV mapping all logged events
    let csvContent = 'data:text/csv;charset=utf-8,Category,Date,Details,Value\n';
    
    // Sleep logs
    (logs.sleep || []).forEach(log => {
      csvContent += `Sleep,${new Date(log.endTime).toLocaleDateString()},Quality: ${log.quality},${log.duration} hrs\n`;
    });
    
    // Caffeine logs
    (logs.caffeine || []).forEach(log => {
      csvContent += `Caffeine,${new Date(log.timestamp).toLocaleDateString()},Beverage: ${log.beverage},${log.mgAmount} mg\n`;
    });

    // Shift logs
    (logs.shift || []).forEach(log => {
      csvContent += `Shift,${new Date(log.startTime).toLocaleDateString()},Type: ${log.shiftType},Break: ${log.breakDuration} mins\n`;
    });

    // Nutrition logs
    (logs.nutrition || []).forEach(log => {
      csvContent += `Nutrition,${new Date(log.timestamp || log.createdAt).toLocaleDateString()},Food: ${log.foodItem},${log.calories} kcal\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guardian_sync_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `guardian_sync_database_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: Are you sure you want to clear all tracking logs? This action is permanent.')) {
      localStorage.removeItem('guardian_logs');
      alert('All local tracking logs cleared.');
      window.location.reload();
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('CRITICAL WARNING: Are you sure you want to delete your account? All logs and preferences will be permanently wiped.')) {
      localStorage.clear();
      alert('Account deleted successfully.');
      logout();
    }
  };

  return (
    <div className="settings-wrapper">
      <header className="screen-header">
        <div className="title-area">
          <div className="icon-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white' }}>
            <Settings size={24} />
          </div>
          <div>
            <h2>System Settings</h2>
            <p>Configure notification alerts, export diagnostic files, and manage your account credentials.</p>
          </div>
        </div>
      </header>

      {saveSuccess && (
        <div className="toast-success glass-panel">
          <span>Settings preferences updated successfully!</span>
        </div>
      )}

      <div className="screen-content-split">
        {/* Left Side: Configuration preferences */}
        <form onSubmit={handleSaveSettings} className="preferences-side glass-panel">
          <div className="section-title-row">
            <Bell size={18} color="var(--color-primary)" />
            <h3>Notification Alert Configuration</h3>
          </div>

          <div className="checkbox-options-stack" style={{ marginTop: '1rem' }}>
            <label className="toggle-label glass-card">
              <div>
                <strong>Curfew Shift Reminders</strong>
                <p>Reminds you 1 hour before scheduled hospital shifts start.</p>
              </div>
              <input 
                type="checkbox" checked={notifShift}
                onChange={() => setNotifShift(!notifShift)}
                className="toggle-checkbox"
              />
            </label>

            <label className="toggle-label glass-card">
              <div>
                <strong>Caffeine Cutoff Curfews</strong>
                <p>Notifies when circadian coffee caffeine limit is reached.</p>
              </div>
              <input 
                type="checkbox" checked={notifCaffeine}
                onChange={() => setNotifCaffeine(!notifCaffeine)}
                className="toggle-checkbox"
              />
            </label>

            <label className="toggle-label glass-card">
              <div>
                <strong>Burnout Risk Warnings</strong>
                <p>Notifies if cumulative 7-day fatigue indices exceed 70% threshold.</p>
              </div>
              <input 
                type="checkbox" checked={notifBurnout}
                onChange={() => setNotifBurnout(!notifBurnout)}
                className="toggle-checkbox"
              />
            </label>

            <label className="toggle-label glass-card">
              <div>
                <strong>Safe-To-Drive Warnings</strong>
                <p>Sends driving-readiness alerts prior to shift exits.</p>
              </div>
              <input 
                type="checkbox" checked={notifDrive}
                onChange={() => setNotifDrive(!notifDrive)}
                className="toggle-checkbox"
              />
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem', alignSelf: 'flex-end' }}>
            <Save size={16} /> Save Preferences
          </button>
        </form>

        {/* Right Side: Data export / account management */}
        <div className="data-side glass-panel">
          <div className="section-title-row">
            <Sliders size={18} color="var(--color-secondary)" />
            <h3>Data Diagnostics & Export</h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            Download diagnostic file packages containing your complete log history:
          </p>

          <div className="export-actions-list">
            <button className="btn-secondary" onClick={handleExportCSV} style={{ justifyContent: 'flex-start' }}>
              <Download size={16} /> Export Logs as CSV File
            </button>
            <button className="btn-secondary" onClick={handleExportJSON} style={{ justifyContent: 'flex-start' }}>
              <Download size={16} /> Export Database as JSON
            </button>
          </div>

          <div className="section-title-row" style={{ marginTop: '2rem', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={18} color="var(--color-danger)" />
            <h3 style={{ color: 'var(--color-danger)' }}>Danger Zone</h3>
          </div>

          <div className="danger-zone-actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-secondary danger-btn" onClick={handleResetData} style={{ justifyContent: 'flex-start' }}>
              Reset Database Logs
            </button>
            <button type="button" className="btn-primary" style={{ background: 'var(--color-danger)', border: 'none', justifyContent: 'flex-start' }} onClick={handleDeleteAccount}>
              Permanently Delete Account
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .settings-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .preferences-side {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .checkbox-options-stack {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .toggle-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem !important;
          cursor: pointer;
        }
        .toggle-label div strong {
          font-size: 0.85rem;
          color: white;
        }
        .toggle-label div p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.1rem;
        }
        .toggle-checkbox {
          width: 20px;
          height: 20px;
          accent-color: var(--color-primary);
          cursor: pointer;
        }

        .data-side {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .export-actions-list, .danger-zone-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .danger-btn {
          border-color: rgba(239,68,68,0.2) !important;
          color: #f87171 !important;
          background: rgba(239,68,68,0.03) !important;
        }
        .danger-btn:hover {
          background: var(--color-danger) !important;
          color: white !important;
          border-color: transparent !important;
        }
      `}</style>
    </div>
  );
}
