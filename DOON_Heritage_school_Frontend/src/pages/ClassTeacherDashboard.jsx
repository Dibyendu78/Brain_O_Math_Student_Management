import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const ClassTeacherDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [marks, setMarks] = useState([]);
    const [exams, setExams] = useState([]);
    const [activeTab, setActiveTab] = useState('classes');
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [studentForm, setStudentForm] = useState({ name: '', roll_number: '', email: '', classroom: '', parent_name: '', parent_mobile_number: '' });

    // Filters for marks viewing
    const [selectedClassFilter, setSelectedClassFilter] = useState('');
    const [selectedExamFilter, setSelectedExamFilter] = useState('');
    const [fetchError, setFetchError] = useState('');

    const navigate = useNavigate();
    const roles = JSON.parse(sessionStorage.getItem('roles') || '[]');

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

    const fetchData = async () => {
        try {
            setFetchError('');
            const [cRes, sRes, mRes, eRes] = await Promise.all([
                api.get('class-teacher/my-classes/'),
                api.get('class-teacher/students/'),
                api.get('class-teacher/marks/'),
                api.get('admin/exams/') // Assuming class teachers can read exams list
            ]);
            setClasses(cRes.data);
            setStudents(sRes.data);
            setMarks(mRes.data);
            setExams(eRes.data);
        } catch (error) {
            console.error("Error fetching class teacher data", error);
            setFetchError(error.message || "Network Error");
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/login');
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('class-teacher/students/', studentForm);
            setShowStudentForm(false);
            setStudentForm({ name: '', roll_number: '', email: '', classroom: '', parent_name: '', parent_mobile_number: '' });
            fetchData();
        } catch (error) {
            console.error("Error saving student", error);
            if (error.response?.data?.non_field_errors) {
                alert(error.response.data.non_field_errors.join(" "));
            } else if (error.response?.data) {
                const msgs = Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`);
                alert("Failed to save student: " + msgs.join(" | "));
            } else {
                alert("Failed to save student.");
            }
        }
    };

    const processedMarksData = useMemo(() => {
        let relevantStudents = students;

        if (selectedClassFilter) {
            relevantStudents = relevantStudents.filter(s => s.classroom.toString() === selectedClassFilter);
        }

        const studentDataMap = {};
        relevantStudents.forEach(stu => {
            studentDataMap[stu.id] = {
                'Class': stu.classroom_name,
                'Roll': stu.roll_number || '-',
                'Name': stu.name,
                'Exam Type': new Set()
            };
        });

        const columnsFound = new Set();
        const relevantMarks = marks.filter(m => studentDataMap[m.student]);

        relevantMarks.forEach(m => {
            if (selectedExamFilter && m.exam.toString() !== selectedExamFilter) return;
            const colName = `${m.subject_name}_${m.exam_name}`;
            columnsFound.add(colName);
            studentDataMap[m.student][colName] = m.marks;
            studentDataMap[m.student]['Exam Type'].add(m.exam_name);
        });

        const columns = Array.from(columnsFound).sort();
        const data = Object.values(studentDataMap).map(row => ({
            ...row,
            'Exam Type': Array.from(row['Exam Type']).join(', ')
        }));

        return { data, columns };
    }, [marks, students, selectedClassFilter, selectedExamFilter]);

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
                {fetchError && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        Failed to fetch data: {fetchError}. Please try logging out and logging back in.
                    </div>
                )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Students in my Classes</h3>
                                <button className="btn btn-primary" onClick={() => setShowStudentForm(!showStudentForm)}>
                                    {showStudentForm ? 'Cancel' : '+ Add Student'}
                                </button>
                            </div>

                            {showStudentForm && (
                                <form onSubmit={handleStudentSubmit} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-input" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} pattern="^[A-Za-z\s]+$" title="Name can only contain alphabets and spaces" />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Roll Number</label>
                                        <input type="text" className="form-input" required value={studentForm.roll_number} onChange={e => setStudentForm({ ...studentForm, roll_number: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Class</label>
                                        <select className="form-input" required value={studentForm.classroom} onChange={e => setStudentForm({ ...studentForm, classroom: e.target.value })}>
                                            <option value="">Select a class...</option>
                                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-input" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Parent Name</label>
                                        <input type="text" className="form-input" value={studentForm.parent_name} onChange={e => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Parent Mobile</label>
                                        <input type="text" className="form-input" value={studentForm.parent_mobile_number} onChange={e => setStudentForm({ ...studentForm, parent_mobile_number: e.target.value })} pattern="\d{10}" title="Mobile number must be exactly 10 digits" />
                                    </div>
                                    <button type="submit" className="btn btn-primary">Add Student</button>
                                </form>
                            )}

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Roll Number</th><th>Email</th><th>Class</th><th>Parent Name</th><th>Parent Mobile</th></tr></thead>
                                    <tbody>
                                        {students.map(s => <tr key={s.id}><td>{s.name}</td><td>{s.roll_number || '-'}</td><td>{s.email}</td><td>{s.classroom_name}</td><td>{s.parent_name || '-'}</td><td>{s.parent_mobile_number || '-'}</td></tr>)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'marks' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3>Student Marks Assigned by Subject Teachers</h3>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                                    <select className="form-input" style={{ width: '150px', margin: 0 }} value={selectedClassFilter} onChange={e => setSelectedClassFilter(e.target.value)}>
                                        <option value="">All My Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <select className="form-input" style={{ width: '150px', margin: 0 }} value={selectedExamFilter} onChange={e => setSelectedExamFilter(e.target.value)}>
                                        <option value="">All Exams</option>
                                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                                <table style={{ minWidth: 'max-content' }}>
                                    <thead>
                                        <tr>
                                            <th>Class</th>
                                            <th>Roll No</th>
                                            <th>Student Name</th>
                                            <th>Exam Type</th>
                                            {processedMarksData.columns.map(col => <th key={col}>{col.replace('_', ' ')}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedMarksData.data.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{row['Class']}</td>
                                                <td>{row['Roll']}</td>
                                                <td>{row['Name']}</td>
                                                <td>{row['Exam Type']}</td>
                                                {processedMarksData.columns.map(col => (
                                                    <td key={col}>
                                                        {row[col] !== undefined ? <span className="badge badge-blue">{row[col]}</span> : <span style={{ color: '#ccc' }}>-</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {processedMarksData.data.length === 0 && (
                                            <tr>
                                                <td colSpan={4 + processedMarksData.columns.length} style={{ textAlign: 'center', padding: '1rem' }}>No marks found.</td>
                                            </tr>
                                        )}
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
