import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Dashboard.css';
import { getDashboardData, updateProfile } from './api'; // Import API functions
import Navbar from './Navbar';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    bio: '',
    avatar: null
  });

  // Check authentication and fetch data on mount
 // REPLACE YOUR EXISTING useEffect WITH THIS:
useEffect(() => {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  // CRITICAL: Validate BOTH token AND user data exist
  if (!token || !userData) {
    console.warn('Missing auth credentials - redirecting to login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
    return;
  }

  try {
    // SAFETY: Validate JSON parsing won't crash
    const parsedUser = JSON.parse(userData);
    
    // CRITICAL: Verify required user fields exist
    if (!parsedUser?.id || !parsedUser?.fullName) {
      throw new Error('Invalid user data structure');
    }
    
    setUser(parsedUser);
    setProfileForm(prev => ({
      ...prev,
      fullName: parsedUser.fullName || '',
      bio: parsedUser.bio || ''
    }));
    
    // Fetch dashboard data AFTER user is validated
    fetchDashboardData();
  } catch (err) {
    console.error('Auth validation failed:', err);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('Session expired. Please login again.');
    navigate('/login', { replace: true });
  }
}, [navigate]);

  // Fetch dashboard data from MongoDB
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getDashboardData();
      
      if (response.success) {
        console.log('Dashboard data:', response.data);
        setDashboardData(response.data);
        
        // Update user with fresh data from backend
         if (response.data.user) {
        const backendUser = response.data.user;
        const updatedUser = {
          ...backendUser,
          // Fallback for avatar if missing from backend
          avatar: backendUser.avatar || ''
        };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          // Update profile form with fresh data
          setProfileForm({
            fullName: updatedUser.fullName || '',
            bio: updatedUser.bio || '',
            avatar: null
          });
        }
      } else {
        throw new Error(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate overall progress from stats
  const calculateOverallProgress = () => {
    if (!dashboardData?.stats) return 0;
    return Math.round(dashboardData.stats.averageProgress || 0);
  };

  // Get recent courses (max 3 for overview)
  const getRecentCourses = () => {
    if (!dashboardData?.recentCourses) return [];
    return dashboardData.recentCourses.slice(0, 3);
  };

  // Get all enrolled courses
  const getEnrolledCourses = () => {
    if (!dashboardData?.recentCourses) return [];
    return dashboardData.recentCourses;
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('fullName', profileForm.fullName);
      formData.append('bio', profileForm.bio);
      
      if (profileForm.avatar) {
        formData.append('avatar', profileForm.avatar);
      }

      const response = await updateProfile(formData);
      
      if (response.success) {
        // Update user in state and localStorage
        const updatedUser = {
          ...user,
          fullName: response.user.fullName,
          bio: response.user.bio,
          avatar: response.user.avatar
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Reset form and close edit mode
        setIsEditingProfile(false);
        alert('Profile updated successfully!');
        fetchDashboardData(); // Refresh dashboard data
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      alert(err.message || 'Failed to update profile. Please try again.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
// Loading state
if (loading) {
  return (
    <div className="dashboard-loading-container">
      <div className="dashboard-loading-card">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2>Loading Your Dashboard</h2>
        <p>Fetching your learning progress and course data...</p>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '35%' }}></div>
          </div>
          <span className="progress-text">35%</span>
        </div>
        <div className="loading-tips">
          <p><i className="fas fa-lightbulb"></i> Tip: Complete your profile to get personalized course recommendations!</p>
        </div>
      </div>
    </div>
  );
}
 
  // Error state
  if (error) {
    return (
      <div className="dashboard-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Dashboard Error</h3>
        <p>{error}</p>
        <button onClick={fetchDashboardData} className="retry-btn">
          <i className="fas fa-redo"></i> Retry
        </button>
      </div>
    );
  }
if (!user) {
  console.warn('User state is null - redirecting');
  navigate('/login', { replace: true });
  return null;
}
  // Get stats with fallbacks
  const stats = dashboardData?.stats || {};
  const recentCourses = getRecentCourses();
  const enrolledCourses = getEnrolledCourses();
  const overallProgress = calculateOverallProgress();

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <h1>My Learning Dashboard</h1>
          <p>Welcome back, {user?.fullName?.split(' ')[0]}! Continue your learning journey</p>
        </header>

        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-header">
               
                   <div className="profile-avatar-container">
  {user?.avatar ? (
    <img 
      src={
        user.avatar.startsWith('http') 
          ? user.avatar 
          : `http://localhost:5000${user.avatar}`
      }
      alt={user.fullName || 'User'}
      className="profile-avatar"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || 'U')}&background=6366f1&color=fff`;
      }}
    />
  ) : (
    <div className="profile-avatar-placeholder">
      <span>{user?.fullName?.charAt(0) || 'U'}</span>
    </div>
  )}
</div>
                <h3>{user?.fullName || 'User'}</h3>
                <p className="user-email">{user?.email || 'email@example.com'}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-number">{stats.totalEnrollments || 0}</span>
                    <span className="stat-label">Courses</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{overallProgress}%</span>
                    <span className="stat-label">Progress</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{stats.completedCourses || 0}</span>
                    <span className="stat-label">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="dashboard-nav">
              <button 
                className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="fas fa-home"></i> Overview
              </button>
              <button 
                className={`nav-item ${activeTab === 'courses' ? 'active' : ''}`}
                onClick={() => setActiveTab('courses')}
              >
                <i className="fas fa-book-open"></i> My Courses
              </button>
              <button 
                className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
                onClick={() => setActiveTab('notes')}
              >
                <i className="fas fa-file-alt"></i> My Notes
              </button>
              <button 
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('profile');
                  setIsEditingProfile(false);
                }}
              >
                <i className="fas fa-user"></i> Profile
              </button>
              <button 
                className={`nav-item ${activeTab === 'contributions' ? 'active' : ''}`}
                onClick={() => setActiveTab('contributions')}
              >
                <i className="fas fa-lightbulb"></i> My Contributions
              </button>
              <button 
                className="nav-item logout-btn"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="dashboard-main">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="welcome-section">
                  <h2>Continue Your Learning Journey</h2>
                  <p>You're making great progress! Keep going to achieve your goals.</p>
                </div>

                <div className="progress-section">
                  <h3>Overall Progress</h3>
                  <div className="progress-card">
                    <div className="progress-header">
                      <span>Current Progress</span>
                      <span className="progress-percentage">{overallProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <div className="stat-item">
                        <i className="fas fa-graduation-cap"></i>
                        <div>
                          <span className="stat-value">{stats.completedCourses || 0}</span>
                          <span className="stat-label">Completed Courses</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-trophy"></i>
                        <div>
                          <span className="stat-value">{stats.totalEnrollments || 0}</span>
                          <span className="stat-label">Total Enrollments</span>
                        </div>
                      </div>
                      <div className="stat-item">
                        <i className="fas fa-medal"></i>
                        <div>
                          <span className="stat-value">{stats.submittedCourses || 0}</span>
                          <span className="stat-label">Contributions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="recent-courses">
                  <div className="section-header">
                    <h3>Continue Learning</h3>
                    <button 
                      className="view-all-btn" 
                      onClick={() => setActiveTab('courses')}
                    >
                      View All <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                  
                  <div className="course-grid">
                    {recentCourses.length > 0 ? (
                      recentCourses.map((enrollment) => {
                        const course = enrollment.course;
                        const progress = enrollment.progress || 0;
                        return (
                          <div 
                            key={course._id} 
                            className="course-card" 
                            onClick={() => navigate(`/course/${course._id}`)}
                          >
                            <div className="course-image">
                              <img 
                                src={course.thumbnail?.startsWith('http') 
                                  ? course.thumbnail 
                                  : `http://localhost:5000${course.thumbnail}`} 
                                alt={course.title}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=169&fit=crop";
                                }}
                              />
                              <div className="course-progress">
                                <div 
                                  className="progress-circle" 
                                  style={{ 
                                    background: `conic-gradient(#6366f1 ${progress * 3.6}deg, #e2e8f0 ${progress * 3.6}deg 360deg)` 
                                  }}
                                >
                                  <span>{progress}%</span>
                                </div>
                              </div>
                            </div>
                            <div className="course-content">
                              <span className="course-category">{course.category}</span>
                              <h4>{course.title}</h4>
                              <p className="course-description">
                                {course.description?.substring(0, 80)}...
                              </p>
                              <div className="course-footer">
                                <span className="progress-text">{progress}% Complete</span>
                                <button className="continue-btn">
                                  Continue <i className="fas fa-arrow-right"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-state">
                        <i className="fas fa-book-open"></i>
                        <h3>No active courses</h3>
                        <p>Start learning by enrolling in your first course</p>
                        <button 
                          className="browse-courses-btn" 
                          onClick={() => navigate('/list')}
                        >
                          <i className="fas fa-search"></i> Browse Courses
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="contributions-section">
                  <div className="section-header">
                    <h3>Your Contributions</h3>
                    <button 
                      className="view-all-btn" 
                      onClick={() => setActiveTab('contributions')}
                    >
                      View All <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                  
                  <div className="contributions-grid">
                    <div className="contribution-card">
                      <i className="fas fa-chalkboard-teacher"></i>
                      <h4>{stats.submittedCourses || 0}</h4>
                      <p>Courses Created</p>
                    </div>
                    <div className="contribution-card">
                      <i className="fas fa-file-alt"></i>
                      <h4>{stats.submittedNotes || 0}</h4>
                      <p>Notes Shared</p>
                    </div>
                    <div className="contribution-card">
                      <i className="fas fa-star"></i>
                      <h4>{overallProgress}</h4>
                      <p>Avg. Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'courses' && (
              <div className="courses-tab">
                <div className="section-header">
                  <h2>My Courses ({enrolledCourses.length})</h2>
                  <button className="browse-btn" onClick={() => navigate('/list')}>
                    <i className="fas fa-plus"></i> Browse More Courses
                  </button>
                </div>
                
                {enrolledCourses.length > 0 ? (
                  <div className="enrolled-courses">
                    {enrolledCourses.map((enrollment) => {
                      const course = enrollment.course;
                      const progress = enrollment.progress || 0;
                      return (
                        <div key={course._id} className="enrolled-course-card">
                          <div className="course-thumbnail">
                            <img 
                              src={course.thumbnail?.startsWith('http') 
                                ? course.thumbnail 
                                : `http://localhost:5000${course.thumbnail}`} 
                              alt={course.title}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=200&h=113&fit=crop";
                              }}
                            />
                          </div>
                          <div className="course-details">
                            <div className="course-header">
                              <h3>{course.title}</h3>
                              <span className={`course-status ${progress === 100 ? 'completed' : 'active'}`}>
                                {progress === 100 ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <p className="course-description">{course.description?.substring(0, 100)}...</p>
                            <div className="course-meta">
                              <span><i className="fas fa-user"></i> {course.instructorName || 'Instructor'}</span>
                              <span><i className="fas fa-clock"></i> {course.duration || '10 hours'}</span>
                              <span><i className="fas fa-chart-line"></i> {course.level || 'Beginner'}</span>
                            </div>
                            <div className="course-progress-section">
                              <div className="progress-label">
                                <span>Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="course-progress-bar">
                                <div 
                                  className="progress" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="course-actions">
                              <button 
                                className="resume-btn"
                                onClick={() => navigate(`/course/${course._id}`)}
                              >
                                {progress === 100 ? (
                                  <>
                                    <i className="fas fa-certificate"></i> View Certificate
                                  </>
                                ) : (
                                  <>
                                    <i className="fas fa-play-circle"></i> Resume Course
                                  </>
                                )}
                              </button>
                              <button 
                                className="view-details-btn"
                                onClick={() => navigate(`/course/${course._id}`)}
                              >
                                <i className="fas fa-info-circle"></i> Details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <i className="fas fa-book"></i>
                    <h3>No enrolled courses</h3>
                    <p>Start your learning journey by enrolling in courses</p>
                    <button 
                      className="browse-courses-btn" 
                      onClick={() => navigate('/list')}
                    >
                      <i className="fas fa-search"></i> Browse Courses
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="notes-tab">
                <div className="section-header">
                  <h2>My Notes</h2>
                  <button 
                    className="add-note-btn" 
                    onClick={() => navigate('/add-content/notes')}
                  >
                    <i className="fas fa-plus"></i> Add New Notes
                  </button>
                </div>
                
                <div className="notes-grid">
                  {[1, 2, 3].map((note) => (
                    <div key={note} className="note-card">
                      <div className="note-thumbnail">
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      <div className="note-content">
                        <h4>JavaScript Complete Reference</h4>
                        <p className="note-description">Comprehensive guide to JavaScript ES6+ with examples</p>
                        <div className="note-meta">
                          <span><i className="fas fa-folder"></i> Web Development</span>
                          <span><i className="fas fa-download"></i> 150 downloads</span>
                        </div>
                        <div className="note-actions">
                          <button className="view-note-btn">
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button className="download-note-btn">
                            <i className="fas fa-download"></i> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="empty-state">
                  <i className="fas fa-sticky-note"></i>
                  <h3>No saved notes</h3>
                  <p>Start adding notes to keep track of your learning</p>
                  <button 
                    className="add-note-btn" 
                    onClick={() => navigate('/add-content/notes')}
                  >
                    <i className="fas fa-plus"></i> Add Your First Note
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="profile-tab">
                <div className="section-header">
                  <h2>Profile Settings</h2>
                  {!isEditingProfile ? (
                    <button 
                      className="edit-profile-btn"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <i className="fas fa-edit"></i> Edit Profile
                    </button>
                  ) : (
                    <button 
                      className="cancel-edit-btn"
                      onClick={() => {
                        setIsEditingProfile(false);
                        // Reset form to current user data
                        setProfileForm({
                          fullName: user?.fullName || '',
                          bio: user?.bio || '',
                          avatar: null
                        });
                      }}
                    >
                      <i className="fas fa-times"></i> Cancel
                    </button>
                  )}
                </div>
                
                <div className="profile-container">
                  <div className="profile-avatar-section">
                    <div className="avatar-preview">
                      {profileForm.avatar ? (
                        <img 
                          src={URL.createObjectURL(profileForm.avatar)} 
                          alt="Preview" 
                        />
                      ) : user?.avatar ? (
                        <img 
                          src={user.avatar.startsWith('http') 
                            ? user.avatar 
                            : `http://localhost:5000${user.avatar}`} 
                          alt="Profile" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=fff`;
                          }}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          <span>{user?.fullName?.charAt(0) || 'U'}</span>
                        </div>
                      )}
                    </div>
                    {isEditingProfile && (
                      <div className="avatar-upload">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          onChange={(e) => setProfileForm({...profileForm, avatar: e.target.files[0]})}
                          disabled={!isEditingProfile}
                        />
                        <label htmlFor="avatar-upload" className="upload-label">
                          <i className="fas fa-camera"></i> Change Photo
                        </label>
                        <p className="upload-hint">Recommended: 400x400px (JPG, PNG)</p>
                      </div>
                    )}
                  </div>
                  
                  <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input 
                        type="text" 
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                        disabled={!isEditingProfile}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email Address</label>
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                      />
                      <p className="form-hint">Email cannot be changed</p>
                    </div>
                    
                    <div className="form-group">
                      <label>Bio</label>
                      <textarea 
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                        disabled={!isEditingProfile}
                        rows="4"
                        placeholder="Tell us about yourself and your learning goals..."
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Member Since</label>
                      <input 
                        type="text" 
                        value={user?.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'N/A'}
                        disabled
                      />
                    </div>
                    
                    {isEditingProfile && (
                      <div className="form-actions">
                        <button type="submit" className="save-btn">
                          <i className="fas fa-save"></i> Save Changes
                        </button>
                        <button 
                          type="button" 
                          className="cancel-btn"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileForm({
                              fullName: user?.fullName || '',
                              bio: user?.bio || '',
                              avatar: null
                            });
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'contributions' && (
              <div className="contributions-tab">
                <div className="section-header">
                  <h2>My Contributions</h2>
                  <div className="contribution-stats">
                    <div className="stat">
                      <span className="stat-number">{stats.submittedCourses || 0}</span>
                      <span className="stat-label">Courses Created</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{stats.submittedNotes || 0}</span>
                      <span className="stat-label">Notes Shared</span>
                    </div>
                  </div>
                </div>
                
                <div className="contribution-sections">
                  <div className="contribution-section">
                    <h3><i className="fas fa-chalkboard-teacher"></i> Created Courses</h3>
                    {stats.submittedCourses > 0 ? (
                      <div className="contribution-list">
                        {[1, 2].map((course) => (
                          <div key={course} className="contribution-item">
                            <div className="contribution-thumbnail">
                              <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=60&fit=crop" alt="Course" />
                            </div>
                            <div className="contribution-details">
                              <h4>Complete React Course 2024</h4>
                              <p className="contribution-meta">
                                <span><i className="fas fa-users"></i> 1,250 students</span>
                                <span><i className="fas fa-star"></i> 4.8 (45 reviews)</span>
                              </p>
                              <div className="contribution-actions">
                                <button className="view-btn">
                                  <i className="fas fa-eye"></i> View
                                </button>
                                <button className="edit-btn">
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button className="analytics-btn">
                                  <i className="fas fa-chart-bar"></i> Analytics
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <i className="fas fa-chalkboard-teacher"></i>
                        <h3>No courses created yet</h3>
                        <p>Share your knowledge by creating your first course</p>
                        <button 
                          className="create-course-btn" 
                          onClick={() => navigate('/add-content/course')}
                        >
                          <i className="fas fa-plus-circle"></i> Create Your First Course
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="contribution-section">
                    <h3><i className="fas fa-file-alt"></i> Shared Notes</h3>
                    {stats.submittedNotes > 0 ? (
                      <div className="contribution-list">
                        {[1, 2, 3].map((note) => (
                          <div key={note} className="contribution-item">
                            <div className="contribution-thumbnail">
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="contribution-details">
                              <h4>JavaScript Complete Reference Guide</h4>
                              <p className="contribution-meta">
                                <span><i className="fas fa-download"></i> 1,850 downloads</span>
                                <span><i className="fas fa-calendar"></i> Jan 15, 2024</span>
                              </p>
                              <div className="contribution-actions">
                                <button className="view-btn">
                                  <i className="fas fa-eye"></i> View
                                </button>
                                <button className="edit-btn">
                                  <i className="fas fa-edit"></i> Edit
                                </button>
                                <button className="download-btn">
                                  <i className="fas fa-download"></i> Download Stats
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-state">
                        <i className="fas fa-file-alt"></i>
                        <h3>No notes shared yet</h3>
                        <p>Help others by sharing your study materials</p>
                        <button 
                          className="create-note-btn" 
                          onClick={() => navigate('/add-content/notes')}
                        >
                          <i className="fas fa-plus-circle"></i> Share Your First Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;