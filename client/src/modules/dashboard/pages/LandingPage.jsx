import React from 'react';
import Navbar from '../../../shared/components/layout/Navbar';
import Footer from '../../../shared/components/layout/Footer';
import HeroSection from '../components/HeroSection';
import TrustedPartners from '../components/TrustedPartners';
import FeatureGrid from '../components/FeatureGrid';
import WorkflowTimeline from '../components/WorkflowTimeline';
import PreviewDashboard from '../components/PreviewDashboard';
import AnalyticsShowcase from '../components/AnalyticsShowcase';
import FAQSection from '../components/FAQSection';
import '../styles/landingPage.css';

export default function LandingPage() {
    return (
        <div className="landing-page-root">
            <Navbar />
            
            <main>
                <HeroSection />
                <TrustedPartners />
                <FeatureGrid />
                <WorkflowTimeline />
                <PreviewDashboard />
                <AnalyticsShowcase />
                
                {/* Testimonials */}
                <section className="testimonials">
                    <div className="landing-container">
                        <div className="section-header">
                            <span className="section-tag">Success Stories</span>
                            <h2 className="section-title">Endorsed by industry builders</h2>
                            <p className="section-desc">See how companies transitioned from paper registers to complete digital efficiency.</p>
                        </div>

                        <div className="testimonials-grid">
                            <div className="testimonial-card">
                                <div className="stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-quote">"Consolidation of payroll and attendance spreadsheets used to take us three days every week. With ConstroConnect, we complete runs inside 15 minutes."</p>
                                <div className="reviewer-info">
                                    <div className="reviewer-img">RH</div>
                                    <div className="reviewer-details">
                                        <h4>R. Hariharan</h4>
                                        <span>HR Manager, Skyline Builders</span>
                                    </div>
                                </div>
                            </div>
                            <div className="testimonial-card">
                                <div className="stars">⭐⭐⭐⭐⭐</div>
                                <p className="testimonial-quote">"Geofenced check-in resolved punch-sharing disputes immediately. Now site logs match actual worker hours with extreme precision."</p>
                                <div className="reviewer-info">
                                    <div className="reviewer-img">MD</div>
                                    <div className="reviewer-details">
                                        <h4>M. Deshmukh</h4>
                                        <span>Site Engineer, InfraTech</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <FAQSection />

                {/* Final Call to Action Banner */}
                <section className="cta-banner">
                    <div className="landing-container">
                        <div className="cta-inner">
                            <h2>Ready to Digitize Your Construction Operations?</h2>
                            <p>Start managing your sites, labor documentation, and payroll pipelines with extreme accuracy today.</p>
                            <div className="cta-buttons">
                                <a href="#" className="btn btn-primary" style={{ backgroundColor: 'var(--primary)', border: 'none' }}>Start Free Trial</a>
                                <a href="#" className="btn btn-outline-white">Book System Demo</a>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
