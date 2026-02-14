import React, { useState } from 'react'
import './css/Registration.css'
import { useNavigate } from 'react-router-dom';
import { registerUser } from './api'; // Import from your API file
import Navbar from './Navbar';

function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student', // Added role field with default value
    terms: false,
    newsletter: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMessage, setServerMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setServerMessage('');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.terms) {
      newErrors.terms = 'You must agree to the terms and conditions';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setServerMessage('');
      
      try {
        // Use the imported API function
        const response = await registerUser({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role // Include role in registration
        });

        if (response.success) {
          setServerMessage({
            type: 'success',
            text: 'Registration successful! Redirecting to login...'
          });
                 
          // Store user data in localStorage
          localStorage.setItem('user', JSON.stringify(response.user));
                
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setServerMessage({
            type: 'error',
            text: response.message || 'Registration failed'
          });
        }
      } catch (err) {
        console.error('Registration error:', err);
        setServerMessage({
          type: 'error',
          text: err.message || 'Registration failed. Please try again.'
        });
      } finally {
        setLoading(false);
      }
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <div>
      <Navbar />

      <main className="registration-container">
        <div className="registration-wrapper">
          <div className="registration-left">
            <div className="left-content">
              <h1>Join <span className="highlight">E Siksha</span> Community</h1>
              <p className="subtitle">Start your learning journey with online education platform</p>
              
              <div className="benefits-list">
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <div className="benefit-content">
                    <h3>Free Courses</h3>
                    <p>Access free courses to start your learning</p>
                  </div>
                </div>
                
              
                
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="benefit-content">
                    <h3>Community Learning</h3>
                    <p>Join learners in our community</p>
                  </div>
                </div>
                
                <div className="benefit-item">
                  <div className="benefit-icon">
                    <i className="fas fa-briefcase"></i>
                  </div>
                  <div className="benefit-content">
                    <h3>Career Support</h3>
                    <p>Get job assistance and career guidance</p>
                  </div>
                </div>
              </div>
              
             
            </div>
            
            <div className="decoration-circle circle-1"></div>
            <div className="decoration-circle circle-2"></div>
            <div className="decoration-circle circle-3"></div>
          </div>

          <div className="registration-right">
            <div className="form-container">
              <div className="form-header">
                <h2>Create Your Account</h2>
                <p>Sign up to start learning today</p>
              </div>
              
              {serverMessage && (
                <div className={`server-message ${serverMessage.type}`}>
                  {serverMessage.text}
                </div>
              )}
              
              <form className="registration-form" onSubmit={handleSubmit}>
                {/* Role Selection Section */}
                <div className="form-group role-selection">
                  <label htmlFor="role">
                    <i className="fas fa-user-tag"></i>
                    I want to register as
                  </label>
                  <div className="role-options">
                    <div 
                      className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'student' }))}
                    >
                      <div className="role-icon">
                        <i className="fas fa-user-graduate"></i>
                      </div>
                      <div className="role-info">
                        <h4>Student</h4>
                        <p>Learn new skills and courses</p>
                      </div>
                      <div className="role-checkmark">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                    
                    <div 
                      className={`role-option ${formData.role === 'instructor' ? 'active' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, role: 'instructor' }))}
                    >
                      <div className="role-icon">
                        <i className="fas fa-chalkboard-teacher"></i>
                      </div>
                      <div className="role-info">
                        <h4>Instructor</h4>
                        <p>Teach and share your knowledge</p>
                      </div>
                      <div className="role-checkmark">
                        <i className="fas fa-check"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">
                    <i className="fas fa-user"></i>
                    Full Name
                  </label>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName"
                    placeholder="Enter your full name" 
                    required 
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.fullName && <div className="error-message">{errors.fullName}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    placeholder="Enter your email" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && <div className="error-message">{errors.email}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                  </label>
                  <div className="password-input">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="password" 
                      name="password"
                      placeholder="Create a password" 
                      required 
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={togglePasswordVisibility}
                      disabled={loading}
                    >
                      <i className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                  </div>
                  <div className="password-strength">
                    <div className="strength-meter">
                      <div 
                        className="strength-bar" 
                        style={{ 
                          width: `${Math.min(formData.password.length * 10, 100)}%`,
                          backgroundColor: formData.password.length >= 6 ? '#10b981' : '#f59e0b'
                        }}
                      ></div>
                    </div>
                    <div className="strength-text">
                      Password strength: {formData.password.length >= 6 ? 'Strong' : 'Weak'}
                    </div>
                  </div>
                  <div className="password-hints">
                    <p>Password must contain:</p>
                    <ul>
                      <li className={formData.password.length >= 6 ? 'valid' : ''}>At least 6 characters</li>
                      <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>One uppercase letter (optional)</li>
                      <li className={/\d/.test(formData.password) ? 'valid' : ''}>One number (optional)</li>
                    </ul>
                  </div>
                  {errors.password && <div className="error-message">{errors.password}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <i className="fas fa-lock"></i>
                    Confirm Password
                  </label>
                  <div className="password-input">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      id="confirmPassword" 
                      name="confirmPassword"
                      placeholder="Re-enter your password" 
                      required 
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="toggle-password" 
                      onClick={toggleConfirmPasswordVisibility}
                      disabled={loading}
                    >
                      <i className={`fas fa-${showConfirmPassword ? "eye-slash" : "eye"}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    name="terms"
                    required 
                    checked={formData.terms}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="terms">
                    I agree to the <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
                  </label>
                  {errors.terms && <div className="error-message">{errors.terms}</div>}
                </div>
                
                <div className="form-group checkbox-group">
                  <input 
                    type="checkbox" 
                    id="newsletter" 
                    name="newsletter"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label htmlFor="newsletter">
                    Send me learning tips, course recommendations, and updates
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className="register-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Creating Account...
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <i className="fas fa-arrow-right"></i>
                    </>
                  )}
                </button>
              </form>
              
              <div className="login-link">
                Already have an account? 
                <a onClick={() => navigate('/login')}>Sign in here</a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="register-footer">
        <div className="footer-copyright">
          <p>© 2025 E Siksha Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Registration;
