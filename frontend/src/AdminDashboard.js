import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css';
import {
  getPendingContent,
  approveContent,
  getAdminStats,
  getUsers,
  getCourses,
  getNotes
} from './api';
import Navbar from './Navbar';

function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingCourses, setPendingCourses] = useState([]);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approving, setApproving] = useState(false);

  // Check authentication and role on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      alert('Please login to access admin dashboard');
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    if (parsedUser.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    // Fetch all admin data
    fetchAdminData();
  }, []);

  // Fetch all required admin data
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [
        pendingResponse,
        coursesResponse,
        notesResponse,
        statsResponse,
        usersResponse
      ] = await Promise.all([
        getPendingContent(),
        getCourses({ page: 1, limit: 100 }),
        getNotes({ page: 1, limit: 100 }),
        getAdminStats(),
        getUsers()
      ]);

      // Process pending content
      if (pendingResponse.success) {
        setPendingCourses(pendingResponse.courses || []);
        setPendingNotes(pendingResponse.notes || []);
      }

      // Process all courses
      if (coursesResponse.success) {
        setAllCourses(coursesResponse.courses || []);
      }

      // Process all notes
      if (notesResponse.success) {
        setAllNotes(notesResponse.notes || []);
      }

      // Process stats
      if (statsResponse.success) {
        setStats(statsResponse.stats);
      }

      // Process users
      if (usersResponse.success) {
        setUsers(usersResponse.users || []);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Approve or reject content
  const handleApproveReject = async (id, type, action, reason = '') => {
    try {
      setApproving(true);
      const response = await approveContent(type, id, action, reason);
      
      if (response.success) {
        alert(`Content ${action}d successfully!`);
        // Refresh data after action
        fetchAdminData();
      } else {
        throw new Error(response.message || 'Action failed');
      }
    } catch (err) {
      console.error(`${action} content error:`, err);
      alert(err.message || `Failed to ${action} content`);
    } finally {
      setApproving(false);
    }
  };

  // Handle add content navigation
  const handleAddCourse = () => {
    navigate('/add-content/course');
  };

  const handleAddNote = () => {
    navigate('/add-content/notes');
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'published';
      case 'pending':
        return 'pending';
      case 'rejected':
        return 'rejected';
      case 'draft':
        return 'draft';
      default:
        return 'pending';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Admin Dashboard Error</h3>
        <p>{error}</p>
        <button onClick={fetchAdminData} className="retry-btn">
          <i className="fas fa-redo"></i> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />
      
      <div className="admin-container">
        {/* Admin Sidebar */}
        <div className="admin-sidebar">
          <div className="admin-header">
            <h2>Admin Dashboard</h2>
            <div className="admin-user">
              <i className="fas fa-user-shield"></i>
              <span>{user?.fullName}</span>
            </div>
          </div>
          
          <div className="admin-stats">
            <div className="stat-card">
              <i className="fas fa-chalkboard-teacher"></i>
              <div>
                <h3>{stats?.publishedCourses || 0}</h3>
                <p>Published Courses</p>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-file-alt"></i>
              <div>
                <h3>{stats?.publishedNotes || 0}</h3>
                <p>Published Notes</p>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-clock"></i>
              <div>
                <h3>{(stats?.pendingCourses || 0) + (stats?.pendingNotes || 0)}</h3>
                <p>Pending Approval</p>
              </div>
            </div>
            <div className="stat-card">
              <i className="fas fa-users"></i>
              <div>
                <h3>{stats?.totalUsers || 0}</h3>
                <p>Total Users</p>
              </div>
            </div>
          </div>

          <nav className="admin-nav">
            <button 
              className={`nav-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <i className="fas fa-clock"></i> Pending Approval
              <span className="badge">{pendingCourses.length + pendingNotes.length}</span>
            </button>
            <button 
              className={`nav-btn ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <i className="fas fa-chalkboard-teacher"></i> Manage Courses
            </button>
            <button 
              className={`nav-btn ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <i className="fas fa-file-alt"></i> Manage Notes
            </button>
            <button 
              className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users"></i> Manage Users
            </button>
            <button 
              className={`nav-btn ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <i className="fas fa-plus-circle"></i> Add Content
            </button>
            <button 
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="fas fa-chart-line"></i> Analytics
            </button>
            <button 
              className="nav-btn logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {activeTab === 'pending' && (
            <div className="pending-tab">
              <div className="tab-header">
                <h2>Content Awaiting Approval</h2>
                <div className="tab-actions">
                  <button className="btn btn-primary" onClick={fetchAdminData}>
                    <i className="fas fa-sync-alt"></i> Refresh
                  </button>
                </div>
              </div>

              <div className="content-sections">
                {/* Pending Courses */}
                <div className="pending-section">
                  <h3><i className="fas fa-chalkboard-teacher"></i> Courses ({pendingCourses.length})</h3>
                  {pendingCourses.length > 0 ? (
                    <div className="pending-list">
                      {pendingCourses.map(course => (
                        <div key={course._id} className="pending-item">
                          <div className="item-info">
                            <h4>{course.title}</h4>
                            <p className="author">By {course.instructorName || 'Unknown Instructor'}</p>
                            <p className="date">Submitted: {formatDate(course.createdAt)}</p>
                            <p className="description">{course.description?.substring(0, 100)}...</p>
                          </div>
                          <div className="item-preview">
                            {course.thumbnail && (
                              <img 
                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`} 
                                alt={course.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&auto=format&fit=crop";
                                }}
                              />
                            )}
                          </div>
                          <div className="item-actions">
                            <button 
                              className="btn-approve"
                              onClick={() => handleApproveReject(course._id, 'course', 'approve')}
                              disabled={approving}
                            >
                              <i className="fas fa-check"></i> Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => {
                                const reason = prompt('Please provide rejection reason:');
                                if (reason) {
                                  handleApproveReject(course._id, 'course', 'reject', reason);
                                }
                              }}
                              disabled={approving}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-check-circle"></i>
                      <p>No pending courses to review</p>
                    </div>
                  )}
                </div>

                {/* Pending Notes */}
                <div className="pending-section">
                  <h3><i className="fas fa-file-alt"></i> Notes ({pendingNotes.length})</h3>
                  {pendingNotes.length > 0 ? (
                    <div className="pending-list">
                      {pendingNotes.map(note => (
                        <div key={note._id} className="pending-item">
                          <div className="item-info">
                            <h4>{note.title}</h4>
                            <p className="author">By {note.authorName || 'Unknown Author'}</p>
                            <p className="date">Submitted: {formatDate(note.createdAt)}</p>
                            <p className="description">{note.description?.substring(0, 100)}...</p>
                          </div>
                          <div className="item-preview">
                            {note.thumbnail && (
                              <img 
                                src={note.thumbnail.startsWith('http') ? note.thumbnail : `http://localhost:5000${note.thumbnail}`} 
                                alt={note.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=200&auto=format&fit=crop";
                                }}
                              />
                            )}
                          </div>
                          <div className="item-actions">
                            <button 
                              className="btn-approve"
                              onClick={() => handleApproveReject(note._id, 'notes', 'approve')}
                              disabled={approving}
                            >
                              <i className="fas fa-check"></i> Approve
                            </button>
                            <button 
                              className="btn-reject"
                              onClick={() => {
                                const reason = prompt('Please provide rejection reason:');
                                if (reason) {
                                  handleApproveReject(note._id, 'notes', 'reject', reason);
                                }
                              }}
                              disabled={approving}
                            >
                              <i className="fas fa-times"></i> Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-check-circle"></i>
                      <p>No pending notes to review</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="courses-tab">
              <div className="tab-header">
                <h2>Manage Courses</h2>
                <button className="btn btn-primary" onClick={handleAddCourse}>
                  <i className="fas fa-plus"></i> Add New Course
                </button>
              </div>
            
              <div className="content-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Students</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCourses.map(course => (
                      <tr key={course._id}>
                        <td>
                          <div className="table-title">
                            {course.thumbnail && (
                              <img 
                                src={course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`} 
                                alt={course.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=50&auto=format&fit=crop";
                                }}
                              />
                            )}
                            {course.title}
                          </div>
                        </td>
                        <td>{course.instructorName || 'N/A'}</td>
                        <td>{course.category}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(course.status)}`}>
                            {course.status}
                          </span>
                        </td>
                        <td>{(course.studentsEnrolled || 0).toLocaleString()}</td>
                        <td className="actions">
                          <button 
                            className="btn-view"
                            onClick={() => navigate(`/course/${course._id}`)}
                            title="View Course"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn-edit"
                            onClick={() => alert('Edit functionality coming soon')}
                            title="Edit Course"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this course?')) {
                                alert('Delete functionality coming soon');
                              }
                            }}
                            title="Delete Course"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="notes-tab">
              <div className="tab-header">
                <h2>Manage Notes</h2>
                <button className="btn btn-primary" onClick={handleAddNote}>
                  <i className="fas fa-plus"></i> Add New Notes
                </button>
              </div>
            
              <div className="content-table">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Downloads</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allNotes.map(note => (
                      <tr key={note._id}>
                        <td>
                          <div className="table-title">
                            {note.thumbnail && (
                              <img 
                                src={note.thumbnail.startsWith('http') ? note.thumbnail : `http://localhost:5000${note.thumbnail}`} 
                                alt={note.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=50&auto=format&fit=crop";
                                }}
                              />
                            )}
                            {note.title}
                          </div>
                        </td>
                        <td>{note.authorName || 'N/A'}</td>
                        <td>{note.category}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(note.status)}`}>
                            {note.status}
                          </span>
                        </td>
                        <td>{(note.downloads || 0).toLocaleString()}</td>
                        <td className="actions">
                          <button 
                            className="btn-view"
                            onClick={() => navigate(`/pdf/viewer/${note._id}`)}
                            title="View Notes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn-edit"
                            onClick={() => alert('Edit functionality coming soon')}
                            title="Edit Notes"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete these notes?')) {
                                alert('Delete functionality coming soon');
                              }
                            }}
                            title="Delete Notes"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button 
                            className="btn-download"
                            onClick={() => {
                              if (note.externalUrl) {
                                window.open(note.externalUrl, '_blank');
                              } else {
                                alert('No download link available');
                              }
                            }}
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <div className="tab-header">
                <h2>User Management</h2>
                <div className="user-stats">
                  <span>Total Users: {users.length}</span>
                  <span>Active: {users.filter(u => u.isActive).length}</span>
                  <span>Admins: {users.filter(u => u.role === 'admin').length}</span>
                </div>
              </div>
            
              <div className="content-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-info">
                            {user.avatar ? (
                              <img 
                                src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5000${user.avatar}`} 
                                alt={user.fullName}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop";
                                }}
                              />
                            ) : (
                              <div className="user-avatar">
                                {user.fullName.charAt(0)}
                              </div>
                            )}
                            {user.fullName}
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'published' : 'rejected'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td className="actions">
                          <button 
                            className="btn-edit"
                            onClick={() => alert('Edit user functionality coming soon')}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className={user.isActive ? "btn-reject" : "btn-approve"}
                            onClick={() => {
                              const action = user.isActive ? 'deactivate' : 'activate';
                              if (window.confirm(`Are you sure you want to ${action} this user?`)) {
                                alert(`${action.charAt(0).toUpperCase() + action.slice(1)} functionality coming soon`);
                              }
                            }}
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            <i className={`fas ${user.isActive ? 'fa-user-times' : 'fa-user-check'}`}></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="add-content-tab">
              <h2>Add New Content</h2>
              <div className="content-options">
                <div className="option-card" onClick={handleAddCourse}>
                  <div className="option-icon">
                    <i className="fas fa-chalkboard-teacher"></i>
                  </div>
                  <h3>Add Course</h3>
                  <p>Create a new course with videos, quizzes, and assignments</p>
                  <button className="btn btn-primary">Create Course</button>
                </div>
              
                <div className="option-card" onClick={handleAddNote}>
                  <div className="option-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h3>Add Notes</h3>
                  <p>Upload PDF notes or create study materials</p>
                  <button className="btn btn-primary">Upload Notes</button>
                </div>
              
                <div className="option-card">
                  <div className="option-icon">
                    <i className="fas fa-question-circle"></i>
                  </div>
                  <h3>Add Quiz</h3>
                  <p>Create assessments and quizzes for courses</p>
                  <button className="btn btn-primary" disabled>Coming Soon</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-tab">
              <h2>Platform Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Total Users</h3>
                  <div className="analytics-value">{stats?.totalUsers || 0}</div>
                  <div className="analytics-trend">
                    <i className="fas fa-chart-line"></i>
                    <span>+15% from last month</span>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Total Courses</h3>
                  <div className="analytics-value">{stats?.totalCourses || 0}</div>
                  <div className="analytics-trend">
                    <i className="fas fa-chart-line"></i>
                    <span>+8% from last month</span>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Total Notes</h3>
                  <div className="analytics-value">{stats?.totalNotes || 0}</div>
                  <div className="analytics-trend">
                    <i className="fas fa-chart-line"></i>
                    <span>+12% from last month</span>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Pending Content</h3>
                  <div className="analytics-value">{(stats?.pendingCourses || 0) + (stats?.pendingNotes || 0)}</div>
                  <div className="analytics-trend">
                    <i className="fas fa-clock"></i>
                    <span>Requires review</span>
                  </div>
                </div>
              </div>
              
              <div className="analytics-chart">
                <h3>Content Growth</h3>
                <div className="chart-placeholder">
                  <i className="fas fa-chart-bar"></i>
                  <p>Interactive charts coming soon</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;