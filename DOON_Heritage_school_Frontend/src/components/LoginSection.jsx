import React, { useState } from 'react';
import { LogIn, KeySquare, HelpCircle, Lock } from 'lucide-react';
import './LoginSection.css';

const LoginSection = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Mock API call based on the active tab
        console.log(`[API Mock] Authenticating ${activeTab}...`, formData);

        setTimeout(() => {
            setLoading(false);
            alert(`Mock Login Success! Role: ${activeTab.toUpperCase()}`);
            setFormData({ username: '', password: '' });
        }, 1200);
    };

    return (
        <section className="login-section">
            <div className="container">
                <div className="login-card shadow-xl animate-fade-in">

                    <div className="login-header">
                        <h3>Portal Access</h3>
                        <p>Select your role to continue</p>
                    </div>

                    <div className="login-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                            onClick={() => setActiveTab('student')}
                            type="button"
                        >
                            Student Login
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
                            onClick={() => setActiveTab('teacher')}
                            type="button"
                        >
                            Teacher Login
                        </button>
                    </div>

                    <div className="login-body">
                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label className="form-label">
                                    {activeTab === 'student' ? 'Enrollment Number' : 'Employee ID'}
                                </label>
                                <div className="input-with-icon">
                                    <UserIcon />
                                    <input
                                        type="text"
                                        name="username"
                                        className="form-control"
                                        placeholder={activeTab === 'student' ? 'e.g., DHS-2023-0101' : 'e.g., EMP-1042'}
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-row">
                                    <label className="form-label">Password</label>
                                    <a href="#" className="forgot-link">Forgot?</a>
                                </div>
                                <div className="input-with-icon">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className={`btn btn-primary w-100 ${loading ? 'loading' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Authenticating...' : (
                                    <>Secure Login <LogIn size={18} /></>
                                )}
                            </button>
                        </form>

                        <div className="login-footer">
                            <div className="help-box">
                                <HelpCircle size={16} className="help-icon" />
                                <span>Need help logging in? <a href="#">Contact Support</a></span>
                            </div>

                            {activeTab === 'teacher' && (
                                <div className="admin-link">
                                    <p className="text-muted"><KeySquare size={14} className="inline-icon" /> Staff and Admin portal requires additional 2FA verification.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

// Helper for dynamic icon assignment
const UserIcon = () => {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="input-icon">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
        </svg>
    )
}

export default LoginSection;
