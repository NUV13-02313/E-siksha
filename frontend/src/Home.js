import React, { useState, useEffect } from 'react';
import './css/h.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getCourses, getNotes } from './api'; // Import API functions

function Home() {
  const navigate = useNavigate();
  
  // State management
  const [courses, setCourses] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch exactly 3 courses and 6 notes
        const [coursesRes, notesRes] = await Promise.all([
          getCourses({ limit: 3, page: 1 }),
          getNotes({ limit: 6, page: 1 })
        ]);
        
        if (coursesRes.success) {
          setCourses(coursesRes.courses || []);
        } else {
          throw new Error(coursesRes.message || 'Failed to fetch courses');
        }
        
        if (notesRes.success) {
          setNotes(notesRes.notes || []);
        } else {
          throw new Error(notesRes.message || 'Failed to fetch notes');
        }
      } catch (err) {
        console.error('Home page data fetch error:', err);
        setError(err.message || 'Failed to load content. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Helper function to handle image URLs
  const getImageUrl = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  // Navigation handlers
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleNoteClick = (noteId) => {
    navigate(`/pdf/viewer/${noteId}`);
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
          <h2>Loading E-Siksha</h2>
          <p>Fetching the best courses and notes for you...</p>
          <div className="loading-progress">
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <span className="progress-text">Preparing your learning journey</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container" style={{ marginTop: '100px' }}>
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Content Loading Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-btn"
        >
          <i className="fas fa-redo"></i> Refresh Page
        </button>
      </div>
    );
  }

  // Get badge type for courses
  const getCourseBadge = (course) => {
    if (course.isFree) return 'free';
    if (course.studentsEnrolled > 5000) return 'popular';
    return 'new';
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="mid">
          <div className="hero-content">
            <h1>Online learning <br /> platform</h1>
            <p>
              Build skills with courses, certificates and degrees online from
              world-class universities and companies.
            </p>
            <button className="hero-btn" onClick={() => navigate('/reg')}>
              Join For Free
            </button>
          </div>
          <div className="group">
            <img 
              className="group-img" 
              src="/img/c.jpg" 
              alt="Students learning" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop";
              }}
            />
          </div>
        </div>
      </section>

      {/* Skill Tracks Section (Static) */}
      <section className="skill-tracks">
        <div className="skill-left">
          <h2>
            Learn essential career <br />
            <span>and life skills</span>
          </h2>
          <p>
            E Siksha helps you build in-demand skills fast and advance
            your career in a changing job market.
          </p>
        </div>
        
        <div className="skill-right">
          <div className="skill-card llm" onClick={() => navigate('/list?category=Programming')}>
            <img src="https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=600&auto=format&fit=crop" alt="JAVA Programming" />
            <div className="skill-footer">
              <h4>JAVA</h4>
              <span>→</span>
            </div>
          </div>
          <div className="skill-card ml" onClick={() => navigate('/list?category=Programming')}>
            <img src="https://images.unsplash.com/photo-1594904351111-a072f80b1a71?w=600&auto=format&fit=crop" alt="C/C++ Programming" />
            <div className="skill-footer">
              <h4>C/C++</h4>
              <span>→</span>
            </div>
          </div>
          <div className="skill-card ai" onClick={() => navigate('/list?category=Programming')}>
            <img src="https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?w=600&auto=format&fit=crop" alt="Python Programming" />
            <div className="skill-footer">
              <h4>PYTHON</h4>
              <span>→</span>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights">
        <div className="highlight-row">
          <div className="highlight-image">
            <img 
              src="/img/a.png" 
              alt="Video Learning" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&auto=format&fit=crop";
              }}
            />
          </div>
          <div className="highlight-content">
            <h3>Learn with High Quality Videos</h3>
            <p>
              Watch structured, high-quality video lessons created by expert instructors.
              Learn at your own pace with lifetime access.
            </p>
            <a className="link-btn" onClick={() => navigate('/list')}>Explore Courses →</a>
          </div>
        </div>

        <div className="highlight-row reverse">
          <div className="highlight-image">
            <img 
              src="https://images.pexels.com/photos/317356/pexels-photo-317356.jpeg" 
              alt="Notes" 
            />
          </div>
          <div className="highlight-content">
            <h3>Access Free & Premium Notes</h3>
            <p>
              Download easy-to-understand notes and study materials to revise concepts
              anytime, anywhere.
            </p>
            <a className="link-btn" onClick={() => navigate('/pdf')}>Browse Notes →</a>
          </div>
        </div>

        <div className="highlight-row">
          <div className="highlight-image">
            <img 
              src="/img/b.png" 
              alt="Instructor" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop";
              }}
            />
          </div>
          <div className="highlight-content">
            <h3>Learn from Expert Instructors</h3>
            <p>
              Courses are created by experienced teachers and industry professionals
              to ensure practical and career-focused learning.
            </p>
            <a className="link-btn" onClick={() => navigate('/list')}>Meet Instructors →</a>
          </div>
        </div>
      </section>

      {/* Courses Section - DYNAMIC (LIMIT 3) */}
      <section className="courses">
        <h2 className="courses-heading">Upskill with Industry-Ready Courses</h2>
        <p className="courses-subtitle">
          Learn from curated courses designed to build real-world skills and confidence.
        </p>
        
        <div className="course-grid">
          {courses.map((course) => (
            <div 
              key={course._id} 
              className="course-card large"
              onClick={() => handleCourseClick(course._id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="course-image">
                {getCourseBadge(course) && (
                  <span className={`badge ${getCourseBadge(course)}`}>
                    {getCourseBadge(course).toUpperCase()}
                  </span>
                )}
                <img 
                  src={getImageUrl(course.thumbnail)} 
                  alt={course.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop";
                  }}
                />
                <div className="course-overlay">
                  <span className="overlay-btn">View Course</span>
                </div>
              </div>
              <div className="course-body">
                <h4>{course.title}</h4>
                <p className="course-desc">
                  {course.description?.substring(0, 80)}...
                </p>
                <div className="course-meta">
                  <span className="level">
                    {course.level?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  <span className="rating">⭐ {(course.rating || 4.5).toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
          
          {/* Fallback if less than 3 courses available */}
          {courses.length < 3 && [...Array(3 - courses.length)].map((_, i) => (
            <div key={`fallback-course-${i}`} className="course-card large">
              <div className="course-image">
                <span className="badge new">New</span>
                <img src={`https://picsum.photos/seed/course${i}/600/340`} alt="Placeholder" />
                <div className="course-overlay">
                  <span className="overlay-btn">View Course</span>
                </div>
              </div>
              <div className="course-body">
                <h4>Course Coming Soon</h4>
                <p className="course-desc">New courses added weekly. Check back soon!</p>
                <div className="course-meta">
                  <span className="level">Beginner</span>
                  <span className="rating">⭐ 0.0</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="courses-explore">
          <button 
            className="explore-btn" 
            onClick={() => navigate('/list')}
          >
            Explore All Courses →
          </button>
        </div>
      </section>

      {/* Notes Section - DYNAMIC (LIMIT 6) */}
      <section className="notes">
        <h1>Learn deeper with well-structured notes</h1>
        <p className="notes-subtitle">
          High-quality notes created by educators and learners to help you
          revise faster and understand better.
        </p>

        <div className="notes-row">
          {notes.map((note) => (
            <div 
              key={note._id} 
              className="note-card"
              onClick={() => handleNoteClick(note._id)}
              style={{ cursor: 'pointer' }}
            >
              <img 
                src={note.thumbnail ? getImageUrl(note.thumbnail) : "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop"} 
                alt={note.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop";
                }}
              />
              <div className="note-content">
                <h3>{note.title}</h3>
                <p className="note-author">
                  By {note.authorName || note.author?.fullName || 'Community Contributor'}
                </p>
                <p className="note-desc">
                  {note.description?.substring(0, 70)}...
                </p>
              </div>
            </div>
          ))}
          
          {/* Fallback if less than 6 notes available */}
          {notes.length < 6 && [...Array(6 - notes.length)].map((_, i) => (
            <div key={`fallback-note-${i}`} className="note-card">
              <img src={`https://picsum.photos/seed/note${i}/400/220`} alt="Placeholder Note" />
              <div className="note-content">
                <h3>Notes Coming Soon</h3>
                <p className="note-author">By Community Contributor</p>
                <p className="note-desc">
                  Share your notes to help fellow learners. Contribute today!
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="notes-explore">
          <button 
            className="explore-link" 
            onClick={() => navigate('/pdf')}
          >
            Explore All Notes →
          </button>
        </div>
      </section>


      {/* Community Section */}
      <div className="community-section">
        <div className="community-container">
          <div className="community-content">
            <div className="community-badge">
              <i className="fas fa-code-branch"></i>
              <span>Open Source</span>
            </div>
            <h2>Join Our Growing Community</h2>
            <p className="community-subtitle">
              E-Siksha is built by learners, for learners. Contribute your knowledge, 
              share notes, and help shape the future of education.
            </p>
            
            <div className="community-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">
                    {courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0).toLocaleString() || '50,000+'}
                  </span>
                  <span className="stat-label">Active Learners</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{notes.length.toLocaleString() || '10,000+'}</span>
                  <span className="stat-label">Shared Notes</span>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <i className="fas fa-code"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">500+</span>
                  <span className="stat-label">Contributors</span>
                </div>
              </div>
            </div>
            
            <div className="community-actions">
              <button className="action-btn primary" onClick={() => navigate('/add-content/notes')}>
                <i className="fas fa-plus-circle"></i> Share Your Notes
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/add-content/course')}>
                <i className="fas fa-chalkboard-teacher"></i> Create a Course
              </button>
              <button className="action-btn github" onClick={() => window.open('https://github.com/your-repo', '_blank')}>
                <i className="fab fa-github"></i> Contribute on GitHub
              </button>
            </div>
            
            <div className="community-benefits">
              <h3>Why Contribute?</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className="fas fa-heart"></i>
                  </div>
                  <h4>Give Back</h4>
                  <p>Help fellow learners by sharing your knowledge and resources</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className="fas fa-medal"></i>
                  </div>
                  <h4>Get Recognized</h4>
                  <p>Build your reputation as a contributor and educator</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <h4>Improve Platform</h4>
                  <p>Help make E-Siksha better for everyone through open-source contributions</p>
                </div>
                
                <div className="benefit-card">
                  <div className="benefit-icon">
                    <i className="fas fa-network-wired"></i>
                  </div>
                  <h4>Build Network</h4>
                  <p>Connect with like-minded educators and developers</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="community-image">
            <div className="community-illustration">
              <div className="illustration-group">
                <div className="person person-1">
                  <i className="fas fa-user"></i>
                </div>
                <div className="person person-2">
                  <i className="fas fa-user"></i>
                </div>
                <div className="person person-3">
                  <i className="fas fa-user"></i>
                </div>
                <div className="person person-4">
                  <i className="fas fa-user"></i>
                </div>
                <div className="connection-line"></div>
                <div className="connection-line"></div>
                <div className="connection-line"></div>
              </div>
              <div className="illustration-icon">
                <i className="fas fa-exchange-alt"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Section */}
      <div className="why-section">
        <h2>Why choose <span>E Siksha</span>?</h2>
        <p className="why-subtitle">
          We focus on quality learning, practical skills, and accessibility for everyone.
        </p>

        <div className="why-grid">
          <div className="why-card">
            <i className="fas fa-play-circle"></i>
            <h4>High-Quality Video Courses</h4>
            <p>Expert-led courses with clear explanations and real-world examples.</p>
          </div>

          <div className="why-card">
            <i className="fas fa-file-alt"></i>
            <h4>Free & Premium Notes</h4>
            <p>Download structured notes to revise concepts anytime, anywhere.</p>
          </div>

          <div className="why-card">
            <i className="fas fa-chalkboard-teacher"></i>
            <h4>Expert Instructors</h4>
            <p>Learn from experienced teachers and industry professionals.</p>
          </div>

          <div className="why-card">
            <i className="fas fa-laptop-code"></i>
            <h4>Career-Focused Learning</h4>
            <p>Courses designed to improve skills and job readiness.</p>
          </div>

          <div className="why-card">
            <i className="fas fa-clock"></i>
            <h4>Learn at Your Own Pace</h4>
            <p>Lifetime access so you can learn anytime without pressure.</p>
          </div>

          <div className="why-card">
            <i className="fas fa-users"></i>
            <h4>Student-First Platform</h4>
            <p>Built for students, teachers, and lifelong learners.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="github-footer">
           {/* CTA Section */} <div className=' cta'>
      {/* <section className="cta-banner"> */}
        <div className="cta-content">
          <h2>Ready to Start Your Learning Journey?</h2>
          <p>Join over 50,000 students learning on E-Siksha today!</p>
          <div className="cta-buttons">
            <button className="cta-primary" onClick={() => navigate('/reg')}>
              <i className="fas fa-user-plus"></i> Create Free Account
            </button>
            <button className="cta-secondary" onClick={() => navigate('/list')}>
              <i className="fas fa-search"></i> Browse Courses
            </button>
          </div>
          <div className="cta-features">
            <div className="cta-feature">
              <i className="fas fa-graduation-cap"></i>
              <span>Free Courses</span>
            </div>
            <div className="cta-feature">
              <i className="fas fa-certificate"></i>
              <span>Certificates</span>
            </div>
            <div className="cta-feature">
              <i className="fas fa-users"></i>
              <span>Community Support</span>
            </div>
            <div className="cta-feature">
              <i className="fas fa-lock"></i>
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
        </div>
      {/* </section> */}

        <div className="footer-container">
          
</div>
         

        <div className="bottom-footer">
          <div className="footer-left">
            <img 
              src="/img/logo.png" 
              alt="E Siksha" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/150x50/6366f1/ffffff?text=E-Siksha";
              }}
            />
          </div>
          <p>© 2025 E Siksha Inc. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}

export default Home;