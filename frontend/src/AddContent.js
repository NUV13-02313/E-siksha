import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './css/AddContent.css';
import Navbar from './Navbar';
import { submitCourse, submitNotes } from './api';

function AddContent() {
  const navigate = useNavigate();
  const { type } = useParams(); // Get 'course' or 'notes' from URL
  
  // Set initial content type based on route parameter
  const [contentType, setContentType] = useState(type || 'course');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    isFree: true,
    price: '',
    youtubeLink: '',
    googleDriveLink: '', // Changed from pdfFile to googleDriveLink
    thumbnail: null,
    thumbnailUrl: '', // Added for thumbnail URL option
    thumbnailOption: 'upload', // 'upload' or 'url'
    author: '', // Added for notes
    pages: '', // Added for notes
    uploadDate: new Date().toISOString().split('T')[0], // Added for notes
    modules: [{ title: '', videos: [{ title: '', url: '' }] }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsAuthenticated(true);
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      // Set author name from user data if available
      setFormData(prev => ({
        ...prev,
        author: parsedUser?.fullName || ''
      }));
    } else {
      alert('Please login to submit content');
      navigate('/login');
    }
  }, [navigate]);

  // Update content type when route changes
  useEffect(() => {
    if (type) {
      setContentType(type);
    }
  }, [type]);

  const handleChange = (e) => {
    const { name, value, files, type: inputType, checked } = e.target;
    if (inputType === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleThumbnailOptionChange = (option) => {
    setFormData(prev => ({ ...prev, thumbnailOption: option }));
  };

  const handleModuleChange = (index, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setFormData(prev => ({ ...prev, modules: updatedModules }));
  };

  const handleVideoChange = (moduleIndex, videoIndex, field, value) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos[videoIndex] = {
      ...updatedModules[moduleIndex].videos[videoIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, modules: updatedModules }));
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', videos: [{ title: '', url: '' }] }]
    }));
  };

  const addVideo = (moduleIndex) => {
    const updatedModules = [...formData.modules];
    updatedModules[moduleIndex].videos.push({ title: '', url: '' });
    setFormData(prev => ({ ...prev, modules: updatedModules }));
  };

  // Validate Google Drive link
  const validateGoogleDriveLink = (link) => {
    // Check if it's a valid Google Drive link
    const driveRegex = /(https?:\/\/)?(www\.)?(drive\.google\.com)\/(file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    return driveRegex.test(link);
  };

  // Validate URL
  const isValidUrl = (urlString) => {
    try {
      const url = new URL(urlString);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // Validate Google Drive link for notes
      if (contentType === 'notes' && formData.googleDriveLink) {
        if (!validateGoogleDriveLink(formData.googleDriveLink)) {
          setError('Please enter a valid Google Drive link for the PDF file.');
          setLoading(false);
          return;
        }
      }

      // Validate thumbnail URL if using URL option
      if (formData.thumbnailOption === 'url' && formData.thumbnailUrl) {
        if (!isValidUrl(formData.thumbnailUrl)) {
          setError('Please enter a valid URL for the thumbnail image.');
          setLoading(false);
          return;
        }
      }

      // Prepare data based on content type
      let submissionData;

      if (contentType === 'course') {
        // Validate required fields
        if (!formData.title || !formData.description || !formData.category) {
          throw new Error('Please fill in all required fields');
        }

        // Validate thumbnail for course (required)
        if (formData.thumbnailOption === 'upload' && !formData.thumbnail) {
          throw new Error('Course thumbnail is required');
        }
        
        if (formData.thumbnailOption === 'url' && !formData.thumbnailUrl) {
          throw new Error('Course thumbnail URL is required');
        }

        // Create FormData
        submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('category', formData.category);
        submissionData.append('isFree', formData.isFree.toString());
        submissionData.append('price', formData.isFree ? '0' : formData.price || '0');
        
        if (formData.tags) {
          submissionData.append('tags', formData.tags);
        }
        
        // Add thumbnail based on selected option
        if (formData.thumbnailOption === 'upload' && formData.thumbnail) {
          submissionData.append('thumbnail', formData.thumbnail);
        } else if (formData.thumbnailOption === 'url' && formData.thumbnailUrl) {
          submissionData.append('thumbnailUrl', formData.thumbnailUrl);
        }

        // Add modules as JSON string
        const modulesData = formData.modules.map(module => ({
          title: module.title,
          videos: module.videos.map(video => ({
            title: video.title,
            url: video.url,
            duration: '10:00',
            isPreview: false
          }))
        }));
        
        submissionData.append('modules', JSON.stringify(modulesData));

        // Submit to backend
        console.log('Submitting course data...');
        const response = await submitCourse(submissionData);
        console.log('Course submission response:', response);
        
        if (response.success) {
          setSuccess(true);
          setLoading(false);
          resetForm();
          alert('Course submitted successfully!');
          setTimeout(() => navigate('/list'), 2000);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
        
      } else if (contentType === 'notes') {
        // Validate required fields for notes
        if (!formData.title || !formData.category || !formData.googleDriveLink) {
          throw new Error('Please fill in all required fields');
        }

        // Create FormData for notes
        submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description || '');
        submissionData.append('category', formData.category);
        submissionData.append('tags', formData.tags || '');
        submissionData.append('pages', formData.pages || '0');
        submissionData.append('author', formData.author);
        submissionData.append('isFree', 'true');
        submissionData.append('uploadDate', formData.uploadDate);
        
        // These are the critical fields for Google Drive link
        submissionData.append('contentType', 'link'); // Required by server
        submissionData.append('externalUrl', formData.googleDriveLink); // Required by server
        submissionData.append('urlType', 'google-drive'); // Required by server

        // Add thumbnail based on selected option
        if (formData.thumbnailOption === 'upload' && formData.thumbnail) {
          submissionData.append('thumbnail', formData.thumbnail);
        } else if (formData.thumbnailOption === 'url' && formData.thumbnailUrl) {
          submissionData.append('thumbnail', formData.thumbnailUrl);
        }

        // Submit to backend
        console.log('Submitting notes data...');
        // Debug: Log FormData contents
        for (let pair of submissionData.entries()) {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
        const response = await submitNotes(submissionData);
        console.log('Notes submission response:', response);
        
        if (response.success) {
          setSuccess(true);
          setLoading(false);
          resetForm();
          alert('Notes submitted successfully!');
          setTimeout(() => navigate('/pdf'), 2000);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
      } else if (contentType === 'tutorial') {
        // Validate required fields for tutorial
        if (!formData.title || !formData.description || !formData.youtubeLink || !formData.category) {
          throw new Error('Please fill in all required fields for tutorial');
        }

        // For tutorial, we'll treat it as a single-module course
        submissionData = new FormData();
        submissionData.append('title', formData.title);
        submissionData.append('description', formData.description);
        submissionData.append('category', formData.category);
        submissionData.append('isFree', 'true');
        submissionData.append('price', '0');
        
        if (formData.tags) {
          submissionData.append('tags', formData.tags);
        }
        
        // Add thumbnail for tutorial based on selected option
        if (formData.thumbnailOption === 'upload' && formData.thumbnail) {
          submissionData.append('thumbnail', formData.thumbnail);
        } else if (formData.thumbnailOption === 'url' && formData.thumbnailUrl) {
          submissionData.append('thumbnailUrl', formData.thumbnailUrl);
        }

        // Create a single module with the YouTube video
        const modulesData = [{
          title: 'Main Tutorial',
          videos: [{
            title: formData.title,
            url: formData.youtubeLink,
            duration: '10:00',
            isPreview: false
          }]
        }];
        
        submissionData.append('modules', JSON.stringify(modulesData));

        // Submit as a course (since tutorial is essentially a single-video course)
        console.log('Submitting tutorial data...');
        const response = await submitCourse(submissionData);
        console.log('Tutorial submission response:', response);
        
        if (response.success) {
          setSuccess(true);
          setLoading(false);
          resetForm();
          alert('Tutorial submitted successfully!');
          setTimeout(() => navigate('/list'), 2000);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit content. Please try again.');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      isFree: true,
      price: '',
      youtubeLink: '',
      googleDriveLink: '',
      thumbnail: null,
      thumbnailUrl: '',
      thumbnailOption: 'upload',
      author: user?.fullName || '',
      pages: '',
      uploadDate: new Date().toISOString().split('T')[0],
      modules: [{ title: '', videos: [{ title: '', url: '' }] }]
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="add-content-wrapper">
      <Navbar />
      
      <div className="content-header">
        <h1>
          {contentType === 'course' ? 'Create a New Course' : 
           contentType === 'notes' ? 'Share Your Notes' : 'Create a Tutorial'}
        </h1>
        <p>
          {contentType === 'course' ? 'Submit a course to help others learn and grow' : 
           contentType === 'notes' ? 'Upload your study materials and notes to share with the community' : 
           'Share your knowledge through video tutorials'}
        </p>
      
        {/* Show type selector only if not coming from specific route */}
        {!type && (
          <div className="content-type-selector">
            <button 
              className={`type-btn ${contentType === 'course' ? 'active' : ''}`}
              onClick={() => setContentType('course')}
              disabled={loading}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              <span>Course</span>
            </button>
            <button 
              className={`type-btn ${contentType === 'notes' ? 'active' : ''}`}
              onClick={() => setContentType('notes')}
              disabled={loading}
            >
              <i className="fas fa-file-alt"></i>
              <span>Notes</span>
            </button>
            <button 
              className={`type-btn ${contentType === 'tutorial' ? 'active' : ''}`}
              onClick={() => setContentType('tutorial')}
              disabled={loading}
            >
              <i className="fas fa-video"></i>
              <span>Tutorial</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <i className="fas fa-check-circle"></i>
          <span>Submission successful! Redirecting...</span>
        </div>
      )}

      <form className="content-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={contentType === 'course' ? 'e.g., Complete React Course 2024' : 'e.g., JavaScript Complete Reference Guide'}
                required
                disabled={loading}
              />
            </div>
          
            <div className="form-group">
              <label>Category *</label>
              <select name="category" value={formData.category} onChange={handleChange} required disabled={loading}>
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Data Science">Data Science</option>
                <option value="Programming">Programming</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Business">Business</option>
                <option value="AI/ML">AI/ML</option>
                <option value="Cloud Computing">Cloud Computing</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Blockchain">Blockchain</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={contentType === 'course' ? 'Describe what learners will achieve from this course...' : 'Describe the content and purpose of these notes...'}
              rows="4"
              required
              disabled={loading}
            />
          </div>

          {contentType === 'notes' && (
            <div className="form-group">
              <label>Author *</label>
              <input 
                type="text" 
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="Your name"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input 
              type="text" 
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., react, javascript, frontend, hooks"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Content Details</h3>
        
          {contentType === 'course' && (
            <>
              <div className="form-group">
                <label>Course Thumbnail *</label>
                <div className="thumbnail-options">
                  <div className="option-buttons">
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'upload' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('upload')}
                      disabled={loading}
                    >
                      <i className="fas fa-upload"></i> Upload Image
                    </button>
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'url' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('url')}
                      disabled={loading}
                    >
                      <i className="fas fa-link"></i> Use Image URL
                    </button>
                  </div>

                  {formData.thumbnailOption === 'upload' ? (
                    <div className="file-upload-area">
                      <input 
                        type="file" 
                        id="thumbnail"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleChange}
                        hidden
                        disabled={loading}
                      />
                      <label htmlFor="thumbnail" className="upload-label">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Click to upload thumbnail image</span>
                        <p>Recommended: 1280x720px (16:9 ratio)</p>
                      </label>
                      {formData.thumbnail && (
                        <div className="preview-image">
                          <img src={URL.createObjectURL(formData.thumbnail)} alt="Preview" />
                          <span>{formData.thumbnail.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="url-input-area">
                      <input 
                        type="url" 
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="url-input"
                        required
                        disabled={loading}
                      />
                      <p className="help-text">
                        <i className="fas fa-info-circle"></i> Enter direct URL to an image (JPG, PNG, etc.)
                      </p>
                      {formData.thumbnailUrl && (
                        <div className="preview-image">
                          <img src={formData.thumbnailUrl} alt="Preview" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.textContent = 'Unable to load image from URL';
                            }}
                          />
                          <span>Image from URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="pricing-section">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    name="isFree"
                    checked={formData.isFree}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>This is a free course</span>
                </label>
              
                {!formData.isFree && (
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input 
                      type="number" 
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="Enter price in INR"
                      min="0"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>

              <div className="modules-section">
                <h4>Course Modules</h4>
                {formData.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className="module-card">
                    <div className="module-header">
                      <input 
                        type="text"
                        value={module.title}
                        onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                        placeholder="Module title (e.g., Introduction to React)"
                        className="module-title"
                        disabled={loading}
                      />
                    </div>
                  
                    <div className="videos-list">
                      {module.videos.map((video, videoIndex) => (
                        <div key={videoIndex} className="video-item">
                          <input 
                            type="text"
                            value={video.title}
                            onChange={(e) => handleVideoChange(moduleIndex, videoIndex, 'title', e.target.value)}
                            placeholder="Video title"
                            className="video-title"
                            disabled={loading}
                          />
                          <input 
                            type="url"
                            value={video.url}
                            onChange={(e) => handleVideoChange(moduleIndex, videoIndex, 'url', e.target.value)}
                            placeholder="YouTube/Vimeo URL"
                            className="video-url"
                            disabled={loading}
                          />
                        </div>
                      ))}
                      <button 
                        type="button" 
                        className="add-video-btn"
                        onClick={() => addVideo(moduleIndex)}
                        disabled={loading}
                      >
                        <i className="fas fa-plus"></i> Add Video
                      </button>
                    </div>
                  </div>
                ))}
              
                <button type="button" className="add-module-btn" onClick={addModule} disabled={loading}>
                  <i className="fas fa-plus-circle"></i> Add Another Module
                </button>
              </div>
            </>
          )}

          {contentType === 'notes' && (
            <>
              <div className="form-group">
                <label>Number of Pages</label>
                <input 
                  type="number" 
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  placeholder="e.g., 150"
                  min="1"
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Google Drive PDF Link *</label>
                <div className="link-input-area">
                  <input 
                    type="url" 
                    name="googleDriveLink"
                    value={formData.googleDriveLink}
                    onChange={handleChange}
                    placeholder="https://drive.google.com/file/d/YOUR_FILE_ID/view?usp=drive_link"
                    required
                    className="google-drive-input"
                    disabled={loading}
                  />
                  <p className="help-text">
                    <i className="fas fa-info-circle"></i> Make sure the Google Drive link is set to "Anyone with the link can view"
                  </p>
                  <div className="link-example">
                    <p><strong>Example format:</strong></p>
                    <code>https://drive.google.com/file/d/1ABC123xyz.../view?usp=drive_link</code>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Thumbnail Image (Optional)</label>
              
                <div className="thumbnail-options">
                  <div className="option-buttons">
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'upload' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('upload')}
                      disabled={loading}
                    >
                      <i className="fas fa-upload"></i> Upload Image
                    </button>
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'url' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('url')}
                      disabled={loading}
                    >
                      <i className="fas fa-link"></i> Use Image URL
                    </button>
                  </div>

                  {formData.thumbnailOption === 'upload' ? (
                    <div className="file-upload-area">
                      <input 
                        type="file" 
                        id="noteThumbnail"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleChange}
                        hidden
                        disabled={loading}
                      />
                      <label htmlFor="noteThumbnail" className="upload-label">
                        <i className="fas fa-image"></i>
                        <span>Click to upload thumbnail</span>
                        <p>Recommended: 300x200px or 16:9 ratio</p>
                      </label>
                      {formData.thumbnail && (
                        <div className="preview-image">
                          <img src={URL.createObjectURL(formData.thumbnail)} alt="Preview" />
                          <span>{formData.thumbnail.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="url-input-area">
                      <input 
                        type="url" 
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="url-input"
                        disabled={loading}
                      />
                      <p className="help-text">
                        <i className="fas fa-info-circle"></i> Enter direct URL to an image (JPG, PNG, etc.)
                      </p>
                      {formData.thumbnailUrl && (
                        <div className="preview-image">
                          <img src={formData.thumbnailUrl} alt="Preview" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.textContent = 'Unable to load image from URL';
                            }}
                          />
                          <span>Image from URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {contentType === 'tutorial' && (
            <>
              <div className="form-group">
                <label>YouTube Video URL *</label>
                <input 
                  type="url" 
                  name="youtubeLink"
                  value={formData.youtubeLink}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                  disabled={loading}
                />
                <p className="help-text">Make sure the video is publicly accessible</p>
              </div>

              <div className="form-group">
                <label>Tutorial Thumbnail (Optional)</label>
                <div className="thumbnail-options">
                  <div className="option-buttons">
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'upload' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('upload')}
                      disabled={loading}
                    >
                      <i className="fas fa-upload"></i> Upload Image
                    </button>
                    <button 
                      type="button"
                      className={`option-btn ${formData.thumbnailOption === 'url' ? 'active' : ''}`}
                      onClick={() => handleThumbnailOptionChange('url')}
                      disabled={loading}
                    >
                      <i className="fas fa-link"></i> Use Image URL
                    </button>
                  </div>

                  {formData.thumbnailOption === 'upload' ? (
                    <div className="file-upload-area">
                      <input 
                        type="file" 
                        id="tutorialThumbnail"
                        name="thumbnail"
                        accept="image/*"
                        onChange={handleChange}
                        hidden
                        disabled={loading}
                      />
                      <label htmlFor="tutorialThumbnail" className="upload-label">
                        <i className="fas fa-image"></i>
                        <span>Click to upload thumbnail</span>
                        <p>Recommended: 1280x720px</p>
                      </label>
                      {formData.thumbnail && (
                        <div className="preview-image">
                          <img src={URL.createObjectURL(formData.thumbnail)} alt="Preview" />
                          <span>{formData.thumbnail.name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="url-input-area">
                      <input 
                        type="url" 
                        name="thumbnailUrl"
                        value={formData.thumbnailUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="url-input"
                        disabled={loading}
                      />
                      <p className="help-text">
                        <i className="fas fa-info-circle"></i> Enter direct URL to an image (JPG, PNG, etc.)
                      </p>
                      {formData.thumbnailUrl && (
                        <div className="preview-image">
                          <img src={formData.thumbnailUrl} alt="Preview" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.textContent = 'Unable to load image from URL';
                            }}
                          />
                          <span>Image from URL</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="form-section guidelines">
          <h3>Submission Guidelines</h3>
          <ul>
            <li>Content must be original or properly attributed</li>
            <li>No copyrighted material without permission</li>
            <li>Ensure content is educational and well-structured</li>
            <li>All submissions will be reviewed by our team</li>
            <li>You'll be notified once your content is approved</li>
            <li>For Google Drive links, ensure sharing permissions are set correctly</li>
            <li>For image URLs, make sure they are publicly accessible</li>
          </ul>
        
          <label className="checkbox-label">
            <input type="checkbox" required disabled={loading} />
            <span>I agree to the terms and confirm this content follows guidelines</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Submitting...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Submit for Review
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddContent;