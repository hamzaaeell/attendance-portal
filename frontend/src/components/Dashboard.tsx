import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: string;
}

interface TodayStatus {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  attendance?: AttendanceRecord;
}

const Dashboard: React.FC = () => {
  const { employee, logout } = useAuth();
  const [todayStatus, setTodayStatus] = useState<TodayStatus>({ hasCheckedIn: false, hasCheckedOut: false });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodayStatus();
    fetchAttendanceRecords();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await axios.get('/api/attendance/status/today');
      setTodayStatus(response.data);
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      if (employee) {
        const response = await axios.get(`/api/attendance/${employee.id}`);
        setAttendanceRecords(response.data);
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await axios.post('/api/attendance/checkin');
      setMessage('Checked in successfully!');
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await axios.post('/api/attendance/checkout');
      setMessage('Checked out successfully!');
      fetchTodayStatus();
      fetchAttendanceRecords();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Employee Dashboard</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {employee?.name}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.card}>
          <h2>Today's Attendance</h2>
          {message && <div style={styles.message}>{message}</div>}

          <div style={styles.attendanceStatus}>
            <p><strong>Status:</strong> {todayStatus.hasCheckedIn ? 'Checked In' : 'Not Checked In'}</p>
            {todayStatus.attendance && (
              <>
                <p><strong>Check-in Time:</strong> {formatTime(todayStatus.attendance.checkIn)}</p>
                {todayStatus.attendance.checkOut && (
                  <>
                    <p><strong>Check-out Time:</strong> {formatTime(todayStatus.attendance.checkOut)}</p>
                    <p><strong>Total Hours:</strong> {todayStatus.attendance.totalHours?.toFixed(2)} hours</p>
                  </>
                )}
              </>
            )}
          </div>

          <div style={styles.buttonGroup}>
            {!todayStatus.hasCheckedIn && (
              <button
                onClick={handleCheckIn}
                disabled={loading}
                style={styles.checkInBtn}
              >
                {loading ? 'Checking In...' : 'Check In'}
              </button>
            )}

            {todayStatus.hasCheckedIn && !todayStatus.hasCheckedOut && (
              <button
                onClick={handleCheckOut}
                disabled={loading}
                style={styles.checkOutBtn}
              >
                {loading ? 'Checking Out...' : 'Check Out'}
              </button>
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h2>Attendance History</h2>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Total Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{formatTime(record.checkIn)}</td>
                    <td>{record.checkOut ? formatTime(record.checkOut) : '-'}</td>
                    <td>{record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}</td>
                    <td style={{
                      color: record.status === 'present' ? 'green' : 'orange',
                      fontWeight: 'bold'
                    }}>
                      {record.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  content: {
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  message: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  attendanceStatus: {
    marginBottom: '1.5rem'
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem'
  },
  checkInBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  checkOutBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffc107',
    color: 'black',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    marginTop: '1rem'
  }
};

// Add table styles
const tableStyles = `
  table th, table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  table th {
    background-color: #f8f9fa;
    font-weight: bold;
  }
  table tr:hover {
    background-color: #f5f5f5;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = tableStyles;
document.head.appendChild(styleSheet);

export default Dashboard;