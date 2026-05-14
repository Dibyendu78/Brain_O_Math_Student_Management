import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('token/', { username, password });
            sessionStorage.setItem('access', res.data.access);
            sessionStorage.setItem('refresh', res.data.refresh);

            // Get user details
            const userRes = await api.get('auth/me/');
            const roles = userRes.data.roles;

            sessionStorage.setItem('roles', JSON.stringify(roles));

            if (roles.includes('admin')) {
                navigate('/admin');
            } else if (roles.includes('class_teacher') && roles.includes('subject_teacher')) {
                // Dual role, let's just go to a landing dashboard or default to class teacher
                navigate('/class-teacher');
            } else if (roles.includes('class_teacher')) {
                navigate('/class-teacher');
            } else if (roles.includes('subject_teacher')) {
                navigate('/subject-teacher');
            } else {
                setError("You don't have any roles assigned.");
            }
        } catch (err) {
            console.error('Login error:', err);
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status >= 500) {
                    setError(`Server error (${err.response.status}). Please check server logs.`);
                } else if (err.response.data && err.response.data.detail) {
                    setError(err.response.data.detail);
                } else if (err.response.data && typeof err.response.data === 'object') {
                    const errorMsg = Object.values(err.response.data).flat().join(' ');
                    setError(errorMsg || 'Invalid credentials. Please try again.');
                } else {
                    setError(`Error: ${err.response.statusText || 'Invalid credentials. Please try again.'}`);
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('Network error. Cannot reach the server.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            {loading && (
                <div className="auth-loading-overlay" role="status" aria-live="polite">
                    <div className="auth-loader"></div>
                    <p>Signing you in...</p>
                </div>
            )}

            <div className="glass-container auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>

                {error && (
                    <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} aria-busy={loading}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            className="form-input"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
