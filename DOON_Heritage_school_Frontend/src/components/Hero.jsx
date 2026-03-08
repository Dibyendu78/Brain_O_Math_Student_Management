import React from 'react';
import { ArrowRight } from 'lucide-react';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-overlay"></div>
            <div className="container hero-content animate-fade-in">
                <span className="hero-badge">Welcome to the Digital Portal</span>
                <h2 className="hero-title">Shaping Leaders of Tomorrow</h2>
                <p className="hero-subtitle">
                    Access your personalized dashboard to manage academics, communicate with faculty, and stay updated with Doon Heritage School.
                </p>
                <div className="hero-actions">
                    <button className="btn btn-gold hero-btn">
                        Explore Academics <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
