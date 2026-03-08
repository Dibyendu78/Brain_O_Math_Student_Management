import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { classSubjectMapping } from '../utils/classSubjectMapping';

const SuperAdminDashboard = () => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);
    const [marks, setMarks] = useState([]);
    const [activeTab, setActiveTab] = useState('teachers');

    // Export Filters
    const [exportClassFilter, setExportClassFilter] = useState('');
    const navigate = useNavigate();

    // Teacher Form State
    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [teacherForm, setTeacherForm] = useState({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher', classes: [], subjects: [] });

    // Class Form State
    const [newClassName, setNewClassName] = useState('');
    // Subject Form State
    const [newSubjectName, setNewSubjectName] = useState('');
    // Exam Form State
    const [newExamName, setNewExamName] = useState('');
    const [newExamDate, setNewExamDate] = useState('');

    // Student Form State
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [studentForm, setStudentForm] = useState({ id: null, name: '', email: '', roll_number: '', classroom: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [uRes, cRes, sRes, stRes, eRes, mRes] = await Promise.all([
                api.get('admin/users/'),
                api.get('admin/classes/'),
                api.get('admin/subjects/'),
                api.get('admin/students/'),
                api.get('admin/exams/'),
                api.get('admin/marks/')
            ]);
            setTeachers(uRes.data);
            setClasses(cRes.data);
            setSubjects(sRes.data);
            setStudents(stRes.data);
            setExams(eRes.data);
            setMarks(mRes.data);
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleTeacherSubmit = async (e) => {
        e.preventDefault();
        try {
            if (teacherForm.id) {
                await api.put(`admin/users/${teacherForm.id}/`, teacherForm);
            } else {
                await api.post('admin/users/', teacherForm);
            }
            setShowTeacherForm(false);
            setTeacherForm({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher', classes: [], subjects: [] });
            fetchData();
        } catch (error) {
            console.error("Error saving teacher", error);
            alert("Failed to save teacher. Username might exist.");
        }
    };

    const handleDeleteTeacher = async (id) => {
        if (!window.confirm("Are you sure you want to delete this teacher? This cannot be undone.")) return;
        try {
            await api.delete(`admin/users/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting teacher", error);
            alert("Failed to delete teacher.");
        }
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        if (!newClassName.trim()) return;
        try {
            await api.post('admin/classes/', { name: newClassName });
            setNewClassName('');
            fetchData();
        } catch (error) {
            console.error("Error creating class", error);
            alert("Failed to create class. It might already exist.");
        }
    };

    const handleDeleteClass = async (id) => {
        if (!window.confirm("Are you sure you want to delete this class? This may delete all students in it!")) return;
        try {
            await api.delete(`admin/classes/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting class", error);
            alert("Failed to delete class.");
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;
        try {
            await api.post('admin/subjects/', { name: newSubjectName });
            setNewSubjectName('');
            fetchData();
        } catch (error) {
            console.error("Error creating subject", error);
            alert("Failed to create subject. It might already exist.");
        }
    };

    const handleDeleteSubject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subject?")) return;
        try {
            await api.delete(`admin/subjects/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting subject", error);
            alert("Failed to delete subject.");
        }
    };

    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!newExamName.trim() || !newExamDate) return;
        try {
            await api.post('admin/exams/', { name: newExamName, date: newExamDate });
            setNewExamName('');
            setNewExamDate('');
            fetchData();
        } catch (error) {
            console.error("Error creating exam", error);
            alert("Failed to create exam. Please check dates and ensure it does not exist.");
        }
    };

    const handleDeleteExam = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam? This will erase all marks for this exam!")) return;
        try {
            await api.delete(`admin/exams/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting exam", error);
            alert("Failed to delete exam.");
        }
    };

    const handleCsvUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('admin/students/upload_csv/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Students uploaded successfully!');
            fetchData();
        } catch (error) {
            console.error("Error uploading CSV", error);
            alert("Failed to upload CSV. Please make sure headers match 'name', 'class_name', 'roll_number', etc.");
        }
        e.target.value = null; // reset input
    };

    const handleCheckboxChange = (e, listName) => {
        const id = parseInt(e.target.value);
        if (e.target.checked) {
            setTeacherForm({ ...teacherForm, [listName]: [...teacherForm[listName], id] });
        } else {
            setTeacherForm({ ...teacherForm, [listName]: teacherForm[listName].filter(item => item !== id) });
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (studentForm.id) {
                await api.put(`admin/students/${studentForm.id}/`, studentForm);
            } else {
                await api.post('admin/students/', studentForm);
            }
            setShowStudentForm(false);
            setStudentForm({ id: null, name: '', email: '', roll_number: '', classroom: '' });
            fetchData();
        } catch (error) {
            console.error("Error saving student", error);
            alert("Failed to save student.");
        }
    };

    const handleDeleteStudent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await api.delete(`admin/students/${id}/`);
            fetchData();
        } catch (error) {
            console.error("Error deleting student", error);
            alert("Failed to delete student.");
        }
    };

    const editStudent = (student) => {
        setStudentForm({
            id: student.id,
            name: student.name,
            email: student.email || '',
            roll_number: student.roll_number || '',
            classroom: student.classroom
        });
        setShowStudentForm(true);
    };

    const handleExportExcel = () => {
        let relevantStudents = students;

        if (exportClassFilter) {
            relevantStudents = relevantStudents.filter(s => s.classroom.toString() === exportClassFilter);
        }

        if (relevantStudents.length === 0) {
            alert("No students found for the selected export filter.");
            return;
        }

        const studentDataMap = {};
        relevantStudents.forEach(stu => {
            studentDataMap[stu.id] = {
                'Roll': stu.roll_number || '-',
                'Name': stu.name
            };
        });

        const columnsFound = new Set();
        const relevantMarks = marks.filter(m => studentDataMap[m.student]);

        relevantMarks.forEach(m => {
            const colName = `${m.subject_name}_${m.exam_name}`;
            columnsFound.add(colName);
            studentDataMap[m.student][colName] = m.marks;
        });

        const dataForExcel = Object.values(studentDataMap);

        if (dataForExcel.length === 0 || columnsFound.size === 0) {
            alert("No mark data available to export for these students.");
            return;
        }

        const header = ['Roll', 'Name', ...Array.from(columnsFound).sort()];

        const worksheet = XLSX.utils.json_to_sheet(dataForExcel, { header });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ExamData");
        XLSX.writeFile(workbook, "Student_Exam_Data.xlsx");
    };

    const editTeacher = (teacher) => {
        setTeacherForm({
            id: teacher.id,
            username: teacher.username,
            email: teacher.email,
            first_name: teacher.first_name,
            last_name: teacher.last_name,
            password: '', // Blank password unless changing
            role: teacher.role || 'class_teacher',
            classes: teacher.classes || [],
            subjects: teacher.subjects || []
        });
        setShowTeacherForm(true);
    };

    return (
        <div className="dashboard-layout">
            <nav className="navbar">
                <div className="navbar-brand">School Admin</div>
                <div className="navbar-user">
                    <span>Super Admin</span>
                    <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                </div>
            </nav>

            <main className="page-container">
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={`btn ${activeTab === 'teachers' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('teachers')}>Teachers</button>
                        <button className={`btn ${activeTab === 'classes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('classes')}>Classes</button>
                        <button className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('subjects')}>Subjects</button>
                        <button className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('exams')}>Exams</button>
                        <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('students')}>Students</button>
                        <button className={`btn ${activeTab === 'exam_data' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('exam_data')}>Exam Data (Marks)</button>
                    </div>
                </div>

                <div className="card">
                    {activeTab === 'teachers' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Teachers Directory</h3>
                                <button className="btn btn-primary" onClick={() => {
                                    setShowTeacherForm(!showTeacherForm);
                                    if (showTeacherForm) setTeacherForm({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher' });
                                }}>
                                    {showTeacherForm ? 'Cancel' : '+ Add Teacher'}
                                </button>
                            </div>

                            {(() => {
                                const adminFilteredSubjects = teacherForm.classes.length > 0
                                    ? subjects.filter(s => {
                                        const selectedClassNames = teacherForm.classes.map(id => classes.find(c => c.id === id)?.name);
                                        return selectedClassNames.some(clsName => {
                                            const allowedNames = classSubjectMapping[clsName] || [];
                                            return allowedNames.includes(s.name);
                                        });
                                    })
                                    : subjects;

                                return showTeacherForm && (
                                    <form onSubmit={handleTeacherSubmit} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                            <div className="form-group mb-0">
                                                <label className="form-label">Username</label>
                                                <input type="text" className="form-input" required value={teacherForm.username} onChange={e => setTeacherForm({ ...teacherForm, username: e.target.value })} />
                                            </div>
                                            <div className="form-group mb-0">
                                                <label className="form-label">Password {teacherForm.id && '(Leave blank to keep current)'}</label>
                                                <input type="password" className="form-input" required={!teacherForm.id} value={teacherForm.password} onChange={e => setTeacherForm({ ...teacherForm, password: e.target.value })} />
                                            </div>
                                            <div className="form-group mb-0">
                                                <label className="form-label">First Name</label>
                                                <input type="text" className="form-input" value={teacherForm.first_name} onChange={e => setTeacherForm({ ...teacherForm, first_name: e.target.value })} />
                                            </div>
                                            <div className="form-group mb-0">
                                                <label className="form-label">Email</label>
                                                <input type="email" className="form-input" value={teacherForm.email} onChange={e => setTeacherForm({ ...teacherForm, email: e.target.value })} />
                                            </div>
                                            <div className="form-group mb-0">
                                                <label className="form-label">Designation Role</label>
                                                <select className="form-input" value={teacherForm.role} onChange={e => setTeacherForm({ ...teacherForm, role: e.target.value })}>
                                                    <option value="class_teacher">Class Teacher</option>
                                                    <option value="subject_teacher">Subject Teacher</option>
                                                    <option value="both">Both</option>
                                                </select>
                                            </div>

                                            {/* Multi-Select Assignments */}
                                            <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                                                <label className="form-label">Assign Classes</label>
                                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                    {classes.map(c => (
                                                        <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <input
                                                                type="checkbox"
                                                                value={c.id}
                                                                checked={teacherForm.classes.includes(c.id)}
                                                                onChange={(e) => handleCheckboxChange(e, 'classes')}
                                                            />
                                                            {c.name}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {(teacherForm.role === 'subject_teacher' || teacherForm.role === 'both') && (
                                                <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                                                    <label className="form-label">Assign Subjects</label>
                                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                                        {adminFilteredSubjects.map(s => (
                                                            <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    value={s.id}
                                                                    checked={teacherForm.subjects.includes(s.id)}
                                                                    onChange={(e) => handleCheckboxChange(e, 'subjects')}
                                                                />
                                                                {s.name}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button type="submit" className="btn btn-secondary">{teacherForm.id ? 'Save Changes' : 'Create Teacher'}</button>
                                    </form>
                                );
                            })()}

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Username</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.map(t => (
                                            <tr key={t.id}>
                                                <td>{t.first_name || 'N/A'} {t.last_name || ''}</td>
                                                <td>{t.email}</td>
                                                <td>{t.username}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => editTeacher(t)}>
                                                            Edit
                                                        </button>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteTeacher(t.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div>
                            <h3>Manage Classes</h3>

                            <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                                <div className="form-group mb-0" style={{ flexGrow: 1, maxWidth: '300px' }}>
                                    <label className="form-label">New Class Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Class 10 A"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Add Class</button>
                            </form>

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Class Name</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {classes.map(c => (
                                            <tr key={c.id}>
                                                <td>{c.name}</td>
                                                <td>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteClass(c.id)}>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'subjects' && (
                        <div>
                            <h3>Manage Subjects</h3>

                            <form onSubmit={handleCreateSubject} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                                <div className="form-group mb-0" style={{ flexGrow: 1, maxWidth: '300px' }}>
                                    <label className="form-label">New Subject Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Mathematics"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Add Subject</button>
                            </form>

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Subject Name</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {subjects.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteSubject(s.id)}>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exams' && (
                        <div>
                            <h3>Manage Examinations</h3>

                            <form onSubmit={handleCreateExam} style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                <div className="form-group mb-0" style={{ flexGrow: 1, maxWidth: '300px' }}>
                                    <label className="form-label">Exam Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g., Midterm 2026"
                                        value={newExamName}
                                        onChange={(e) => setNewExamName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-0" style={{ flexGrow: 1, maxWidth: '200px' }}>
                                    <label className="form-label">Exam Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={newExamDate}
                                        onChange={(e) => setNewExamDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary">Add Exam</button>
                            </form>

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Exam Name</th><th>Date</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {exams.map(e => (
                                            <tr key={e.id}>
                                                <td>{e.name}</td>
                                                <td>{e.date}</td>
                                                <td>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteExam(e.id)}>
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {activeTab === 'students' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3>Manage Students</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-primary" onClick={() => {
                                        setShowStudentForm(!showStudentForm);
                                        if (showStudentForm) setStudentForm({ id: null, name: '', email: '', roll_number: '', classroom: '' });
                                    }}>
                                        {showStudentForm ? 'Cancel' : '+ Add Student'}
                                    </button>
                                    <label htmlFor="csv-upload" className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                                        Upload CSV
                                    </label>
                                    <input
                                        id="csv-upload"
                                        type="file"
                                        accept=".csv"
                                        style={{ display: 'none' }}
                                        onChange={handleCsvUpload}
                                    />
                                </div>
                            </div>

                            {showStudentForm && (
                                <form onSubmit={handleStudentSubmit} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Name</label>
                                        <input type="text" className="form-input" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-input" value={studentForm.email} onChange={e => setStudentForm({ ...studentForm, email: e.target.value })} />
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
                                    <button type="submit" className="btn btn-primary">{studentForm.id ? 'Save Changes' : 'Add Student'}</button>
                                </form>
                            )}

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Roll No</th><th>Class</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {students.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td>{s.email || '-'}</td>
                                                <td>{s.roll_number || '-'}</td>
                                                <td>{s.classroom_name}</td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }} onClick={() => editStudent(s)}>
                                                            Edit
                                                        </button>
                                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fca5a5' }} onClick={() => handleDeleteStudent(s.id)}>
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'exam_data' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3>Exam Data (All Student Marks)</h3>

                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '8px' }}>
                                    <select className="form-input" style={{ width: '150px', margin: 0 }} value={exportClassFilter} onChange={e => setExportClassFilter(e.target.value)}>
                                        <option value="">All Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button className="btn btn-primary" onClick={handleExportExcel}>
                                        Export to Excel
                                    </button>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Student</th><th>Roll No</th><th>Class</th><th>Exam</th><th>Subject</th><th>Marks</th></tr></thead>
                                    <tbody>
                                        {marks.map(m => {
                                            const stu = students.find(s => s.id === m.student);
                                            // Optional on-screen filtering logic. For now just show all or just the selected? 
                                            // The user asked to export based on choice. Let's filter the display too for convenience.
                                            if (exportClassFilter && stu && stu.classroom.toString() !== exportClassFilter) return null;

                                            return (
                                                <tr key={m.id}>
                                                    <td>{m.student_name}</td>
                                                    <td>{stu ? stu.roll_number : '-'}</td>
                                                    <td>{stu ? stu.classroom_name : '-'}</td>
                                                    <td>{m.exam_name}</td>
                                                    <td>{m.subject_name}</td>
                                                    <td><span className="badge badge-purple">{m.marks}</span></td>
                                                </tr>
                                            );
                                        })}
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

export default SuperAdminDashboard;
