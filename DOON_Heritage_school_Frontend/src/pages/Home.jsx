import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Footer from '../components/Footer';

const Home = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flexGrow: 1 }}>
                <Hero />
                {/* You can add more sections like About, Academics, News here later */}
                <section style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: 'var(--surface)' }}>
                    <div className="container">
                        <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Welcome to Doon Heritage School</h2>
                        <p style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                            We are committed to providing an exceptional educational experience that fosters intellectual, social, and emotional growth. Our dedicated faculty and state-of-the-art facilities ensure every student reaches their full potential.
                        </p>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Home;
