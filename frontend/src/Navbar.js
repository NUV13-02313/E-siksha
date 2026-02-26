import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/Navbar.css';

function Navbar({ showProfile = true }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        setShowDropdown(false);
        navigate('/login');
    };

    const navigateToDashboard = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } else {
            navigate('/login');
        }
    };

    const getInitials = (fullName) => {
        if (!fullName) return 'U';
        return fullName
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="es-navbar">
            <div className="es-nav-left">
                <div className="es-logo" onClick={() => navigate('/')}>
                    <img src="/img/logo.png" alt="E Siksha Logo" />
                </div>
            </div>

            {/* Navigation Links - Now in the middle/right */}
            <nav className="es-nav-links">
                <button className="es-nav-link" onClick={() => navigate('/')}>
                    Home
                </button>
                <button className="es-nav-link" onClick={() => navigate('/list')}>
                    Courses
                </button>
                <button className="es-nav-link" onClick={() => navigate('/pdf')}>
                    Notes
                </button>
                <button className="es-nav-link" onClick={() => navigate('/about')}>
                    About
                </button>
            </nav>

            <div className="es-nav-right">
                {showProfile ? (
                    <>
                        {user ? (
                            <div className="es-user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.fullName} 
                                        className="es-user-avatar"
                                    />
                                ) : (
                                    <div className="es-avatar-placeholder">
                                        {getInitials(user.fullName)}
                                    </div>
                                )}
                                <span className="es-user-name">
                                    {user.fullName?.split(' ')[0] || 'User'}
                                </span>
                                <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                                
                                {showDropdown && (
                                    <div className="es-dropdown-menu">
                                        <div className="es-dropdown-header">
                                            <div className="es-user-info">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.fullName} />
                                                ) : (
                                                    <div className="es-avatar-small">
                                                        {getInitials(user.fullName)}
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>{user.fullName}</strong>
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="es-dropdown-divider"></div>
                                        
                                        <button 
                                            className="es-dropdown-item"
                                            onClick={() => {
                                                navigateToDashboard();
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            Dashboard
                                        </button>
                                        
                                        <button 
                                            className="es-dropdown-item"
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <i className="fas fa-user-cog"></i>
                                            Edit Profile
                                        </button>
                                        
                                        <div className="es-dropdown-divider"></div>
                                        
                                        <button 
                                            className="es-dropdown-item es-logout"
                                            onClick={handleLogout}
                                        >
                                            <i className="fas fa-sign-out-alt"></i>
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button 
                                    className="es-btn es-btn-outline"
                                    onClick={() => navigate('/login')}
                                >
                                    <i className="fas fa-sign-in-alt"></i>
                                    Login
                                </button>
                                <button 
                                    className="es-btn es-btn-primary"
                                    onClick={() => navigate('/reg')}
                                >
                                    <i className="fas fa-user-plus"></i>
                                    Sign Up
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <button 
                        className="es-btn es-btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Get Started
                    </button>
                )}
            </div>
        </header>
    );
}

export default Navbar;