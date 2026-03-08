import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { getFilteredSubjectsForClass } from '../utils/classSubjectMapping';

const SubjectTeacherDashboard = () => {
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [exams, setExams] = useState([]);
    const [activeTab, setActiveTab] = useState('subjects');

    // Inline Marks State
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [marksInput, setMarksInput] = useState({});

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedExam && selectedSubject && selectedClass) {
            const initialMarks = {};
            const studentsInClass = students.filter(s => s.classroom.toString() === selectedClass);
            studentsInClass.forEach(s => {
                const existingMark = marks.find(m => m.student === s.id && m.exam.toString() === selectedExam && m.subject.toString() === selectedSubject);
                initialMarks[s.id] = existingMark ? existingMark.marks : '';
            });
            setMarksInput(initialMarks);
        } else {
            setMarksInput({});
        }
    }, [selectedExam, selectedSubject, selectedClass, marks, students]);

    const assignedClasses = Array.from(new Set(students.map(s => s.classroom)))
        .map(id => students.find(s => s.classroom === id))
        .map(s => ({ id: s.classroom, name: s.classroom_name }));
    const filteredStudents = selectedClass ? students.filter(s => s.classroom.toString() === selectedClass) : [];

    const selectedClassName = assignedClasses.find(c => c.id.toString() === selectedClass)?.name;
    const filteredSubjects = getFilteredSubjectsForClass(selectedClassName, subjects);

    const fetchData = async () => {
        try {
            const [subRes, stuRes, mRes, exRes] = await Promise.all([
                api.get('subject-teacher/my-subjects/'),
                api.get('subject-teacher/students/'),
                api.get('subject-teacher/marks/'),
                api.get('admin/exams/')
            ]);
            setSubjects(subRes.data);
            setStudents(stuRes.data);
            setMarks(mRes.data);
            setExams(exRes.data);
        } catch (error) {
            console.error("Error fetching subject teacher data", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleSaveMark = async (studentId, markValue) => {
        if (markValue === '') return Promise.resolve();
        const existingMark = marks.find(m => m.student === studentId && m.exam.toString() === selectedExam && m.subject.toString() === selectedSubject);
        try {
            if (existingMark) {
                await api.put(`subject-teacher/marks/${existingMark.id}/`, {
                    student: studentId,
                    exam: selectedExam,
                    subject: selectedSubject,
                    marks: markValue
                });
            } else {
                await api.post('subject-teacher/marks/', {
                    student: studentId,
                    exam: selectedExam,
                    subject: selectedSubject,
                    marks: markValue
                });
            }
        } catch (error) {
            console.error("Error saving mark", error);
            throw error;
        }
    };

    const handleSaveSingleAndFetch = async (studentId, markValue) => {
        try {
            await handleSaveMark(studentId, markValue);
            fetchData();
        } catch (e) {
            alert("Failed to save mark.");
        }
    };

    const handleSaveAllMarks = async () => {
        try {
            const promises = Object.entries(marksInput).map(([studentId, markValue]) => {
                if (markValue !== '') {
                    return handleSaveMark(parseInt(studentId), markValue);
                }
                return Promise.resolve();
            });
            await Promise.all(promises);
            fetchData();
            alert("All marks saved successfully!");
        } catch (error) {
            console.error("Error saving all marks", error);
            alert("Failed to save some or all marks.");
        }
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">Subject Teacher Portal</div>
                <div className="navbar-user" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span>Subject Teacher Dashboard</span>
                    {roles.includes('class_teacher') && (
                        <button onClick={() => navigate('/class-teacher')} className="btn btn-primary" style={{ fontSize: '0.8rem' }}>Switch to Class Teacher</button>
                    )}
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <main className="page-container">
                <div className="page-header">
                    <h1 className="page-title">My Subjects & Marks</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('subjects')}>My Subjects</button>
                        <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('students')}>Subject Students</button>
                        <button className={`btn ${activeTab === 'marks' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('marks')}>Manage Marks</button>
                    </div>
                </div>

                <div className="card">
                    {activeTab === 'subjects' && (
                        <div>
                            <h3>Assigned Subjects</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Subject Name</th></tr></thead>
                                    <tbody>
                                        {subjects.map(s => <tr key={s.id}><td>{s.name}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div>
                            <h3>Students Enrolled</h3>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Class</th></tr></thead>
                                    <tbody>
                                        {students.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.classroom_name}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'marks' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Student Marks for My Subjects</h3>
                                {selectedExam && selectedSubject && selectedClass && filteredStudents.length > 0 && (
                                    <button className="btn btn-primary" onClick={handleSaveAllMarks}>Save All Missing Marks</button>
                                )}
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Exam Type</label>
                                    <select className="form-input" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                        <option value="">Choose Exam...</option>
                                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Subject</label>
                                    <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                        <option value="">Choose Subject...</option>
                                        {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Class</label>
                                    <select className="form-input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                                        <option value="">Choose Class...</option>
                                        {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {selectedExam && selectedSubject && selectedClass ? (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Student Name</th><th>Roll No</th><th>Class</th><th>Marks</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {filteredStudents.map(s => (
                                                <tr key={s.id}>
                                                    <td>{s.name}</td>
                                                    <td>{s.roll_number || '-'}</td>
                                                    <td>{s.classroom_name}</td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            style={{ width: '100px', margin: 0, padding: '0.25rem 0.5rem' }}
                                                            value={marksInput[s.id] !== undefined ? marksInput[s.id] : ''}
                                                            onChange={e => setMarksInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                            placeholder="Enter mark"
                                                        />
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', margin: 0 }}
                                                            onClick={() => handleSaveSingleAndFetch(s.id, marksInput[s.id])}
                                                        >
                                                            Save
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredStudents.length === 0 && (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No students found in this class.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', color: '#64748b' }}>
                                    Please select an Exam, Subject, and Class to view and input marks inline.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default SubjectTeacherDashboard;
