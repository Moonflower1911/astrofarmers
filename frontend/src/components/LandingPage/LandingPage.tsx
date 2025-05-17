'use client';

import './LandingStyles.css';
import { useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
    useEffect(() => {
        document.documentElement.style.scrollBehavior = 'smooth';
    }, []);

    return (
        <div className="landing-root">
            {/* 🌿 Navbar */}
            <nav className="navbar">
                <div className="logo">AstroFarmers</div>
                <ul className="nav-links">
                    <li><a href="#about">About</a></li>
                    <li><a href="#features">Features</a></li>
                    <li><a href="#contact" className="cta-btn">Contact Us</a></li>
                </ul>
                <div className="auth-buttons">
                    <Link href="/auth/signup"><button className="nav-auth-btn">Sign Up</button></Link>
                    <Link href="/auth/signin"><button className="nav-auth-btn secondary">Log In</button></Link>
                </div>
            </nav>

            {/* 🚀 Hero Section */}
            <section className="hero" id="about">
                <div className="hero-overlay" />
                <div className="hero-content">
                    <h1>We partner with you in the digitalization of agriculture</h1>
                    <p>Digital transformation of your farming operations is a real necessity to stay relevant</p>
                    <a href="#contact" className="hero-button">Contact Us</a>
                </div>
            </section>

            {/* 🌟 Features Section */}
            <section id="features" className="features-section">
                <h2>Platform Features</h2>
                <div className="features-grid">
                    <FeatureCard title="📡 Real-Time Weather" desc="Get accurate forecasts from satellites." />
                    <FeatureCard title="🛰️ Crop Monitoring" desc="Track crop health with NDVI and imagery." />
                    <FeatureCard title="🌱 Soil Moisture" desc="Analyze field hydration from orbit." />
                    <FeatureCard title="📊 Smart AI Insights" desc="Predict yields and receive farming advice." />
                </div>
            </section>

            {/* 📫 Contact Section */}
            <section id="contact" className="contact-section">
                <h2>Contact Us</h2>
                <p>Email: contact@astrofarmers.io</p>
                <p>Phone: +212 6 00 00 00 00</p>
            </section>
        </div>
    );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="feature-card">
            <h3>{title}</h3>
            <p>{desc}</p>
        </div>
    );
}
