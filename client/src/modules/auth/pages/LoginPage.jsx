import React, { useState } from 'react';
import AuthLayout from '../components/AuthLayout';
import { validateEmail } from '../validation/authValidation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // UI Feedback States
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        
        // Input validation
        const emailErr = validateEmail(email);
        const passErr = password ? null : 'Password is required';
        
        if (emailErr || passErr) {
            setErrors({ email: emailErr, password: passErr });
            return;
        }

        setErrors({});
        setLoading(true);
        setAlert(null);

        fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                if (res.status === 403 && data.isNotVerified) {
                    const err = new Error(data.message || 'Email is not verified yet.');
                    err.isNotVerified = true;
                    err.email = data.email;
                    throw err;
                }
                throw new Error(data.message || 'Login failed');
            }
            return data;
        })
        .then((data) => {
            setLoading(false);
            setAlert({ type: 'success', message: 'Welcome back! Login Successful.' });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            // Trigger storage event so that navbar can update immediately
            window.dispatchEvent(new Event('storage'));
            setTimeout(() => {
                window.location.hash = '#/';
            }, 1500);
        })
        .catch((err) => {
            setLoading(false);
            setAlert({ type: 'error', message: err.message });
            if (err.isNotVerified && err.email) {
                sessionStorage.setItem('otp_email', err.email);
                sessionStorage.setItem('otp_purpose', 'register');
                setTimeout(() => {
                    window.location.hash = '#/verify';
                }, 2000);
            }
        });
    };

    return (
        <AuthLayout>
            <div className="auth-header">
                <h3>Welcome Back</h3>
                <p>Sign in to manage your active construction sites.</p>
            </div>

            {alert && (
                <div className={`auth-alert auth-alert-${alert.type}`}>
                    <span>{alert.type === 'success' ? '✅' : '❌'}</span>
                    <span>{alert.message}</span>
                </div>
            )}

            <form onSubmit={handleLoginSubmit}>
                {/* Email Input */}
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                        type="text" 
                        className={`form-input ${errors.email ? 'error' : ''}`}
                        placeholder="e.g. manager@construction.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <span className="input-error-msg">{errors.email}</span>}
                </div>

                {/* Password Input */}
                <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" style={{ margin: 0 }}>Password</label>
                        <a href="#/forgot-password" className="forgot-password-link">Forgot Password?</a>
                    </div>
                    <div className="input-wrapper">
                        <input 
                            type={showPassword ? 'text' : 'password'}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button 
                            type="button" 
                            className="toggle-password-btn"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {errors.password && <span className="input-error-msg">{errors.password}</span>}
                </div>

                {/* Remember Me Checkbox */}
                <div className="form-actions-row">
                    <label className="remember-me-checkbox">
                        <input type="checkbox" disabled={loading} />
                        Remember my session
                    </label>
                </div>

                {/* Submit button */}
                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner-icon"></div>
                            Processing Sign In...
                        </>
                    ) : 'Sign In to Portal'}
                </button>
            </form>

            <div className="auth-divider">OR</div>

            <div className="social-logins">
                <button type="button" className="social-btn">
                    <span>🔑</span> Google
                </button>
                <button type="button" className="social-btn">
                    <span>💼</span> Microsoft
                </button>
            </div>

            <p className="auth-switch-link">
                Don't have a portal? <a href="#/register">Create Account</a>
            </p>
        </AuthLayout>
    );
}
