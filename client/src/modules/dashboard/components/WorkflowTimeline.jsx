import React from 'react';

const STEPS = [
    { num: 1, title: 'Create Project', desc: 'Input project locations, timeline schedules, and initial budget limits.' },
    { num: 2, title: 'Add Labour Profiles', desc: 'Onboard workforce profiles with certificates and wages rates.' },
    { num: 3, title: 'Mark Attendance', desc: 'Workers check in via mobile geo-fenced logs or site kiosk terminal.' },
    { num: 4, title: 'Run Payroll', desc: 'Generate timesheets, compute taxes, and dispatch payslips.' }
];

export default function WorkflowTimeline() {
    return (
        <section className="how-it-works">
            <div className="landing-container">
                <div className="section-header">
                    <span class="section-tag">Simple Integration</span>
                    <h2 class="section-title">How ConstroConnect Works</h2>
                    <p class="section-desc">Streamline site management in four simple steps to maximize workforce productivity.</p>
                </div>

                <div className="steps-container">
                    <div className="steps-connector"></div>
                    {STEPS.map((step, idx) => (
                        <div key={idx} className="step-card">
                            <div className="step-num">{step.num}</div>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
