import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './css/VideoPlayer.css';
import { getCourse, updateCourseProgress } from './api';

function BuiltInVideoPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef(null);
  const [course, setCourse] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});

  // YouTube regex for extracting video ID
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/;
    const match = url.match(regExp);
    return (match && match[2]) ? match[2] : null;
  };

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  useEffect(() => {
    fetchCourseData();
    loadNotes();
  }, [id]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const response = await getCourse(id);
      
      if (response.success) {
        const courseData = response.course;
        console.log('Fetched course for video player:', courseData);
        
        // Flatten all videos from all modules for easy navigation
        const allVideos = courseData.modules?.flatMap((module, moduleIndex) => 
          module.videos.map(video => ({
            ...video,
            moduleId: module._id || moduleIndex,
            moduleName: module.title,
            moduleIndex
          }))
        ) || [];
        
        setCourse({
          ...courseData,
          allVideos,
          currentVideo: allVideos[0] || null
        });
        
        // Expand first module by default
        if (courseData.modules && courseData.modules.length > 0) {
          setExpandedModules({ [courseData.modules[0]._id || 0]: true });
        }
        
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to load course');
      }
    } catch (err) {
      console.error('Course fetch error:', err);
      setError(err.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = () => {
    try {
      const savedNotes = JSON.parse(localStorage.getItem('videoNotes') || '{}');
      // Get notes for this specific course
      const courseNotes = Object.values(savedNotes).filter(note =>
        note.courseId === id
      );
      setNotes(courseNotes);
    } catch (err) {
      console.error('Load notes error:', err);
      setNotes([]);
    }
  };

  const handleVideoSelect = async (video, globalIndex) => {
    if (!course) return;
    
    // Update current video
    setCourse({
      ...course,
      currentVideo: video
    });
    setCurrentVideoIndex(globalIndex);

    // Update course progress (mark as started)
    try {
      await updateCourseProgress(id, {
        progress: Math.min(100, ((globalIndex + 1) / course.allVideos.length) * 100),
        completed: globalIndex === course.allVideos.length - 1
      });
    } catch (err) {
      console.error('Progress update error:', err);
    }

    // Auto-scroll to selected video
    const videoElement = document.getElementById(`video-${globalIndex}`);
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const saveNote = () => {
    if (!note.trim() || !course) return;
    try {
      const noteId = `${id}-${Date.now()}`;
      const currentVideo = course.currentVideo;
      
      const newNote = {
        id: noteId,
        text: note.trim(),
        date: new Date().toISOString(),
        courseId: id,
        courseTitle: course.title,
        videoTitle: currentVideo.title,
        videoIndex: currentVideoIndex
      };

      // Get existing notes
      const existingNotes = JSON.parse(localStorage.getItem('videoNotes') || '{}');
      
      // Add new note
      existingNotes[noteId] = newNote;
      
      // Save back to localStorage
      localStorage.setItem('videoNotes', JSON.stringify(existingNotes));
      
      // Update state
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setNote('');
      
      alert('Note saved successfully!');
    } catch (err) {
      console.error('Save note error:', err);
      alert('Failed to save note');
    }
  };

  const deleteNote = (noteId) => {
    try {
      const existingNotes = JSON.parse(localStorage.getItem('videoNotes') || '{}');
      delete existingNotes[noteId];
      localStorage.setItem('videoNotes', JSON.stringify(existingNotes));
      
      // Update state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
    } catch (err) {
      console.error('Delete note error:', err);
      alert('Failed to delete note');
    }
  };

  // Loading/ Error handling
  if (loading) {
    return (
      <div className="video-player-wrapper">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading video player...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="video-player-wrapper">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{error || 'Course not found'}</h3>
          <p>{error ? 'Please try again later' : 'The course content could not be loaded.'}</p>
          <button onClick={() => navigate('/list')} className="btn-primary">
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  const currentVideo = course.currentVideo;
  const videoIsYouTube = currentVideo?.url ? isYouTubeUrl(currentVideo.url) : false;
  const ytId = videoIsYouTube ? getYouTubeId(currentVideo.url) : null;

  return (
    <div className="video-player-wrapper">
      {/* Header */}
      <header className="video-header">
        <button className="back-btn" onClick={() => navigate(`/course/${id}`)}>
          ← Back to Course
        </button>
        <h2>{course.title}</h2>
        <div className="header-actions">
          <button
            className="notes-btn"
            onClick={() => setShowNotes(!showNotes)}
          >
            <i className="fas fa-sticky-note"></i> {showNotes ? 'Hide' : 'Notes'}
          </button>
          <button 
            className="download-btn"
            onClick={() => {
              if (videoIsYouTube && ytId) {
                window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
              } else {
                window.open(currentVideo?.url, '_blank');
              }
            }}
          >
            <i className="fas fa-external-link-alt"></i> Open in New Tab
          </button>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="video-content-wrapper">
        {/* Playlist Sidebar */}
        {course.modules && course.modules.length > 0 && (
          <div className="playlist-sidebar">
            <div className="sidebar-header">
              <h3>
                <i className="fas fa-list"></i> Course Playlist
              </h3>
              <span className="video-count">{course.allVideos.length} videos</span>
            </div>
          
            <div className="playlist-list">
              {course.modules.map((module, moduleIndex) => {
                const isExpanded = expandedModules[module._id || moduleIndex];
                const moduleVideos = module.videos || [];
                
                return (
                  <div key={module._id || moduleIndex} className="module-section">
                    {/* Module Header */}
                    <div 
                      className="module-header"
                      onClick={() => toggleModule(module._id || moduleIndex)}
                    >
                      <i className={`fas ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                      <h4>{module.title}</h4>
                      <span className="module-video-count">{moduleVideos.length} videos</span>
                    </div>
                  
                    {/* Module Videos */}
                    {isExpanded && (
                      <div className="module-videos">
                        {moduleVideos.map((video, videoIndex) => {
                          // Find global index
                          const globalIndex = course.allVideos.findIndex(v => 
                            v.url === video.url && v.title === video.title
                          );
                          
                          return (
                            <div
                              key={`${module._id || moduleIndex}-${videoIndex}`}
                              id={`video-${globalIndex}`}
                              className={`playlist-item ${currentVideoIndex === globalIndex ? 'active' : ''}`}
                              onClick={() => handleVideoSelect(course.allVideos[globalIndex], globalIndex)}
                            >
                              <div className="playlist-item-icon">
                                {currentVideoIndex === globalIndex ? (
                                  <i className="fas fa-play-circle"></i>
                                ) : (
                                  <i className="far fa-circle"></i>
                                )}
                              </div>
                              <div className="playlist-item-info">
                                <p className="playlist-item-title">{video.title}</p>
                                {video.duration && (
                                  <span className="playlist-item-duration">{video.duration}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main Video Area */}
        <div className="video-main-content">
          <div className="video-main">
            <div className="video-wrapper">
              {/* YouTube iframe */}
              {videoIsYouTube && ytId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                  title={currentVideo?.title || `${course.title} - Complete Tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="youtube-iframe"
                ></iframe>
              ) : (
                // HTML5 video player
                <video
                  ref={playerRef}
                  src={currentVideo?.url}
                  onError={(e) => {
                    console.error('Video load error:', e);
                    setError('Failed to load video. Please check your connection.');
                  }}
                  className="video-element"
                  controls
                />
              )}
            </div>
        
            <div className="video-info">
              <h3>{currentVideo?.title || course.title}</h3>
              <p className="course-description">{course.description}</p>
            
              {/* Course Details Below Description */}
              <div className="course-details">
                <div className="detail-item">
                  <i className="fas fa-clock"></i>
                  <span><strong>Duration:</strong> {currentVideo?.duration || course.duration}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-signal"></i>
                  <span><strong>Level:</strong> {course.level}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-user"></i>
                  <span><strong>Instructor:</strong> {course.instructorName}</span>
                </div>
                <div className="detail-item">
                  <i className="fas fa-tag"></i>
                  <span><strong>Category:</strong> {course.category}</span>
                </div>
              </div>

              {error && (
                <p className="video-error">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Panel - Fixed and Always Visible when opened */}
      {showNotes && (
        <div className="notes-panel active">
          <div className="notes-header">
            <h3>My Notes</h3>
            <button 
              className="close-notes" 
              onClick={() => setShowNotes(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        
          <div className="notes-content">
            <div className="notes-input-section">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your notes here..."
                className="notes-textarea"
                rows="6"
              />
            
              <div className="notes-actions">
                <button className="save-note" onClick={saveNote}>
                  <i className="fas fa-save"></i> Save Note
                </button>
                <button className="clear-note" onClick={() => setNote('')}>
                  Clear
                </button>
              </div>
            </div>
          
            <div className="saved-notes">
              <h4>Saved Notes ({notes.length})</h4>
              {notes.length > 0 ? (
                notes.map((noteItem) => (
                  <div key={noteItem.id} className="note-item">
                    <p>{noteItem.text}</p>
                    <div className="note-footer">
                      <span className="note-time">
                        {new Date(noteItem.date).toLocaleDateString()} at {new Date(noteItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="note-video">{noteItem.videoTitle}</span>
                      <button 
                        className="delete-note-btn"
                        onClick={() => deleteNote(noteItem.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-notes">No notes saved yet. Start typing above!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuiltInVideoPlayer;