import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-grid">
                
                {/* Brand Column */}
                <div className="footer-col brand-col">
                    <h2 className="footer-brand">Doon Heritage School</h2>
                    <p className="footer-motto">Knowledge • Wisdom • Integrity</p>
                    <p className="footer-desc">
                        Empowering students with quality education and modern values to create the global leaders of tomorrow.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
                        <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
                        <a href="#" aria-label="LinkedIn"><Linkedin size={18} /></a>
                    </div>
                </div>

                {/* Quick Links Column */}
                <div className="footer-col links-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul>
                        <li><a href="#">About the School</a></li>
                        <li><a href="#">Academic Programs</a></li>
                        <li><a href="#">Admissions 2026</a></li>
                        <li><a href="#">Fee Structure</a></li>
                        <li><a href="#">School Rules</a></li>
                    </ul>
                </div>

                {/* Resources Column */}
                <div className="footer-col links-col">
                    <h4 className="footer-heading">Resources</h4>
                    <ul>
                        <li><a href="#">Teacher Portal</a></li>
                        <li><a href="#">Student Dashboard</a></li>
                        <li><a href="#">Academic Calendar</a></li>
                        <li><a href="#">News & Events</a></li>
                        <li><a href="#">Career Opportunities</a></li>
                    </ul>
                </div>

                {/* Contact Column */}
                <div className="footer-col contact-col">
                    <h4 className="footer-heading">Get in Touch</h4>
                    <ul className="contact-info">
                        <li>
                            <MapPin className="contact-icon" size={20} />
                            <span>Kolabari, Champsari, Dist: Darjeeling, Pin - 734003, Siliguri, WB</span>
                        </li>
                        <li>
                            <Phone className="contact-icon" size={20} />
                            <div>
                                <span>+91 85970 75889</span><br />
                                <span>+91 70630 80445</span>
                            </div>
                        </li>
                        <li>
                            <Mail className="contact-icon" size={20} />
                            <a href="mailto:dhsslg@gmail.com">dhsslg@gmail.com</a>
                        </li>
                    </ul>
                    
                    <div style={{ marginTop: '2rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: 'white' }}>Subscribe to Newsletter</h4>
                        <input type="email" placeholder="Enter your email" className="newsletter-input" />
                        <button className="newsletter-btn">Subscribe</button>
                    </div>
                </div>

            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-inner">
                    <p>&copy; {new Date().getFullYear()} Doon Heritage School. All Rights Reserved.</p>
                    <p>Designed for Excellence.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
