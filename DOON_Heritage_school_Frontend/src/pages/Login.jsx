import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('token/', { username, password });
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);

            // Get user details
            const userRes = await api.get('auth/me/');
            const roles = userRes.data.roles;

            localStorage.setItem('roles', JSON.stringify(roles));

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
            setError('Invalid credentials');
        }
    };

    return (
        <div className="auth-bg">
            <div className="glass-container auth-card">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your account</p>
                {error && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
