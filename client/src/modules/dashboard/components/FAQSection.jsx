import React, { useState } from 'react';

const FAQS = [
    { q: 'How is attendance captured on construction sites?', a: 'Attendance is recorded via geo-fenced smartphone logs or dedicated tablets installed on-site using biometric verification codes. Data syncs instantly with database endpoints.' },
    { q: 'Does the system handle daily/weekly labor payouts?', a: 'Yes. The system parses daily rates, hourly wages, and overtime criteria. Roster outputs integrate directly with major banks to execute transactions.' },
    { q: 'Is data secure and compliant with local labor laws?', a: 'Data transmission uses HTTPS security configurations and stored compliance parameters, conforming with state tax calculations and industrial safety guidelines.' }
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section className="faq" id="faq">
            <div className="landing-container">
                <div className="section-header">
                    <span class="section-tag">Support Desk</span>
                    <h2 class="section-title">Frequently Asked Questions</h2>
                    <p class="section-desc">Find answers to common questions about setting up and running ConstroConnect.</p>
                </div>

                <div className="faq-accordion">
                    {FAQS.map((faq, idx) => (
                        <div key={idx} className={`faq-item ${openIndex === idx ? 'open' : ''}`}>
                            <button className="faq-trigger" onClick={() => toggle(idx)}>
                                {faq.q}
                                <span className="faq-icon">+</span>
                            </button>
                            <div className={`faq-panel ${openIndex === idx ? 'open' : ''}`}>
                                <p>{faq.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
