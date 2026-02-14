import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/GoogleDrivePDFViewer.css';
import Navbar from './Navbar';
import { getNote } from './api';

function GoogleDrivePDFViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [embedError, setEmbedError] = useState(false);

  useEffect(() => {
    fetchNoteData();
  }, [id]);

  const fetchNoteData = async () => {
    try {
      setLoading(true);
      const response = await getNote(id);
      
      if (response.success) {
        const noteData = response.note;
        console.log('Fetched note:', noteData);
        console.log('Google Drive Link:', noteData.googleDriveLink);
        
        // Convert Google Drive view link to embed URL
        // Use googleDriveLink field (not externalUrl)
        let embedUrl = null;
        if (noteData.googleDriveLink) {
          const googleDriveId = extractGoogleDriveId(noteData.googleDriveLink);
          console.log('Extracted Google Drive ID:', googleDriveId);
          
          if (googleDriveId) {
            embedUrl = `https://drive.google.com/file/d/${googleDriveId}/preview`;
            console.log('Generated embed URL:', embedUrl);
          }
        }
        
        setNote({
          ...noteData,
          embedUrl
        });
      } else {
        throw new Error(response.message || 'Failed to load note');
      }
    } catch (err) {
      console.error('Error fetching note:', err);
      setError(err.message || 'Failed to load PDF');
    } finally {
      setLoading(false);
    }
  };

  const extractGoogleDriveId = (url) => {
    if (!url) return null;
    
    // Decode URL in case it's encoded
    url = decodeURIComponent(url);
    
    // Handle different Google Drive URL formats
    const patterns = [
      /\/file\/d\/([a-zA-Z0-9_-]+)/,           // https://drive.google.com/file/d/FILE_ID/view
      /open\?id=([a-zA-Z0-9_-]+)/,             // https://drive.google.com/open?id=FILE_ID
      /[\?&]id=([a-zA-Z0-9_-]+)/,              // Any id parameter
      /([a-zA-Z0-9_-]{25,})/                   // Direct file ID (25+ chars)
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const handleDownload = () => {
    if (note && note.googleDriveLink) {
      window.open(note.googleDriveLink, '_blank');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleIframeError = (e) => {
    console.error('Iframe failed to load');
    setEmbedError(true);
    e.target.style.display = 'none';
  };

  // Loading State
  if (loading) {
    return (
      <div className="pdf-viewer-container">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading PDF...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !note) {
    return (
      <div className="pdf-viewer-container">
        <Navbar />
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{error || 'PDF Not Found'}</h3>
          <p>{error ? 'Please try again later' : 'The PDF content could not be loaded.'}</p>
          <button onClick={() => navigate('/pdf')} className="back-btn">
            <i className="fas fa-arrow-left"></i> Back to PDF Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-container">
      <Navbar />
      
      <div className="pdf-viewer-wrapper">
        {/* Sidebar with Header Content */}
        <div className="pdf-sidebar">
          <button className="back-btn" onClick={() => navigate('/pdf')}>
            <i className="fas fa-arrow-left"></i> Back to Library
          </button>
          
          <div className="sidebar-card">
            <div className="thumbnail-container">
              {note.thumbnail ? (
                <img 
                  src={note.thumbnail.startsWith('http') ? note.thumbnail : `http://localhost:5000${note.thumbnail}`} 
                  alt={note.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=400&auto=format&fit=crop";
                  }}
                />
              ) : (
                <div className="placeholder-thumbnail">
                  <i className="fas fa-file-pdf"></i>
                </div>
              )}
            </div>
          
            <div className="info-section">
              <h3>{note.title}</h3>
              <div className="author">
                By {note.authorName || note.author?.fullName || 'Unknown Author'}
              </div>
              <p className="description">{note.description || 'No description available'}</p>
            </div>

            <div className="meta-section">
              <div className="meta-item">
                <i className="fas fa-folder"></i>
                <div>
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{note.category}</span>
                </div>
              </div>
            
              <div className="meta-item">
                <i className="fas fa-calendar"></i>
                <div>
                  <span className="meta-label">Uploaded</span>
                  <span className="meta-value">
                    {new Date(note.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            
              {note.pages && note.pages > 0 && (
                <div className="meta-item">
                  <i className="fas fa-file"></i>
                  <div>
                    <span className="meta-label">Pages</span>
                    <span className="meta-value">{note.pages} pages</span>
                  </div>
                </div>
              )}
            
              <div className="meta-item">
                <i className="fas fa-download"></i>
                <div>
                  <span className="meta-label">Downloads</span>
                  <span className="meta-value">{note.downloads || 0}</span>
                </div>
              </div>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="tags-section">
                <span className="meta-label">Tags</span>
                <div className="pdf-tags">
                  {note.tags.map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="sidebar-footer">
              {note.embedUrl && !embedError && (
                <button 
                  className="action-btn full-screen-btn" 
                  onClick={() => window.open(note.embedUrl, '_blank')}
                >
                  <i className="fas fa-expand"></i> Full Screen
                </button>
              )}
              
              <button className="action-btn" onClick={handlePrint}>
                <i className="fas fa-print"></i> Print
              </button>
              
              <button className="action-btn primary" onClick={handleDownload}>
                <i className="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        </div>

        {/* PDF Viewer - Right Side */}
        <div className="pdf-main">
          <div className="pdf-viewer">
            {note.embedUrl && !embedError ? (
              <iframe
                src={note.embedUrl}
                title={note.title}
                className="google-drive-iframe"
                allow="autoplay"
                allowFullScreen
                onError={handleIframeError}
              ></iframe>
            ) : note.googleDriveLink ? (
              <div className="no-pdf-available">
                <i className="fas fa-file-pdf"></i>
                <h3>PDF Preview Not Available</h3>
                <p>This PDF cannot be previewed. Please download to view.</p>
                <div className="fallback-buttons">
                  <button 
                    className="action-btn secondary" 
                    onClick={() => window.open(note.googleDriveLink, '_blank')}
                  >
                    <i className="fas fa-external-link-alt"></i> Open in Browser
                  </button>
                  <button className="action-btn primary" onClick={handleDownload}>
                    <i className="fas fa-download"></i> Download PDF
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-pdf-available">
                <i className="fas fa-exclamation-triangle"></i>
                <h3>No PDF Available</h3>
                <p>This note doesn't have an associated PDF file.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GoogleDrivePDFViewer;