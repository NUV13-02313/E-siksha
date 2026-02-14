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
        <header className="navbar">
            <div className="nav-left">
                <div className="logo" onClick={() => navigate('/')}>
                    <img src="/img/logo.png" alt="E Siksha Logo" />
                </div>
               
            </div>

           

            <div className="nav-right">
                {showProfile ? (
                    <>
                    <nav className="nav-links">
              <button className="nav-link" onClick={() => navigate('/')}>
                Home
              </button>
              <button className="nav-link" onClick={() => navigate('/list')}>
                Courses
              </button>
              <button className="nav-link" onClick={() => navigate('/pdf')}>
                Notes
              </button>
              <button className="nav-link" onClick={() => navigate('/about')}>
                About
              </button>
            </nav>
                        {user ? (
                            <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
                                {user.avatar ? (
                                    <img 
                                        src={user.avatar} 
                                        alt={user.fullName} 
                                        className="user-avatar"
                                    />
                                ) : (
                                    <div className="avatar-placeholder">
                                        {getInitials(user.fullName)}
                                    </div>
                                )}
                                <span className="user-name">
                                    {user.fullName?.split(' ')[0] || 'User'}
                                </span>
                                <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
                                
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <div className="dropdown-header">
                                            <div className="user-info">
                                                {user.avatar ? (
                                                    <img src={user.avatar} alt={user.fullName} />
                                                ) : (
                                                    <div className="avatar-small">
                                                        {getInitials(user.fullName)}
                                                    </div>
                                                )}
                                                <div>
                                                    <strong>{user.fullName}</strong>
                                                    <span>{user.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="dropdown-divider"></div>
                                        
                                        <button 
                                            className="dropdown-item"
                                            onClick={() => {
                                                navigateToDashboard();
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <i className="fas fa-tachometer-alt"></i>
                                            Dashboard
                                        </button>
                                        
                                        <button 
                                            className="dropdown-item"
                                            onClick={() => {
                                                navigate('/add-content');
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <i className="fas fa-plus-circle"></i>
                                            Add Content
                                        </button>
                                        
                                        <button 
                                            className="dropdown-item"
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowDropdown(false);
                                            }}
                                        >
                                            <i className="fas fa-user-cog"></i>
                                            Edit Profile
                                        </button>
                                        
                                        <div className="dropdown-divider"></div>
                                        
                                        <button 
                                            className="dropdown-item logout"
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
                                    className="btn btn-primary"
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
                        className="btn btn-primary"
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