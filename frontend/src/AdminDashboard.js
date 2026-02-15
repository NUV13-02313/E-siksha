import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AdminDashboard.css';
import {
  getPendingContent,
  approveContent,
  getAdminStats,
  getUsers,
  getCourses,
  getNotes,
  deleteContent,
  updateUserStatus
} from './api';
import Navbar from './Navbar';

function AdminDashboard() {
  const navigate = useNavigate();
  
  // State management
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
  const [deleting, setDeleting] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // User status modal state
  const [showUserStatusModal, setShowUserStatusModal] = useState(false);
  const [userToModify, setUserToModify] = useState(null);
  const [newUserStatus, setNewUserStatus] = useState(true);

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

  // Open delete confirmation modal
  const openDeleteModal = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setDeleteReason('');
    setDeleteConfirmText('');
    setShowDeleteModal(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteType(null);
    setDeleteReason('');
    setDeleteConfirmText('');
  };

  // Handle delete content
  const handleDelete = async () => {
    if (!itemToDelete || !deleteType) return;
    
    // Confirm deletion by typing "DELETE"
    if (deleteConfirmText !== 'DELETE') {
      alert('Please type "DELETE" to confirm');
      return;
    }

    try {
      setDeleting(true);
      
      const response = await deleteContent(
        deleteType,
        itemToDelete._id,
        deleteReason || 'Content removed by admin'
      );
      
      if (response.success) {
        alert(`${deleteType === 'course' ? 'Course' : 'Notes'} deleted successfully!`);
        closeDeleteModal();
        // Refresh data after deletion
        fetchAdminData();
      } else {
        throw new Error(response.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || `Failed to delete ${deleteType}`);
    } finally {
      setDeleting(false);
    }
  };

  // Open user status modal
  const openUserStatusModal = (user) => {
    setUserToModify(user);
    setNewUserStatus(!user.isActive);
    setShowUserStatusModal(true);
  };

  // Close user status modal
  const closeUserStatusModal = () => {
    setShowUserStatusModal(false);
    setUserToModify(null);
  };

  // Handle user status change (activate/deactivate)
  const handleUserStatusChange = async () => {
    if (!userToModify) return;

    try {
      setUpdatingUser(true);
      
      const response = await updateUserStatus(
        userToModify._id,
        newUserStatus
      );
      
      if (response.success) {
        const action = newUserStatus ? 'activated' : 'deactivated';
        alert(`User ${action} successfully!`);
        closeUserStatusModal();
        // Refresh data after update
        fetchAdminData();
      } else {
        throw new Error(response.message || 'Status update failed');
      }
    } catch (err) {
      console.error('User status update error:', err);
      alert(err.message || 'Failed to update user status');
    } finally {
      setUpdatingUser(false);
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
        <h2>Admin Dashboard Error</h2>
        <p>{error}</p>
        <button onClick={fetchAdminData} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-wrapper">
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                Delete {deleteType === 'course' ? 'Course' : 'Notes'}
              </h3>
              <button className="modal-close" onClick={closeDeleteModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-box">
                <i className="fas fa-exclamation-triangle"></i>
                <p>You are about to permanently delete:</p>
              </div>
              
              <div className="item-preview-box">
                <strong>{itemToDelete.title}</strong>
                {itemToDelete.authorName || itemToDelete.instructorName && (
                  <span> by {itemToDelete.authorName || itemToDelete.instructorName}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="deleteReason">
                  Reason for deletion (optional):
                </label>
                <textarea
                  id="deleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Provide reason for deletion (will be logged)"
                  rows="3"
                  disabled={deleting}
                />
              </div>
              
              <div className="confirm-section">
                <p>Type <strong>DELETE</strong> to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                  disabled={deleting}
                  className="confirm-input"
                />
              </div>
              
              <div className="warning-text">
                <i className="fas fa-exclamation-circle"></i>
                This action cannot be undone. The content will be permanently removed.
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting || deleteConfirmText !== 'DELETE'}
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Permanently Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Status Modal */}
      {showUserStatusModal && userToModify && (
        <div className="modal-overlay" onClick={closeUserStatusModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {newUserStatus ? 'Activate' : 'Deactivate'} User
              </h3>
              <button className="modal-close" onClick={closeUserStatusModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="modal-body">
              <div className={`status-warning-box ${newUserStatus ? 'activate' : 'deactivate'}`}>
                <i className={`fas ${newUserStatus ? 'fa-check-circle' : 'fa-ban'}`}></i>
                <p>
                  Are you sure you want to {newUserStatus ? 'activate' : 'deactivate'} this user?
                </p>
              </div>
              
              <div className="user-info-box">
                <div className="user-avatar-large">
                  {userToModify.avatar ? (
                    <img 
                      src={userToModify.avatar.startsWith('http') 
                        ? userToModify.avatar 
                        : `http://localhost:5000${userToModify.avatar}`} 
                      alt={userToModify.fullName}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {userToModify.fullName?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                
                <div className="user-details">
                  <h4>{userToModify.fullName}</h4>
                  <p className="user-email">{userToModify.email}</p>
                  <p className="user-role">
                    Role: <span className={`role-badge ${userToModify.role}`}>{userToModify.role}</span>
                  </p>
                  <p className="current-status">
                    Current Status: 
                    <span className={`status-badge ${userToModify.isActive ? 'active' : 'inactive'}`}>
                      {userToModify.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
              </div>
              
              {!newUserStatus && (
                <div className="warning-box deactivate-warning">
                  <i className="fas fa-info-circle"></i>
                  <p>
                    Deactivating this user will prevent them from logging in and accessing their account.
                    All their data will be preserved but inaccessible until reactivated.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={closeUserStatusModal}
                disabled={updatingUser}
              >
                Cancel
              </button>
              <button 
                className={`btn ${newUserStatus ? 'btn-success' : 'btn-warning'}`}
                onClick={handleUserStatusChange}
                disabled={updatingUser}
              >
                {updatingUser ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className={`fas ${newUserStatus ? 'fa-check' : 'fa-ban'}`}></i>
                    {newUserStatus ? 'Activate User' : 'Deactivate User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-container">
        {/* Admin Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h2 className="dashboard-title">Admin Dashboard</h2>
            <div className="admin-user-info">
              <div className="user-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <span className="user-name">{user?.fullName}</span>
            </div>
          </div>
          
          <div className="sidebar-stats">
            <div className="stat-item">
              <div className="stat-icon courses-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.publishedCourses || 0}</span>
                <span className="stat-label">Published Courses</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon notes-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.publishedNotes || 0}</span>
                <span className="stat-label">Published Notes</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon pending-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {(stats?.pendingCourses || 0) + (stats?.pendingNotes || 0)}
                </span>
                <span className="stat-label">Pending Approval</span>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-icon users-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats?.totalUsers || 0}</span>
                <span className="stat-label">Total Users</span>
              </div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              <i className="fas fa-clock"></i>
              <span>Pending Approval</span>
              <span className="badge">{pendingCourses.length + pendingNotes.length}</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
              onClick={() => setActiveTab('courses')}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Manage Courses</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <i className="fas fa-file-alt"></i>
              <span>Manage Notes</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fas fa-users"></i>
              <span>Manage Users</span>
            </button>
            
            <button 
              className={`nav-item ${activeTab === 'add' ? 'active' : ''}`}
              onClick={() => setActiveTab('add')}
            >
              <i className="fas fa-plus-circle"></i>
              <span>Add Content</span>
            </button>
            
           
            
            <div className="nav-divider"></div>
            
            <button 
              className="nav-item logout-btn"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
              }}
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
             <Navbar />
          {activeTab === 'pending' && (
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-clock"></i>
                  Content Awaiting Approval
                </h2>
                <button className="btn btn-primary" onClick={fetchAdminData}>
                  <i className="fas fa-sync-alt"></i>
                  Refresh
                </button>
              </div>

              <div className="pending-content">
                {/* Pending Courses */}
                <div className="pending-category">
                  <h3 className="category-title">
                    <i className="fas fa-chalkboard-teacher"></i>
                    Courses ({pendingCourses.length})
                  </h3>
                  
                  {pendingCourses.length > 0 ? (
                    <div className="pending-grid">
                      {pendingCourses.map(course => (
                        <div key={course._id} className="pending-card">
                          <div className="pending-card-header">
                            <h4>{course.title}</h4>
                            <span className="pending-badge">Pending</span>
                          </div>
                          
                          <div className="pending-card-body">
                            <p className="author-info">
                              By {course.instructorName || 'Unknown Instructor'}
                            </p>
                            <p className="date-info">
                              Submitted: {formatDate(course.createdAt)}
                            </p>
                            <p className="description">
                              {course.description?.substring(0, 120)}...
                            </p>
                          </div>
                          
                          {course.thumbnail && (
                            <div className="pending-thumbnail">
                              <img 
                                src={course.thumbnail.startsWith('http') 
                                  ? course.thumbnail 
                                  : `http://localhost:5000${course.thumbnail}`} 
                                alt={course.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&auto=format&fit=crop";
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="pending-actions">
                            <button 
                              className="btn btn-approve"
                              onClick={() => handleApproveReject(course._id, 'course', 'approve')}
                              disabled={approving}
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                            <button 
                              className="btn btn-reject"
                              onClick={() => {
                                const reason = prompt('Please provide rejection reason:');
                                if (reason) {
                                  handleApproveReject(course._id, 'course', 'reject', reason);
                                }
                              }}
                              disabled={approving}
                            >
                              <i className="fas fa-times"></i>
                              Reject
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
                <div className="pending-category">
                  <h3 className="category-title">
                    <i className="fas fa-file-alt"></i>
                    Notes ({pendingNotes.length})
                  </h3>
                  
                  {pendingNotes.length > 0 ? (
                    <div className="pending-grid">
                      {pendingNotes.map(note => (
                        <div key={note._id} className="pending-card">
                          <div className="pending-card-header">
                            <h4>{note.title}</h4>
                            <span className="pending-badge">Pending</span>
                          </div>
                          
                          <div className="pending-card-body">
                            <p className="author-info">
                              By {note.authorName || 'Unknown Author'}
                            </p>
                            <p className="date-info">
                              Submitted: {formatDate(note.createdAt)}
                            </p>
                            <p className="description">
                              {note.description?.substring(0, 120)}...
                            </p>
                          </div>
                          
                          {note.thumbnail && (
                            <div className="pending-thumbnail">
                              <img 
                                src={note.thumbnail.startsWith('http') 
                                  ? note.thumbnail 
                                  : `http://localhost:5000${note.thumbnail}`} 
                                alt={note.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=300&auto=format&fit=crop";
                                }}
                              />
                            </div>
                          )}
                          
                          <div className="pending-actions">
                            <button 
                              className="btn btn-approve"
                              onClick={() => handleApproveReject(note._id, 'notes', 'approve')}
                              disabled={approving}
                            >
                              <i className="fas fa-check"></i>
                              Approve
                            </button>
                            <button 
                              className="btn btn-reject"
                              onClick={() => {
                                const reason = prompt('Please provide rejection reason:');
                                if (reason) {
                                  handleApproveReject(note._id, 'notes', 'reject', reason);
                                }
                              }}
                              disabled={approving}
                            >
                              <i className="fas fa-times"></i>
                              Reject
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
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-chalkboard-teacher"></i>
                  Manage Courses
                </h2>
                <button className="btn btn-primary" onClick={handleAddCourse}>
                  <i className="fas fa-plus"></i>
                  Add New Course
                </button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Students</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCourses.map(course => (
                      <tr key={course._id}>
                        <td className="table-title-cell">
                          {course.thumbnail && (
                            <img 
                              src={course.thumbnail.startsWith('http') 
                                ? course.thumbnail 
                                : `http://localhost:5000${course.thumbnail}`} 
                              alt={course.title}
                              className="table-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=50&auto=format&fit=crop";
                              }}
                            />
                          )}
                          <span className="title-text">{course.title}</span>
                        </td>
                        <td>{course.instructorName || 'N/A'}</td>
                        <td>{course.category}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(course.status)}`}>
                            {course.status}
                          </span>
                        </td>
                        <td>{(course.studentsEnrolled || 0).toLocaleString()}</td>
                        <td>{formatDate(course.createdAt)}</td>
                        <td className="action-cell">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => navigate(`/course/${course._id}`)}
                            title="View Course"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => alert('Edit functionality coming soon')}
                            title="Edit Course"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => openDeleteModal(course, 'course')}
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
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-file-alt"></i>
                  Manage Notes
                </h2>
                <button className="btn btn-primary" onClick={handleAddNote}>
                  <i className="fas fa-plus"></i>
                  Add New Notes
                </button>
              </div>
              
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Downloads</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allNotes.map(note => (
                      <tr key={note._id}>
                        <td className="table-title-cell">
                          {note.thumbnail && (
                            <img 
                              src={note.thumbnail.startsWith('http') 
                                ? note.thumbnail 
                                : `http://localhost:5000${note.thumbnail}`} 
                              alt={note.title}
                              className="table-thumbnail"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=50&auto=format&fit=crop";
                              }}
                            />
                          )}
                          <span className="title-text">{note.title}</span>
                        </td>
                        <td>{note.authorName || 'N/A'}</td>
                        <td>{note.category}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(note.status)}`}>
                            {note.status}
                          </span>
                        </td>
                        <td>{(note.downloads || 0).toLocaleString()}</td>
                        <td>{formatDate(note.createdAt)}</td>
                        <td className="action-cell">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => navigate(`/pdf/viewer/${note._id}`)}
                            title="View Notes"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => alert('Edit functionality coming soon')}
                            title="Edit Notes"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="action-btn delete-btn"
                            onClick={() => openDeleteModal(note, 'notes')}
                            title="Delete Notes"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                          <button 
                            className="action-btn download-btn"
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
            <div className="content-section">
              <div className="section-header">
                <h2 className="section-title">
                  <i className="fas fa-users"></i>
                  User Management
                </h2>
                <div className="user-stats">
                  <span>Total Users: {users.length}</span>
                  <span>Active: {users.filter(u => u.isActive).length}</span>
                  <span>Admins: {users.filter(u => u.role === 'admin').length}</span>
                </div>
              </div>
              
              <div className="table-container">
                <table className="data-table">
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
                        <td className="user-info-cell">
                          {user.avatar ? (
                            <img 
                              src={user.avatar.startsWith('http') 
                                ? user.avatar 
                                : `http://localhost:5000${user.avatar}`} 
                              alt={user.fullName}
                              className="user-avatar"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop";
                              }}
                            />
                          ) : (
                            <div className="user-avatar-placeholder small">
                              {user.fullName?.charAt(0) || '?'}
                            </div>
                          )}
                          <span>{user.fullName}</span>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td className="action-cell">
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => alert('Edit user functionality coming soon')}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className={`action-btn ${user.isActive ? 'deactivate-btn' : 'activate-btn'}`}
                            onClick={() => openUserStatusModal(user)}
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
            <div className="content-section">
              <h2 className="section-title">
                <i className="fas fa-plus-circle"></i>
                Add New Content
              </h2>
              <div className="content-options-grid">
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
                
                <div className="option-card disabled">
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

         
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;