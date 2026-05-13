import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { BookOpen, Users, Building, ArrowRight } from 'lucide-react';
import './Home.css';

const Home = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--background)' }}>
            <Header />
            <main style={{ flexGrow: 1 }}>
                <Hero />
                
                {/* Core Values Section */}
                <section className="core-values">
                    <div className="section-header">
                        <span className="section-subtitle">Why Choose Us</span>
                        <h2 className="section-title">Fostering Excellence in Every Student</h2>
                    </div>
                    <div className="values-grid">
                        <div className="value-card">
                            <div className="value-img-wrapper">
                                <img src="/assets/academics.png" alt="Academics" className="value-img" />
                            </div>
                            <div className="value-content">
                                <h3 className="value-title">
                                    <BookOpen className="value-icon" size={24} />
                                    Rigorous Academics
                                </h3>
                                <p className="value-desc">
                                    Our innovative curriculum is designed to challenge students intellectually and prepare them for top-tier universities globally.
                                </p>
                            </div>
                        </div>

                        <div className="value-card">
                            <div className="value-img-wrapper">
                                <img src="/assets/campus.png" alt="Holistic Development" className="value-img" />
                            </div>
                            <div className="value-content">
                                <h3 className="value-title">
                                    <Users className="value-icon" size={24} />
                                    Holistic Growth
                                </h3>
                                <p className="value-desc">
                                    Beyond textbooks, we emphasize sports, arts, and leadership programs to nurture well-rounded, confident individuals.
                                </p>
                            </div>
                        </div>

                        <div className="value-card">
                            <div className="value-img-wrapper">
                                <img src="/assets/hero_background.png" alt="Infrastructure" className="value-img" />
                            </div>
                            <div className="value-content">
                                <h3 className="value-title">
                                    <Building className="value-icon" size={24} />
                                    Modern Infrastructure
                                </h3>
                                <p className="value-desc">
                                    Experience learning in state-of-the-art smart classrooms, advanced laboratories, and expansive sports complexes.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Banner */}
                <section className="about-banner">
                    <div className="about-banner-img"></div>
                    <div className="about-banner-content">
                        <h2>Tradition Meets Innovation</h2>
                        <p>
                            At Doon Heritage School, we blend time-honored traditional values with cutting-edge educational methodologies. Our mission is to create a secure, inspiring, and dynamic environment where every student can discover their passion and excel.
                        </p>
                        <button className="btn btn-gold hero-btn" style={{ alignSelf: 'flex-start' }}>
                            Learn About Our Heritage <ArrowRight size={20} style={{marginLeft: '8px'}} />
                        </button>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
