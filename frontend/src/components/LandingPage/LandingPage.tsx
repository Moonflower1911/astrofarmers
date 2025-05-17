'use client';

import Link from 'next/link';

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#fff' }}>
            {/* Hero section */}
            <div style={{
                background: 'linear-gradient(to bottom, #0f172a, #14532d)',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                textAlign: 'center',
            }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                    🌍🚀 Space-Based Farm Monitoring
                </h1>
                <p style={{ fontSize: '1.25rem', maxWidth: '600px', marginBottom: '2rem' }}>
                    Harness the power of satellite data to monitor crops, predict yields, and protect your farm — all from orbit.
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link href="/auth/signup">
                        <button style={buttonStyle}>Sign Up</button>
                    </Link>
                    <Link href="/auth/signin">
                        <button style={{ ...buttonStyle, backgroundColor: '#15803d' }}>Log In</button>
                    </Link>
                </div>

            </div>

            {/* Features */}
            <div style={{
                backgroundColor: '#f8fafc',
                color: '#1e293b',
                padding: '4rem 2rem',
                textAlign: 'center'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>What You Can Do</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    maxWidth: '1000px',
                    margin: '0 auto',
                }}>
                    <FeatureCard title="📡 Real-Time Weather" desc="Access satellite-based weather forecasts and alerts." />
                    <FeatureCard title="🛰️ Crop Health Monitoring" desc="Use NDVI data to track crop vitality." />
                    <FeatureCard title="🌱 Soil Moisture Insights" desc="Estimate field moisture levels using space-based sensors." />
                    <FeatureCard title="📊 Smart Predictions" desc="Use AI-powered yield predictions and farming advice." />
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ title, desc }: { title: string, desc: string }) {
    return (
        <div style={{
            backgroundColor: '#ffffff',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{title}</h3>
            <p style={{ fontSize: '1rem' }}>{desc}</p>
        </div>
    );
}

const buttonStyle = {
    backgroundColor: '#2563eb',
    color: '#fff',
    padding: '0.75rem 1.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
    border: 'none',
    cursor: 'pointer',
};
