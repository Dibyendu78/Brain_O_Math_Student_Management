import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-content">
                <span className="hero-badge">A Legacy of Excellence</span>
                <h2 className="hero-title">Shaping Leaders of Tomorrow</h2>
                <p className="hero-subtitle">
                    Experience a transformative education at Doon Heritage School. Our cutting-edge facilities and expert faculty empower students to achieve greatness and become global citizens.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-gold hero-btn">
                        Discover More <ArrowRight size={20} style={{marginLeft: '8px'}} />
                    </button>
                    <button className="btn hero-btn" style={{ background: 'transparent', border: '1px solid white', color: 'white' }}>
                        Admissions <BookOpen size={20} style={{marginLeft: '8px'}} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
