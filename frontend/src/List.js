import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/List.css';
import Navbar from './Navbar';
import { getCourses } from './api';

function List() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');

  // Fetch courses from backend API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getCourses();
      
      if (response.success) {
        console.log('Fetched courses:', response.courses);
        setCourses(response.courses || []);
      } else {
        setError(response.message || 'Failed to fetch courses');
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err.message || 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleContribute = () => {
    navigate('/add-content/course');
  };

  // Filter courses based on search and filters
  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' ||
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || course.category === categoryFilter;
    const matchesLevel = levelFilter === '' || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and levels for filter dropdowns
  const categories = [...new Set(courses.map(course => course.category).filter(Boolean))].sort();
  const levels = [...new Set(courses.map(course => course.level).filter(Boolean))].sort();

  // Get badge based on course properties
  const getBadge = (course) => {
    if (course.isFree) return 'free';
    if (course.studentsEnrolled > 10000) return 'popular';
    return 'new';
  };

  return (
    <div className="list-wrapper">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <h1>Explore Our Courses</h1>
        <p>Discover {courses.length}+ high-quality courses taught by industry experts. Start learning today!</p>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading courses from database...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Courses</h3>
          <p>{error}</p>
          <button onClick={fetchCourses} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-container">
        {!loading && !error && courses.length > 0 && (
          <div className="filter-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search courses by title, description, or tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select 
                value={levelFilter} 
                onChange={(e) => setLevelFilter(e.target.value)}
              >
                <option value="">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <main className="course-listing">
          <div className="course-grid">
            {filteredCourses.length === 0 && !loading ? (
              <div className="empty-state">
                <i className="fas fa-graduation-cap"></i>
                <h3>
                  {courses.length === 0 
                    ? "No Courses Available" 
                    : "No Courses Match Your Search"}
                </h3>
                <p>
                  {courses.length === 0 
                    ? "Check back soon for new courses!" 
                    : "Try a different search or filter"}
                </p>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div key={course._id} className="course-card">
                  <div className="course-image">
                    <img 
                      src={course.thumbnail?.startsWith('http') 
                        ? course.thumbnail 
                        : `http://localhost:5000${course.thumbnail}`} 
                      alt={course.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop";
                      }}
                    />
                    {getBadge(course) && (
                      <div className={`badge ${getBadge(course)}`}>
                        {getBadge(course).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="course-content">
                    <div className="course-category">{course.category}</div>
                    <h3 className="course-title">{course.title}</h3>

                    <p className="course-description">
                      {course.description}
                    </p>

                    <div className="course-meta">
                      <div className="meta-item">
                        <i className="fas fa-clock"></i>
                        <span>{course.duration || '10 hours'}</span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-chart-line"></i>
                        <span>
                          {course.level?.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </div>
                      <div className="meta-item">
                        <i className="fas fa-layer-group"></i>
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                    </div>

                    <div className="course-footer">
                      <div className="instructor">
                        <i className="fas fa-user"></i>
                        <span>{course.instructorName || 'Instructor'}</span>
                      </div>
                      <button 
                        className="view-btn"
                        onClick={() => handleViewDetails(course._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Contribute Section */}
      {!loading && !error && (
        <section className="contribute-section">
          <div className="contribute-container">
            <div className="contribute-content">
              <div className="contribute-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </div>
              <h2>Become an Instructor</h2>
              <p>Share your knowledge and expertise with thousands of learners. Create courses, tutorials, and help shape the future of education.</p>
              <div className="contribute-stats">
                <div className="stat-item">
                  <i className="fas fa-graduation-cap"></i>
                  <span>{courses.length}+</span>
                  <p>Courses Available</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-star"></i>
                  <span>{(courses.reduce((avg, c) => avg + (c.rating || 4.5), 0) / courses.length || 4.8).toFixed(1)}/5</span>
                  <p>Average Rating</p>
                </div>
                <div className="stat-item">
                  <i className="fas fa-globe"></i>
                  <span>Global</span>
                  <p>Community</p>
                </div>
              </div>
              <button className="contribute-btn" onClick={handleContribute}>
                <i className="fas fa-plus-circle"></i> Create a Course
              </button>
            </div>
            <div className="contribute-image">
              <img src="https://images.unsplash.com/photo-1659301254614-8d6a9d46f26a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Teach" />
            </div>
          </div>
        </section>
      )}

      <footer className="login-footer">
        <div className="footer-content">
          <p>© 2025 E Siksha. All rights reserved.</p>
          {!loading && !error && (
            <p className="db-info">
              <i className="fas fa-database"></i> Connected to MongoDB: {courses.length} courses loaded
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default List;