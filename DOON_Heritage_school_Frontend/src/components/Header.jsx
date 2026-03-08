import React from 'react';
import { Menu, User, BookOpen, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
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

                    <button className="mobile-menu-btn">
                        <Menu size={28} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
