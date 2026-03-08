import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const ClassTeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [activeTab, setActiveTab] = useState('classes');

    const navigate = useNavigate();
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [cRes, sRes, mRes] = await Promise.all([
                api.get('class-teacher/my-classes/'),
                api.get('class-teacher/students/'),
                api.get('class-teacher/marks/')
            ]);
            setClasses(cRes.data);
            setStudents(sRes.data);
            setMarks(mRes.data);
        } catch (error) {
            console.error("Error fetching class teacher data", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">Class Teacher Portal</div>
                <div className="navbar-user" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>Class Teacher Dashboard</span>
                    {roles.includes('subject_teacher') && (
                        <button onClick={() => navigate('/subject-teacher')} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Switch to Subject Teacher</button>
                    )}
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <main className="page-container">
                <div className="page-header">
                    <h1 className="page-title">My Classes & Students</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('classes')}>My Classes</button>
                        <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('students')}>My Students</button>
                        <button className={`btn ${activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('marks')}>View Marks</button>
                    </div>
                </div>

                <div className="card">
                    {activeTab === 'classes' && (
                        <div>
                            <h3>Assigned Classes</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Class Name</th></tr></thead>
                                    <tbody>
                                        {classes.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div>
                            <h3>Students in my Classes</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Roll Number</th><th>Email</th><th>Class</th></tr></thead>
                                    <tbody>
                                        {students.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.roll_number || '-'}</td><td>{s.email}</td><td>{s.classroom_name}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'marks' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Student Marks Assigned by Subject Teachers</h3>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Student</th><th>Roll Number</th><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead>
                                    <tbody>
                                        {marks.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.student_name}</td>
                                                <td>{students.find(s => s.id === m.student)?.roll_number || '-'}</td>
                                                <td>{m.exam_name}</td>
                                                <td>{m.subject_name}</td>
                                                <td>
                                                    <span className="badge badge-blue">{m.marks}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ClassTeacherDashboard;
