import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/CourseDetail.css';
import Navbar from './Navbar';
import { getCourse, enrollInCourse } from './api';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchCourseDetails();
  }, [id]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await getCourse(id);
      
      if (response.success) {
        console.log('Fetched course details:', response.course);
        setCourse(response.course);
      } else {
        throw new Error(response.message || 'Failed to fetch course details');
      }
    } catch (err) {
      console.error('Error fetching course details:', err);
      alert(err.message || 'Failed to load course details');
      navigate('/list');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    try {
      const response = await enrollInCourse(id);
      
      if (response.success) {
        alert('Successfully enrolled in course!');
        setCourse(prev => ({ ...prev, isEnrolled: true }));
        navigate(`/course/${id}/learn`);
      } else {
        throw new Error(response.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(error.message || 'Enrollment failed. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleContinueLearning = () => {
    navigate(`/course/${id}/learn`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star filled"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt filled"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  const getTotalDuration = (videos) => {
    if (!videos || videos.length === 0) return '00:00';
    let totalMinutes = 0;
    
    videos.forEach(video => {
      if (video.duration) {
        const [hours, minutes] = video.duration.split(':').map(Number);
        totalMinutes += (hours || 0) * 60 + (minutes || 0);
      }
    });
    
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="course-detail-wrapper">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-wrapper">
        <Navbar />
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Course not found</h3>
          <button onClick={() => navigate('/list')}>Browse Courses</button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-wrapper">
      <Navbar />
      
      {/* Course Hero Section */}
      <div className="course-hero">
        <div className="hero-content">
          <div className="course-meta">
            <span className="category">{course.category}</span>
            <span className="level">
              {course.level?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </span>
            <span className="rating">
              {renderStars(course.rating || 4.5)}
              <span>{(course.rating || 4.5).toFixed(1)} ({course.totalRatings || 0} reviews)</span>
            </span>
          </div>
        
          <h1>{course.title}</h1>
          <p className="description">{course.description}</p>
        
          <div className="instructor-info">
            <img 
              src={course.instructor?.avatar || '/img/default-avatar.png'} 
              alt="Instructor"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
              }}
            />
            <div>
              <h4>Created by {course.instructorName || course.instructor?.fullName || 'Instructor'}</h4>
              <p>Expert Instructor</p>
            </div>
          </div>
        
          <div className="course-stats">
            <div className="stat">
              <i className="fas fa-users"></i>
              <span>{(course.studentsEnrolled || 0).toLocaleString()} students</span>
            </div>
            <div className="stat">
              <i className="fas fa-clock"></i>
              <span>{course.duration || '10 hours'}</span>
            </div>
            <div className="stat">
              <i className="fas fa-signal"></i>
              <span>
                {course.level?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </span>
            </div>
          </div>
        </div>
      
        <div className="hero-sidebar">
          <div className="enrollment-card">
            <div className="card-header">
              {course.isFree ? (
                <h3 className="price-free">FREE</h3>
              ) : (
                <>
                  <h3 className="price">₹{course.price || 499}</h3>
                  <p className="original-price">₹{(course.price * 2) || 999}</p>
                </>
              )}
            </div>
          
            <div className="card-body">
              <ul className="features-list">
                <li><i className="fas fa-check"></i> Full lifetime access</li>
                <li><i className="fas fa-check"></i> Certificate of completion</li>
                <li><i className="fas fa-check"></i> Access on mobile and TV</li>
                <li><i className="fas fa-check"></i> Downloadable resources</li>
              </ul>
            
              {course.isEnrolled ? (
                <button className="btn-continue" onClick={handleContinueLearning}>
                  <i className="fas fa-play-circle"></i> Continue Learning
                </button>
              ) : (
                <button 
                  className="btn-enroll" 
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Enrolling...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shopping-cart"></i> 
                      {course.isFree ? 'Enroll for Free' : 'Enroll Now'}
                    </>
                  )}
                </button>
              )}
              
              <p className="guarantee">
                <i className="fas fa-shield-alt"></i> 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Tabs */}
      <div className="course-tabs">
        <div className="tabs-container">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'curriculum' ? 'active' : ''}`}
            onClick={() => setActiveTab('curriculum')}
          >
            Curriculum ({course.modules?.length || 0} modules)
          </button>
          <button 
            className={`tab ${activeTab === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructor')}
          >
            Instructor
          </button>
          <button 
            className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews ({course.reviews?.length || 0})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="what-you-learn">
              <h3>What you'll learn</h3>
              <div className="learn-grid">
                <div className="learn-item">
                  <i className="fas fa-check"></i>
                  <span>Master {course.category} from scratch</span>
                </div>
                <div className="learn-item">
                  <i className="fas fa-check"></i>
                  <span>Build real-world projects</span>
                </div>
                <div className="learn-item">
                  <i className="fas fa-check"></i>
                  <span>Learn industry best practices</span>
                </div>
                <div className="learn-item">
                  <i className="fas fa-check"></i>
                  <span>Get lifetime access to course materials</span>
                </div>
              </div>
            </div>
          
            <div className="course-description">
              <h3>Description</h3>
              <p>{course.description}</p>
              <p>This comprehensive course will take you from beginner to advanced level. You'll learn through hands-on projects and real-world examples. The course includes {course.modules?.length || 0} modules with practical exercises and downloadable resources.</p>
            </div>
          
            <div className="requirements">
              <h3>Requirements</h3>
              <ul>
                <li>Basic computer knowledge</li>
                <li>No prior programming experience required</li>
                <li>Access to a computer with internet</li>
                <li>Eagerness to learn and practice</li>
              </ul>
            </div>
          </div>
        )}
        
        {activeTab === 'curriculum' && (
          <div className="curriculum-content">
            <div className="modules-list">
              {course.modules?.map((module, moduleIndex) => (
                <div key={moduleIndex} className="module-card">
                  <div className="module-header">
                    <h4>
                      <span>Module {moduleIndex + 1}: </span> {module.title}
                    </h4>
                    <span className="module-duration">
                      {module.videos?.length || 0} lectures • {getTotalDuration(module.videos)}
                    </span>
                  </div>
              
                  <div className="videos-list">
                    {module.videos?.map((video, videoIndex) => (
                      <div key={videoIndex} className="video-item">
                        <div className="video-info">
                          <i className={`fas fa-${video.isPreview ? 'eye' : 'lock'}`}></i>
                          <span>{video.title}</span>
                        </div>
                        <div className="video-duration">
                          {video.duration}
                          {video.isPreview && <span className="preview">Preview</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'instructor' && course.instructor && (
          <div className="instructor-content">
            <div className="instructor-profile">
              <img 
                src={course.instructor.avatar || '/img/default-avatar.png'} 
                alt="Instructor"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop";
                }}
              />
              <div className="instructor-details">
                <h3>{course.instructorName || course.instructor.fullName}</h3>
                <p className="title">Senior Instructor at E Siksha</p>
                <p className="bio">{course.instructor.bio || 'Experienced instructor with years of teaching experience.'}</p>
              
                <div className="instructor-stats">
                  <div className="stat">
                    <strong>{course.instructor.coursesCount || 5}</strong>
                    <span>Courses</span>
                  </div>
                  <div className="stat">
                    <strong>{course.instructor.studentsCount || '10K+'}</strong>
                    <span>Students</span>
                  </div>
                  <div className="stat">
                    <strong>{(course.instructor.rating || 4.8).toFixed(1)}</strong>
                    <span>Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div className="reviews-content">
            <div className="reviews-summary">
              <div className="average-rating">
                <h2>{(course.rating || 4.5).toFixed(1)}</h2>
                <div className="stars">
                  {renderStars(Math.round(course.rating || 4.5))}
                </div>
                <p>Course Rating</p>
              </div>
            
              <div className="rating-distribution">
                <div className="distribution-bar">
                  <span>5 stars</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '70%' }}></div>
                  </div>
                  <span>70%</span>
                </div>
                <div className="distribution-bar">
                  <span>4 stars</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '20%' }}></div>
                  </div>
                  <span>20%</span>
                </div>
                <div className="distribution-bar">
                  <span>3 stars</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '5%' }}></div>
                  </div>
                  <span>5%</span>
                </div>
                <div className="distribution-bar">
                  <span>2 stars</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '3%' }}></div>
                  </div>
                  <span>3%</span>
                </div>
                <div className="distribution-bar">
                  <span>1 star</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '2%' }}></div>
                  </div>
                  <span>2%</span>
                </div>
              </div>
            </div>
          
            <div className="reviews-list">
              {course.reviews?.map((review, index) => (
                <div key={index} className="review-card">
                  <div className="review-header">
                    <img 
                      src={review.user?.avatar || '/img/default-avatar.png'} 
                      alt="User"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop";
                      }}
                    />
                    <div>
                      <h4>{review.user?.fullName || review.userName || 'User'}</h4>
                      <div className="review-rating">
                        {renderStars(review.rating)}
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="course-footer">
        <div className="footer-content">
          <p>© 2025 E Siksha. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms of Service</a>
            <a href="#help">Help Center</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default CourseDetail;