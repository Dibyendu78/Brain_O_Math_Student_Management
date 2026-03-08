import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-grid">

                <div className="footer-col brand-col">
                    <h2 className="footer-brand">Doon Heritage School</h2>
                    <p className="footer-motto">KNOWLEDGE WISDOM INTEGRITY</p>
                    <p className="footer-desc">
                        Empowering students with quality education and moral values to create global citizens of tomorrow.
                    </p>
                    <div className="social-links">
                        <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                        <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                        <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                    </div>
                </div>

                <div className="footer-col links-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul>
                        <li><a href="#">About Us</a></li>
                        <li><a href="#">Academic Calendar</a></li>
                        <li><a href="#">Fee Structure</a></li>
                        <li><a href="#">Infrastructure</a></li>
                        <li><a href="#">School Rules</a></li>
                    </ul>
                </div>

                <div className="footer-col contact-col">
                    <h4 className="footer-heading">Contact Us</h4>
                    <ul className="contact-info">
                        <li>
                            <MapPin className="contact-icon" size={20} />
                            <span>Kolabari, Champsari, Dist: Darjeeling, Pin - 734003, Siliguri, West Bengal</span>
                        </li>
                        <li>
                            <Phone className="contact-icon" size={20} />
                            <div>
                                <span>+91 85970 75889</span><br />
                                <span>+91 70630 80445</span><br />
                                <span>+91 98320 89084</span>
                            </div>
                        </li>
                        <li>
                            <Mail className="contact-icon" size={20} />
                            <a href="mailto:dhsslg@gmail.com">dhsslg@gmail.com</a>
                        </li>
                    </ul>
                </div>

            </div>

            <div className="footer-bottom">
                <div className="container footer-bottom-inner">
                    <p>&copy; {new Date().getFullYear()} Doon Heritage School. All Rights Reserved.</p>
                    <p>Designed for Excellence.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
