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

    // Student Filter State
    const [studentSubjectFilter, setStudentSubjectFilter] = useState('');

    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);

        const bc = new BroadcastChannel('app_updates');
        bc.onmessage = (event) => {
            if (event.data?.type === 'DATA_MUTATION') {
                fetchData();
            }
        };

        return () => {
            window.removeEventListener('focus', handleFocus);
            bc.close();
        };
    }, []);

    useEffect(() => {
        if (selectedExam && selectedSubject) {
            const initialMarks = {};
            const subjectId = selectedAssignment ? selectedAssignment.subject.toString() : '';

            filteredStudents.forEach(s => {
                const existingMark = marks.find(m => m.student === s.id && m.exam.toString() === selectedExam && m.subject.toString() === subjectId);
                initialMarks[s.id] = existingMark ? existingMark.marks : '';
            });
            setMarksInput(initialMarks);
        } else {
            setMarksInput({});
        }
    }, [selectedExam, selectedSubject, selectedClass, marks, students]);

    const assignments = subjects; // Since subjects from API are now assignments

    // Filter students by selected assignment's class
    const selectedAssignment = assignments.find(a => a.id.toString() === selectedSubject);
    const selectedClassId = selectedAssignment ? selectedAssignment.classroom.toString() : '';

    // Extracted students matching the selected assignment's class
    const filteredStudents = selectedClassId ? students.filter(s => s.classroom.toString() === selectedClassId) : [];

    // Filter students for the "Students Enrolled" tab
    const selectedFilterAssignment = assignments.find(a => a.id.toString() === studentSubjectFilter);
    const displayedStudents = selectedFilterAssignment
        ? students.filter(s => s.classroom === selectedFilterAssignment.classroom)
        : students;

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
        sessionStorage.clear();
        navigate('/login');
    };

    const handleSaveMark = async (studentId, markValue) => {
        if (markValue === '') return Promise.resolve();
        const subjectId = selectedAssignment ? selectedAssignment.subject.toString() : '';
        const existingMark = marks.find(m => m.student === studentId && m.exam.toString() === selectedExam && m.subject.toString() === subjectId);
        try {
            if (existingMark) {
                await api.put(`subject-teacher/marks/${existingMark.id}/`, {
                    student: studentId,
                    exam: selectedExam,
                    subject: subjectId,
                    marks: markValue
                });
            } else {
                await api.post('subject-teacher/marks/', {
                    student: studentId,
                    exam: selectedExam,
                    subject: subjectId,
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
                                    <thead><tr><th>Class_Subject Name</th></tr></thead>
                                    <tbody>
                                        {assignments.map(a => <tr key={a.id}><td>{a.classroom_name}_{a.subject_name}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                                <h3>Students Enrolled</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                                    <label className="form-label" style={{ margin: 0 }}>Filter by Subject:</label>
                                    <select
                                        className="form-input"
                                        style={{ width: '200px', margin: 0 }}
                                        value={studentSubjectFilter}
                                        onChange={e => setStudentSubjectFilter(e.target.value)}
                                    >
                                        <option value="">All Subjects</option>
                                        {assignments.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.classroom_name}_{a.subject_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Class</th></tr></thead>
                                    <tbody>
                                        {displayedStudents.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.email}</td><td>{s.classroom_name}</td></tr>)}
                                        {displayedStudents.length === 0 && (
                                            <tr><td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>No students found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'marks' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Student Marks for My Subjects</h3>
                                {selectedExam && selectedSubject && filteredStudents.length > 0 && (
                                    <button className="btn btn-primary" onClick={handleSaveAllMarks}>Save All</button>
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
                                        {assignments.map(a => <option key={a.id} value={a.id}>{a.classroom_name}_{a.subject_name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {selectedExam && selectedSubject ? (
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
                                    Please select an Exam and Subject to view and input marks inline.
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
