import React from 'react';

const FEATURES = [
    { icon: '📋', title: 'Project Management', desc: 'Map work structures, allocate budgets, assign sub-contractors, and track real-time resource execution milestones.' },
    { icon: '👷', title: 'Labour Management', desc: 'Maintain digital profiles containing KYC verification documents, certifications, compliance status, skills levels, and daily base rates.' },
    { icon: '⏱', title: 'Attendance Tracking', desc: 'Collect logs with geo-fenced mobile checking or site-biometric integration. Handles half-day rules and overtime multipliers automatically.' },
    { icon: '💰', title: 'Payroll Automation', desc: 'Generate precise wage rosters including deductions, advances, and bonuses. Disburse wages instantly via automated bank integrations.' },
    { icon: '💳', title: 'Expense Management', desc: 'Record site purchases, fuel logs, and equipment hire bills. Upload receipts instantly through mobile cameras for site audits.' },
    { icon: '📊', title: 'Reports & Analytics', desc: 'Consolidate cost runs, labor utilization trends, and timeline deviations into boardroom-ready visual exports.' }
];

export default function FeatureGrid() {
    return (
        <section id="features" className="features">
            <div className="landing-container">
                <div className="section-header">
                    <span class="section-tag">Powerful Features</span>
                    <h2 class="section-title">Built specifically for the construction site</h2>
                    <p class="section-desc">Traditional HR systems fail on the site. ConstroConnect is engineered to handle dynamic shifts, weather disruptions, and manual payroll calculations.</p>
                </div>

                <div className="features-grid">
                    {FEATURES.map((item, idx) => (
                        <div key={idx} className="feature-card">
                            <div className="feature-icon-wrapper">
                                <span>{item.icon}</span>
                            </div>
                            <h3>{item.title}</h3>
                            <p>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
