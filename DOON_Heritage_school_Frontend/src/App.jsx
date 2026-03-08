import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ClassTeacherDashboard from './pages/ClassTeacherDashboard';
import SubjectTeacherDashboard from './pages/SubjectTeacherDashboard';

import Home from './pages/Home';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('access');
    return token ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                <Route path="/admin" element={
                    <PrivateRoute>
                        <SuperAdminDashboard />
                    </PrivateRoute>
                } />

                <Route path="/class-teacher" element={
                    <PrivateRoute>
                        <ClassTeacherDashboard />
                    </PrivateRoute>
                } />

                <Route path="/subject-teacher" element={
                    <PrivateRoute>
                        <SubjectTeacherDashboard />
                    </PrivateRoute>
                } />
            </Routes>
        </Router>
    );
}

export default App;
