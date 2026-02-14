import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import './css/Login.css'
import { loginUser } from './api'; // Import from your API file
import Navbar from './Navbar';

function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Use the imported API function
            const response = await loginUser({
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // If remember me is checked, store email
                if (rememberMe) {
                    localStorage.setItem('rememberedEmail', formData.email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                alert('Login successful!');
                
                // Redirect to courses page
                navigate('/list');
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setFormData(prev => ({ ...prev, email: rememberedEmail }));
            setRememberMe(true);
        }
    }, []);

    return (
        <div>
            <Navbar/>
            <div className="container">
                <div className="left">
                    <h1>Welcome to <span className="brand">E Siksha</span></h1>
                    <p>
                        Master the skills of tomorrow with India's leading online learning platform. 
                        Join thousands of learners who are transforming their careers with our 
                        industry-relevant courses and expert mentorship.
                    </p>

                    <div className="features-list">
                        <div className="feature-item">
                            <i className="fas fa-graduation-cap"></i>
                            <span>500+ Courses</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-chalkboard-teacher"></i>
                            <span>Expert Instructors</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-certificate"></i>
                            <span>Certification</span>
                        </div>
                        <div className="feature-item">
                            <i className="fas fa-laptop-code"></i>
                            <span>Hands-on Projects</span>
                        </div>
                    </div>

                    <span className="shape s1"></span>
                    <span className="shape s2"></span>
                    <span className="shape s3"></span>
                </div>

                <div className="right">
                    <div className="login-box">
                        <div className="login-header">
                            <h2>USER LOGIN</h2>
                            <p>Sign in to your account to continue learning</p>
                        </div>

                        {error && (
                            <div className="error-message" style={{
                                backgroundColor: '#fee',
                                color: '#c33',
                                padding: '10px',
                                borderRadius: '5px',
                                marginBottom: '15px',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <form id="loginForm" onSubmit={handleSubmit}>
                            <div className="input-group">
                                <i className="fas fa-user"></i>
                                <input 
                                    type="text" 
                                    name="email"
                                    placeholder="Email or Username" 
                                    required 
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            
                            <div className="input-group">
                                <i className="fas fa-lock"></i>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password"
                                    placeholder="Password" 
                                    required 
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <i 
                                    className={`fas fa-eye${showPassword ? '-slash' : ''} toggle-password`}
                                    onClick={togglePasswordVisibility}
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>

                            <div className="options">
                                <label className="checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        disabled={loading}
                                    />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="/forgot-password" className="forgot-link">Forgot password?</a>
                            </div>

                            <button 
                                type="submit" 
                                className="login-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Logging in...
                                    </>
                                ) : (
                                    'LOGIN'
                                )}
                            </button>

                            <div className="signup-link">
                                Don't have an account? <a onClick={() => navigate('/reg')}>Sign up now</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <footer className="login-footer">
                <div className="footer-content">
                    <p>© 2025 E Siksha. All rights reserved.</p>
                </div>
            </footer>
        </div>
    )
}

export default Login;