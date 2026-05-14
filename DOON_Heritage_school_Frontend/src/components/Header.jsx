import React, { useState } from 'react';
import { Menu, X, User, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <header className="header">
            {/* Top Utility Bar */}
            <div className="top-bar">
                <div className="container top-bar-inner">
                    <p className="school-motto">KNOWLEDGE WISDOM INTEGRITY</p>
                    <div className="top-links">
                        <a href="mailto:dhsslg@gmail.com">dhsslg@gmail.com</a>
                        <span>|</span>
                        <a href="tel:+918597075889">+91 85970 75889</a>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="main-nav-wrapper">
                <div className="container main-nav">
                    <div className="logo-section">
                        <div className="logo-placeholder">
                            <GraduationCap size={32} color="var(--secondary-gold)" />
                        </div>
                        <div>
                            <h1 className="school-name">Doon Heritage School</h1>
                            <p className="school-location">Siliguri, West Bengal</p>
                        </div>
                    </div>

                    <nav className="desktop-nav">
                        <ul className="nav-links">
                            <li><Link to="/" className="active">Home</Link></li>
                            <li><a href="#">About</a></li>
                            <li><a href="#">Academics</a></li>
                            <li><a href="#">Admissions</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                        <Link to="/login" className="btn btn-gold login-btn-nav" style={{ textDecoration: 'none' }}>
                            <User size={18} /> Teacher Portal
                        </Link>
                    </nav>

                    <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="mobile-nav">
                    <ul className="mobile-nav-links">
                        <li><Link to="/" className="active" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                        <li><a href="#" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
                        <li><a href="#" onClick={() => setIsMobileMenuOpen(false)}>Academics</a></li>
                        <li><a href="#" onClick={() => setIsMobileMenuOpen(false)}>Admissions</a></li>
                        <li><a href="#" onClick={() => setIsMobileMenuOpen(false)}>Contact</a></li>
                    </ul>
                    <div className="mobile-nav-footer">
                        <Link to="/login" className="btn btn-gold login-btn-nav" style={{ textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }} onClick={() => setIsMobileMenuOpen(false)}>
                            <User size={18} /> Teacher Portal
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
