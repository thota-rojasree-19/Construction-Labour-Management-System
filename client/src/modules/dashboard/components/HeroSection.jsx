import React from 'react';

export default function HeroSection() {
    return (
        <section className="hero">
            <div className="landing-container hero-grid">
                <div className="hero-content">
                    <div className="hero-badge">
                        <span>⚡</span> Digitizing Site Operations
                    </div>
                    <h1 className="hero-title">
                        Smart Construction <span>Workforce Management</span> Platform
                    </h1>
                    <p className="hero-desc">
                        Manage projects, labour documentation, automated attendance rosters, payroll processing, and site expense budgets from a single connected system.
                    </p>
                    <div className="hero-ctas">
                        <a href="#/register" className="btn btn-primary">Get Started Free</a>
                        <a href="#dashboard" className="btn btn-secondary">Watch Live Demo</a>
                    </div>
                </div>
                
                <div className="hero-illustration">
                    <svg className="isometric-canvas" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M250 50 L450 150 L250 250 L50 150 Z" fill="#E2E8F0" opacity="0.4" />
                        <path d="M250 70 L410 150 L250 230 L90 150 Z" fill="#CBD5E1" opacity="0.6" />
                        
                        <g transform="translate(180, 80)">
                            <path d="M60 0 L110 25 L60 50 L10 25 Z" fill="#334155" />
                            <path d="M10 25 L10 100 L60 125 L60 50 Z" fill="#475569" />
                            <path d="M60 50 L60 125 L110 100 L110 25 Z" fill="#64748B" />
                            <path d="M40 -30 L130 15 L120 20 L30 -25 Z" fill="#F97316" />
                            <line x1="60" y1="20" x2="60" y2="-20" stroke="#F97316" strokeWidth="4" />
                            <line x1="120" y1="18" x2="120" y2="40" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                        </g>
                        
                        <g transform="translate(40, 190)">
                            <rect width="160" height="90" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
                            <rect x="15" y="15" width="30" height="30" rx="6" fill="#F97316" fillOpacity="0.1"/>
                            <circle cx="30" cy="30" r="8" stroke="#F97316" strokeWidth="2"/>
                            <path d="M30 26 V30 H34" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
                            <text x="56" y="28" fill="#0F172A" fontFamily="Outfit" fontSize="12" fontWeight="700">Attendance</text>
                            <text x="56" y="42" fill="#16A34A" fontFamily="Inter" fontSize="10" fontWeight="600">96.8% Present</text>
                            
                            <rect x="15" y="65" width="20" height="10" rx="2" fill="#E2E8F0"/>
                            <rect x="40" y="58" width="20" height="17" rx="2" fill="#E2E8F0"/>
                            <rect x="65" y="52" width="20" height="23" rx="2" fill="#F97316"/>
                            <rect x="90" y="60" width="20" height="15" rx="2" fill="#E2E8F0"/>
                            <rect x="115" y="55" width="20" height="20" rx="2" fill="#E2E8F0"/>
                        </g>
                        
                        <g transform="translate(290, 180)">
                            <rect width="180" height="100" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1"/>
                            <circle cx="35" cy="35" r="15" fill="#2563EB" fillOpacity="0.1"/>
                            <text x="60" y="32" fill="#0F172A" fontFamily="Outfit" fontSize="12" fontWeight="700">Weekly Payroll</text>
                            <text x="60" y="46" fill="#64748B" fontFamily="Inter" fontSize="10">$14,250 Total</text>
                            <path d="M20 80 Q 50 60, 80 75 T 140 55 T 160 50" fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
                            <circle cx="160" cy="50" r="4" fill="#2563EB"/>
                        </g>
                    </svg>
                </div>
            </div>
        </section>
    );
}
