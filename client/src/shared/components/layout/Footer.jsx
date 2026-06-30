import React from 'react';
import './Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="landing-container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="footer-logo"><span>■</span> ConstroConnect</div>
                        <p className="footer-desc">The digital standard for modern construction site workforce logistics and financial management.</p>
                    </div>
                    <div className="footer-col">
                        <h3>Company</h3>
                        <ul className="footer-links">
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Careers</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Features</h3>
                        <ul className="footer-links">
                            <li><a href="#features">Labour Registry</a></li>
                            <li><a href="#features">Roster Tracking</a></li>
                            <li><a href="#features">Automated Payroll</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Resources</h3>
                        <ul className="footer-links">
                            <li><a href="#">Help Center</a></li>
                            <li><a href="#">API Docs</a></li>
                            <li><a href="#">Security</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h3>Legal</h3>
                        <ul className="footer-links">
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Use</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} ConstroConnect Inc. All rights reserved.</p>
                    <p>Designed for premium construction enterprise logistics.</p>
                </div>
            </div>
        </footer>
    );
}
