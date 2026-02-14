import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Pdf.css';
import Navbar from './Navbar';

function Pdf() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Fetch notes from backend API
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/notes');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Fetched notes:', data.notes);
        setNotes(data.notes || []);
      } else {
        setError(data.message || 'Failed to fetch notes');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.message || 'Failed to load notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

 const handleViewPDF = (note) => {
  // Navigate to the PDF viewer page with note ID
  navigate(`/pdf/viewer/${note._id}`);
};

  const handleContribute = () => {
    navigate('/add-content/notes');
  };

  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => {
    const matchesSearch = searchTerm === '' || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || 
      note.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(notes.map(note => note.category).filter(Boolean))].sort();

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid date';
    }
  };

  // Calculate total downloads
  const totalDownloads = notes.reduce((total, note) => total + (note.downloads || 0), 0);

  // Get total contributors
  const totalContributors = new Set(notes.map(note => note.author?._id || note.authorName)).size;

  return (
    <div className="pdf-page">
      
      <Navbar />
     
      {/* Hero Section */}
      <section className="hero">
        <h1>PDF Library & Study Materials</h1>
        <p>Access thousands of PDFs, notes, and study resources for all your courses</p>
      </section>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading notes from database...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>Error Loading Notes</h3>
          <p>{error}</p>
          <button onClick={fetchNotes} className="retry-btn">
            <i className="fas fa-redo"></i> Try Again
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="pdf-container">
        {/* Stats Bar */}
        {!loading && !error && (
          <div className="stats-bar">
            <div className="stat-item">
              <i className="fas fa-book"></i>
              <span className="stat-number">{notes.length}</span>
              <span className="stat-label">Total Notes</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-download"></i>
              <span className="stat-number">{totalDownloads}</span>
              <span className="stat-label">Total Downloads</span>
            </div>
            <div className="stat-item">
              <i className="fas fa-users"></i>
              <span className="stat-number">{totalContributors}</span>
              <span className="stat-label">Contributors</span>
            </div>
          </div>
        )}

        {/* Filter/Search Bar */}
        {!loading && !error && notes.length > 0 && (
          <div className="filter-bar">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search notes by title, description, or tags..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filter">
              <select 
                value={categoryFilter} 
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Notes Grid */}
        {!loading && !error && (
          <>
            {filteredNotes.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-file-alt"></i>
                <h3>
                  {notes.length === 0 
                    ? "No Notes Available in Database" 
                    : "No Notes Match Your Search"}
                </h3>
                <p>
                  {notes.length === 0 
                    ? "Be the first to share your study materials!" 
                    : "Try a different search or category filter"}
                </p>
                <button onClick={handleContribute} className="contribute-btn">
                  <i className="fas fa-plus-circle"></i> Share Your Notes
                </button>
              </div>
            ) : (
              <div className="pdf-grid">
                {filteredNotes.map((note) => (
                  <div 
                    key={note._id}
                    className="pdf-card"
                    onClick={() => handleViewPDF(note)}
                  >
                 {/* In Pdf.js, update the card image section */}
<div className="pdf-card-image">
  {note.thumbnail ? (
    <img 
      src={`http://localhost:5000${note.thumbnail}`} 
      alt={note.title}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop";
      }}
    />
  ) : (
    <div className="pdf-default-thumbnail">
      <i className="fas fa-file-pdf"></i>
    </div>
  )}
  {note.isFree && (
    <span className="free-badge">FREE</span>
  )}

</div>

                    <div className="pdf-card-header">
                      <span className="pdf-category">{note.category || 'Uncategorized'}</span>
                      <span className="pdf-downloads">
                        <i className="fas fa-download"></i> {note.downloads || 0}
                      </span>
                    </div>

                    <div className="pdf-card-body">
                      <h3 className="pdf-title">{note.title}</h3>
                      <p className="pdf-desc">
                        {note.description || 'No description available'}
                      </p>
                      
                      <div className="pdf-meta">
                        <div className="meta-item">
                          <i className="fas fa-user"></i>
                          <span>{note.authorName || note.author?.fullName || 'Unknown Author'}</span>
                        </div>
                        <div className="meta-item">
                          <i className="fas fa-calendar"></i>
                          <span>{formatDate(note.createdAt)}</span>
                        </div>
                        {note.pages && note.pages > 0 && (
                          <div className="meta-item">
                            <i className="fas fa-file"></i>
                            <span>{note.pages} pages</span>
                          </div>
                        )}
                      </div>

                      {note.tags && note.tags.length > 0 && (
                        <div className="pdf-tags">
                          {note.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                          {note.tags.length > 3 && (
                            <span className="tag">+{note.tags.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {note.rating > 0 && (
                        <div className="pdf-rating">
                          <div className="stars">
                            {[...Array(5)].map((_, i) => (
                              <i 
                                key={i} 
                                className={`fas fa-star ${i < Math.floor(note.rating) ? 'active' : ''}`}
                              ></i>
                            ))}
                          </div>
                          <span className="rating-text">{note.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    <div className="pdf-card-footer">
    <button 
      className="pdf-btn view-btn"
      onClick={(e) => {
        e.stopPropagation();
        handleViewPDF(note); // Navigate to viewer
      }}
    >
      <i className="fas fa-eye"></i> View
    </button>
    
    {note.externalUrl && (
      <button 
        className="pdf-btn download-btn"
        onClick={(e) => {
          e.stopPropagation();
          window.open(note.externalUrl, '_blank'); // Direct download
        }}
      >
        <i className="fas fa-download"></i> Download
      </button>
    )}
  </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Contribute Section */}
      {!loading && !error && (
        <section className="contribute-section">
          <div className="contribute-container">
            <div className="contribute-content">
              <div className="contribute-icon">
                <i className="fas fa-hand-holding-heart"></i>
              </div>
              <h2>Contribute to E-Siksha</h2>
              <p>Share your notes and study materials with fellow learners. Help build a comprehensive library of educational resources for everyone.</p>
              <div className="contribute-stats">
                <div className="stat">
                  <h3>{notes.filter(n => n.status === 'published').length}</h3>
                  <p>Published Notes</p>
                </div>
                <div className="stat">
                  <h3>{totalDownloads}</h3>
                  <p>Total Downloads</p>
                </div>
              </div>
              <button className="contribute-btn" onClick={handleContribute}>
                <i className="fas fa-plus-circle"></i> Share Your Notes
              </button>
            </div>
            <div className="contribute-image">
              <img src="https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&auto=format&fit=crop" alt="Contribute" />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer>
        <div className="copyright">
          <p>© 2025 E Siksha. All rights reserved.</p>
          {!loading && !error && (
            <p className="db-info">
              <i className="fas fa-database"></i> Connected to MongoDB: {notes.length} notes loaded from database
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}

export default Pdf;