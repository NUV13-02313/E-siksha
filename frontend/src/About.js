import React, { useEffect } from 'react';
import './css/About.css';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function About() {
    const navigate = useNavigate();

    // Define showSection inside the component
    const showSection = (sectionId) => {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show selected section
        const selectedSection = document.getElementById(sectionId);
        if (selectedSection) {
            selectedSection.style.display = 'block';
        }

        // Update active tab
        const tabs = document.querySelectorAll('.tab-link');
        tabs.forEach(tab => {
            tab.classList.remove('active');
            if (tab.textContent.toLowerCase().includes(sectionId)) {
                tab.classList.add('active');
            }
        });
    };

    // Show the 'about' section by default when component mounts
    useEffect(() => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
            showSection('about');
        }, 100);
    }, []);

    return (
        <div>
            <div>
                <Navbar />

                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">About E Siksha</h1>
                        <p className="hero-subtitle">Empowering learners worldwide through innovative education technology</p>
                    </div>
                </section>

                {/* Tabs Navigation */}
                <div className="tabs-nav">
                    <div className="tabs-container">
                        <button className="tab-link active" onClick={() => showSection('about')}>About Us</button>
                        <button className="tab-link" onClick={() => showSection('why')}>Why E Siksha</button>
                        <button className="tab-link" onClick={() => showSection('careers')}>Careers</button>
                        <button className="tab-link" onClick={() => showSection('impact')}>Social Impact</button>
                        <button className="tab-link" onClick={() => showSection('contact')}>Contact Us</button>
                        <button className="tab-link" onClick={() => showSection('future')}>Our Future</button>
                    </div>
                </div>

                {/* Main Content */}
                <main className="main-content">
                    {/* About Us Section */}
                    <section id="about" className="content-section active-section">
                        <h2 className="section-title">About E Siksha</h2>
                        <p className="section-subtitle">Founded in 2020, E Siksha has been at the forefront of the digital education revolution</p>
                        
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-bullseye"></i>
                                </div>
                                <h3 className="feature-title">Our Mission</h3>
                                <p className="feature-desc">
                                    To democratize education by making high-quality learning accessible to everyone, 
                                    everywhere, regardless of their background or financial situation.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-eye"></i>
                                </div>
                                <h3 className="feature-title">Our Vision</h3>
                                <p className="feature-desc">
                                    To create a world where anyone can learn anything, anywhere, 
                                    and transform their lives through education.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-handshake"></i>
                                </div>
                                <h3 className="feature-title">Our Values</h3>
                                <p className="feature-desc">
                                    Integrity, Innovation, Inclusion, and Impact guide everything we do 
                                    at E Siksha.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Why E Siksha Section */}
                    <section id="why" className="content-section">
                        <h2 className="section-title">Why Choose E Siksha?</h2>
                        <p className="section-subtitle">Discover what makes us different from other learning platforms</p>
                        
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-user-graduate"></i>
                                </div>
                                <h3 className="feature-title">Expert Instructors</h3>
                                <p className="feature-desc">
                                    Learn from industry professionals and academic experts with real-world experience.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-laptop-code"></i>
                                </div>
                                <h3 className="feature-title">Hands-on Learning</h3>
                                <p className="feature-desc">
                                    Practical projects and assignments that prepare you for real-world challenges.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-certificate"></i>
                                </div>
                                <h3 className="feature-title">Industry Recognition</h3>
                                <p className="feature-desc">
                                    Certificates recognized by top companies and educational institutions worldwide.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-users"></i>
                                </div>
                                <h3 className="feature-title">Community Support</h3>
                                <p className="feature-desc">
                                    Join a global community of learners and get support whenever you need it.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-mobile-alt"></i>
                                </div>
                                <h3 className="feature-title">Learn Anywhere</h3>
                                <p className="feature-desc">
                                    Access courses on any device, anytime, with our mobile-friendly platform.
                                </p>
                            </div>

                            <div className="feature-card">
                                <div className="feature-icon">
                                    <i className="fas fa-hand-holding-heart"></i>
                                </div>
                                <h3 className="feature-title">Affordable Pricing</h3>
                                <p className="feature-desc">
                                    Quality education at a fraction of traditional learning costs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Careers Section */}
                    <section id="careers" className="content-section">
                        <h2 className="section-title">Join Our Team</h2>
                        <p className="section-subtitle">Build the future of education with us</p>
                        
                        <div className="careers-grid">
                            <div className="job-card">
                                <div className="job-header">
                                    <h3 className="job-title">Senior Frontend Developer</h3>
                                    <p className="job-location">Remote · Full-time</p>
                                </div>
                                <div className="job-body">
                                    <p className="job-desc">
                                        Build amazing user experiences for our learning platform using React, 
                                        TypeScript, and modern web technologies.
                                    </p>
                                    <ul className="job-requirements">
                                        <li>5+ years of React experience</li>
                                        <li>Strong TypeScript skills</li>
                                        <li>Experience with state management</li>
                                        <li>Knowledge of modern CSS</li>
                                    </ul>
                                    <button className="apply-btn">Apply Now</button>
                                </div>
                            </div>

                            <div className="job-card">
                                <div className="job-header">
                                    <h3 className="job-title">Content Creator</h3>
                                    <p className="job-location">Hybrid · Full-time</p>
                                </div>
                                <div className="job-body">
                                    <p className="job-desc">
                                        Create engaging educational content for various courses and learning paths.
                                    </p>
                                    <ul className="job-requirements">
                                        <li>Strong communication skills</li>
                                        <li>Experience in educational content</li>
                                        <li>Technical writing ability</li>
                                        <li>Video production skills</li>
                                    </ul>
                                    <button className="apply-btn">Apply Now</button>
                                </div>
                            </div>

                            <div className="job-card">
                                <div className="job-header">
                                    <h3 className="job-title">UX/UI Designer</h3>
                                    <p className="job-location">Remote · Full-time</p>
                                </div>
                                <div className="job-body">
                                    <p className="job-desc">
                                        Design intuitive and beautiful interfaces for our learning platform.
                                    </p>
                                    <ul className="job-requirements">
                                        <li>3+ years of UX/UI experience</li>
                                        <li>Proficient in Figma</li>
                                        <li>User research skills</li>
                                        <li>Prototyping expertise</li>
                                    </ul>
                                    <button className="apply-btn">Apply Now</button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Impact Section */}
                    <section id="impact" className="content-section">
                        <h2 className="section-title">Social Impact</h2>
                        <p className="section-subtitle">Making a difference through education</p>
                        
                        <div className="impact-stats">
                            <div className="stat-box">
                                <div className="stat-number">10,000+</div>
                                <div className="stat-label">Scholarships Awarded</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">500+</div>
                                <div className="stat-label">Partner Schools</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">50+</div>
                                <div className="stat-label">Countries Reached</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-number">$2M+</div>
                                <div className="stat-label">In Free Education</div>
                            </div>
                        </div>

                        <div className="impact-projects">
                            <div className="project-card">
                                <div className="project-image">
                                    <i className="fas fa-school"></i>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">Digital Literacy Program</h3>
                                    <p>Teaching digital skills to underprivileged communities across India.</p>
                                </div>
                            </div>

                            <div className="project-card">
                                <div className="project-image">
                                    <i className="fas fa-female"></i>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">Women in Tech</h3>
                                    <p>Providing free tech education to women from rural areas.</p>
                                </div>
                            </div>

                            <div className="project-card">
                                <div className="project-image">
                                    <i className="fas fa-hand-holding-usd"></i>
                                </div>
                                <div className="project-content">
                                    <h3 className="project-title">Skill Development</h3>
                                    <p>Training youth in job-ready skills for better employment opportunities.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact Section */}
                    <section id="contact" className="content-section">
                        <h2 className="section-title">Contact Us</h2>
                        <p className="section-subtitle">Get in touch with our team</p>
                        
                        <div className="contact-container">
                            <div className="contact-info">
                                <h3>Get in Touch</h3>
                                <div className="contact-method">
                                    <div className="contact-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div>
                                        <h4>Visit Us</h4>
                                        <p>123 Education Street<br />Bangalore, India 560001</p>
                                    </div>
                                </div>

                                <div className="contact-method">
                                    <div className="contact-icon">
                                        <i className="fas fa-phone"></i>
                                    </div>
                                    <div>
                                        <h4>Call Us</h4>
                                        <p>+91 98765 43210<br />Mon-Fri, 9AM-6PM</p>
                                    </div>
                                </div>

                                <div className="contact-method">
                                    <div className="contact-icon">
                                        <i className="fas fa-envelope"></i>
                                    </div>
                                    <div>
                                        <h4>Email Us</h4>
                                        <p>hello@esiksha.com<br />support@esiksha.com</p>
                                    </div>
                                </div>
                            </div>

                            <div className="contact-form">
                                <h3>Send a Message</h3>
                                <form>
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-input" placeholder="Enter your name" required />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-input" placeholder="Enter your email" required />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <input type="text" className="form-input" placeholder="What is this regarding?" required />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Message</label>
                                        <textarea className="form-textarea" placeholder="Your message here..." required></textarea>
                                    </div>

                                    <button type="submit" className="submit-btn">Send Message</button>
                                </form>
                            </div>
                        </div>
                    </section>

                    {/* Future Section */}
                    <section id="future" className="content-section">
                        <h2 className="section-title">Our Future</h2>
                        <p className="section-subtitle">The journey ahead for E Siksha</p>
                        
                        <div className="timeline">
                            <div className="timeline-item">
                                <div className="timeline-year">2024</div>
                                <div className="timeline-content">
                                    <h3>AI-Powered Learning</h3>
                                    <p>Launch of personalized AI tutors for every student.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-year">2025</div>
                                <div className="timeline-content">
                                    <h3>Global Expansion</h3>
                                    <p>Expanding to 20 new countries with localized content.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-year">2026</div>
                                <div className="timeline-content">
                                    <h3>VR Learning Labs</h3>
                                    <p>Immersive virtual reality classrooms for practical training.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-year">2027</div>
                                <div className="timeline-content">
                                    <h3>University Partnerships</h3>
                                    <p>Collaborations with top universities for accredited programs.</p>
                                </div>
                            </div>

                            <div className="timeline-item">
                                <div className="timeline-year">2028</div>
                                <div className="timeline-content">
                                    <h3>100M Learners</h3>
                                    <p>Goal to reach 100 million learners worldwide.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="main-footer">
                    <div className="footer-content">
                        <div className="footer-column">
                            <h4>E Siksha</h4>
                            <p>Transforming education through technology and innovation.</p>
                            <div className="social-links">
                                <a href="#"><i className="fab fa-facebook-f"></i></a>
                                <a href="#"><i className="fab fa-twitter"></i></a>
                                <a href="#"><i className="fab fa-linkedin-in"></i></a>
                                <a href="#"><i className="fab fa-instagram"></i></a>
                                <a href="#"><i className="fab fa-youtube"></i></a>
                            </div>
                        </div>

                        <div className="footer-column">
                            <h4>Quick Links</h4>
                            <a href="index.html">Home</a>
                            <a href="courses.html">Courses</a>
                            <a href="pdf.html">PDF Library</a>
                            <a href="#">About Us</a>
                            <a href="#">Contact</a>
                        </div>

                        <div className="footer-column">
                            <h4>Resources</h4>
                            <a href="#">Blog</a>
                            <a href="#">FAQs</a>
                            <a href="#">Help Center</a>
                            <a href="#">Community</a>
                            <a href="#">Partners</a>
                        </div>

                        <div className="footer-column">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                            <a href="#">Accessibility</a>
                            <a href="#">Sitemap</a>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>&copy; 2025 E Siksha. All rights reserved.</p>
                        <p>Empowering learners worldwide</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default About;