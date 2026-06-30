import React, { useState, useEffect, useRef } from 'react';
import AuthLayout from '../components/AuthLayout';

export default function OTPVerificationPage() {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [secondsLeft, setSecondsLeft] = useState(60);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    
    // Create refs for moving focus
    const inputRefs = useRef([]);

    // Countdown clock
    useEffect(() => {
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [secondsLeft]);

    const handleOtpChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = [...otp];
        // Take only the last character entered
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);

        // Move cursor forward on input
        if (val && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move focus backward on backspace if empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text');
        if (isNaN(data) || data.length !== 6) return;

        const pastedArray = data.split('');
        setOtp(pastedArray);
        inputRefs.current[5].focus();
    };

    const handleVerifySubmit = (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setAlert({ type: 'error', message: 'Please enter all 6 verification digits.' });
            return;
        }

        setLoading(true);
        setAlert(null);

        const email = sessionStorage.getItem('otp_email');
        const purpose = sessionStorage.getItem('otp_purpose') || 'register';

        if (!email) {
            setLoading(false);
            setAlert({ type: 'error', message: 'Session expired or email not found. Please try again.' });
            return;
        }

        const endpoint = purpose === 'register' 
            ? '/api/v1/auth/verify-register-otp' 
            : '/api/v1/auth/verify-reset-otp';

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, otp: code })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'OTP verification failed');
            }
            return data;
        })
        .then((data) => {
            setLoading(false);
            setAlert({ type: 'success', message: 'OTP verified successfully!' });

            if (purpose === 'register') {
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                setTimeout(() => {
                    window.location.hash = '#/';
                }, 1500);
            } else {
                sessionStorage.setItem('reset_token', data.resetToken);
                setTimeout(() => {
                    window.location.hash = '#/reset-password';
                }, 1500);
            }
        })
        .catch((err) => {
            setLoading(false);
            setAlert({ type: 'error', message: err.message });
        });
    };

    const handleResend = () => {
        const email = sessionStorage.getItem('otp_email');
        const purpose = sessionStorage.getItem('otp_purpose') || 'register';

        if (!email) {
            setAlert({ type: 'error', message: 'Session expired or email not found. Please try again.' });
            return;
        }

        setLoading(true);
        setAlert(null);

        fetch('/api/v1/auth/resend-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, purpose })
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'Resending OTP failed');
            }
            return data;
        })
        .then(() => {
            setLoading(false);
            setSecondsLeft(60);
            setOtp(new Array(6).fill(''));
            setAlert({ type: 'success', message: 'A new 6-digit verification code has been dispatched.' });
            inputRefs.current[0].focus();
        })
        .catch((err) => {
            setLoading(false);
            setAlert({ type: 'error', message: err.message });
        });
    };

    return (
        <AuthLayout>
            <div className="auth-header">
                <h3>Verification Code</h3>
                <p>Enter the 6-digit verification OTP sent to your profile device.</p>
            </div>

            {alert && (
                <div className={`auth-alert auth-alert-${alert.type}`}>
                    <span>{alert.type === 'success' ? '✅' : '❌'}</span>
                    <span>{alert.message}</span>
                </div>
            )}

            <form onSubmit={handleVerifySubmit}>
                <div className="otp-input-row" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                        <input
                            key={idx}
                            ref={el => inputRefs.current[idx] = el}
                            type="text"
                            maxLength="1"
                            className="otp-box"
                            value={digit}
                            onChange={(e) => handleOtpChange(e, idx)}
                            onKeyDown={(e) => handleKeyDown(e, idx)}
                            disabled={loading}
                        />
                    ))}
                </div>

                <div className="otp-timer-row">
                    <span>
                        {secondsLeft > 0 ? (
                            `Resend OTP in ${secondsLeft}s`
                        ) : 'Ready to request new code'}
                    </span>
                    <button 
                        type="button" 
                        className="resend-otp-btn"
                        onClick={handleResend}
                        disabled={secondsLeft > 0 || loading}
                    >
                        Resend Code
                    </button>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? (
                        <>
                            <div className="spinner-icon"></div>
                            Verifying OTP...
                        </>
                    ) : 'Confirm Verification'}
                </button>
            </form>
        </AuthLayout>
    );
}
