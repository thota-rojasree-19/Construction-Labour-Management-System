import React from 'react';
import '../styles/auth.css';

export default function AuthLayout({ children }) {
    return (
        <div className="auth-split-container">
            {/* Left Hand Graphic Panel */}
            <div className="auth-graphic-side">
                <div className="auth-brand-logo">
                    <span>■</span> ConstroConnect
                </div>
                
                <div className="auth-hero-copy">
                    <h2>Smart Workforce Logistics for Modern Construction Sites</h2>
                    <p>Onboard workers, track real-time attendance rosters, calculate complex wage rules, and manage budgets in a unified enterprise portal.</p>
                </div>
                
                <div className="auth-graphic-footer">
                    &copy; {new Date().getFullYear()} ConstroConnect Inc. Enterprise Operations.
                </div>
            </div>

            {/* Right Hand Form Container */}
            <div className="auth-form-side">
                <div className="auth-card">
                    {children}
                </div>
            </div>
        </div>
    );
}
