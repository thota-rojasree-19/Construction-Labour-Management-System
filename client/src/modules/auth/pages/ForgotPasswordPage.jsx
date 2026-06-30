import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { validateEmail } from '../validation/authValidation';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        
        const emailErr = validateEmail(email);
        if (emailErr) {
            setErrors({ email: emailErr });
            return;
        }

        setErrors({});
        setLoading(true);
        setAlert(null);

        fetch('/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Failed to submit forgot password request');
            }
            return data;
        })
        .then((data) => {
            setLoading(false);
            setAlert({ type: 'success', message: 'Verification OTP sent to email address successfully.' });
            sessionStorage.setItem('otp_email', email);
            sessionStorage.setItem('otp_purpose', 'forgot-password');
            setTimeout(() => {
                window.location.hash = '#/verify';
            }, 1500);
        })
        .catch((err) => {
            setLoading(false);
            setAlert({ type: 'error', message: err.message });
        });
    };

    return (
        <AuthLayout>
            <div className="auth-header">
                <h3>Forgot Password</h3>
                <p>Enter your profile email address to receive password retrieval codes.</p>
            </div>

            {alert && (
                <div className={`auth-alert auth-alert-${alert.type}`}>
                    <span>✅</span>
                    <span>{alert.message}</span>
                </div>
            )}

            <form onSubmit={handleForgotSubmit}>
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        type="email" 
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="admin@constro.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <span className="input-error-msg">{errors.email}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" style={{ marginTop: '24px' }} disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner-icon"></div>
                            Sending Code...
                        </>
                    ) : 'Send Verification OTP'}
                </button>
            </form>

            <p className="auth-switch-link" style={{ marginTop: '24px' }}>
                Remember your password? <a href="#/login">Back to Login</a>
            </p>
        </AuthLayout>
    );
}
