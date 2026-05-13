import React, { useState, useEffect, useMemo } from 'react';
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
    const [exportExamFilter, setExportExamFilter] = useState('');
    const [fetchError, setFetchError] = useState('');
    const navigate = useNavigate();

    // Teacher Form State
    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [teacherForm, setTeacherForm] = useState({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher', class_teacher_classes: [], subject_teacher_classes: [], subject_assignments: {} });

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
    const [studentClassFilter, setStudentClassFilter] = useState('');

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
            const [uRes, cRes, sRes, stRes, eRes, mRes] = await Promise.allSettled([
                api.get('admin/users/'),
                api.get('admin/classes/'),
                api.get('admin/subjects/'),
                api.get('admin/students/'),
                api.get('admin/exams/'),
                api.get('admin/marks/')
            ]);
            if (uRes.status === 'fulfilled') setTeachers(uRes.value.data);
            if (cRes.status === 'fulfilled') setClasses(cRes.value.data);
            if (sRes.status === 'fulfilled') setSubjects(sRes.value.data);
            if (stRes.status === 'fulfilled') setStudents(stRes.value.data);
            if (eRes.status === 'fulfilled') setExams(eRes.value.data);
            if (mRes.status === 'fulfilled') setMarks(mRes.value.data);

            const failed = [uRes, cRes, sRes, stRes, eRes, mRes].filter(r => r.status === 'rejected');
            if (failed.length > 0) {
                setFetchError('Some data failed to load. Check the console for details.');
                failed.forEach(f => console.error('Fetch error:', f.reason));
            }
        } catch (error) {
            console.error("Error fetching admin data", error);
            setFetchError(error.message || "Network Error");
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
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
            setTeacherForm({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher', class_teacher_classes: [], subject_teacher_classes: [], subject_assignments: {} });
            fetchData();
        } catch (error) {
            console.error("Error saving teacher", error);
            alert("Failed to save teacher. Username might exist.");
        }
    };

    const handleDeleteTeacher = async (teacher) => {
        if (teacher.username === 'admin') {
            alert("The primary admin account cannot be deleted.");
            return;
        }
        if (!window.confirm("Are you sure you want to delete this teacher? This cannot be undone.")) return;
        try {
            await api.delete(`admin/users/${teacher.id}/`);
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

    const handleSubjectAssignmentChange = (classId, subjectId, isChecked) => {
        setTeacherForm(prev => {
            const currentAssignments = prev.subject_assignments || {};
            const classSubjects = currentAssignments[classId] || [];

            let updatedClassSubjects;
            if (isChecked) {
                updatedClassSubjects = [...classSubjects, subjectId];
            } else {
                updatedClassSubjects = classSubjects.filter(id => id !== subjectId);
            }

            return {
                ...prev,
                subject_assignments: {
                    ...currentAssignments,
                    [classId]: updatedClassSubjects
                }
            };
        });
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
            setStudentForm({ id: null, name: '', email: '', roll_number: '', classroom: '', parent_name: '', parent_mobile_number: '' });
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
            classroom: student.classroom,
            parent_name: student.parent_name || '',
            parent_mobile_number: student.parent_mobile_number || ''
        });
        setShowStudentForm(true);
    };

    const processedExamData = useMemo(() => {
        let relevantStudents = students;

        if (exportClassFilter) {
            relevantStudents = relevantStudents.filter(s => s.classroom.toString() === exportClassFilter);
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
            if (exportExamFilter && m.exam.toString() !== exportExamFilter) return;
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
    }, [students, marks, exportClassFilter, exportExamFilter]);

    const handleExportExcel = () => {
        if (processedExamData.data.length === 0) {
            alert("No data available to export with the current filters.");
            return;
        }

        const header = ['Class', 'Roll', 'Name', 'Exam Type', ...processedExamData.columns];
        const worksheet = XLSX.utils.json_to_sheet(processedExamData.data, { header });
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
            class_teacher_classes: teacher.class_teacher_classes || [],
            subject_teacher_classes: teacher.subject_teacher_classes || [],
            subject_assignments: teacher.subject_assignments || {}
        });
        setShowTeacherForm(true);
    };

    const displayedStudents = studentClassFilter
        ? students.filter(s => s.classroom.toString() === studentClassFilter)
        : students;

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
                {fetchError && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                        Failed to fetch data: {fetchError}. Please try logging out and logging back in.
                    </div>
                )}
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
                                    if (showTeacherForm) setTeacherForm({ id: null, username: '', email: '', first_name: '', last_name: '', password: '', role: 'class_teacher', class_teacher_classes: [], subject_teacher_classes: [], subject_assignments: {} });
                                }}>
                                    {showTeacherForm ? 'Cancel' : '+ Add Teacher'}
                                </button>
                            </div>

                            {(() => {
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

                                            {/* Designations UI based on role */}
                                            {(teacherForm.role === 'class_teacher' || teacherForm.role === 'both') && (
                                                <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                                                    <label className="form-label">Class Teacher: Assign ONE Class</label>
                                                    <select
                                                        className="form-input"
                                                        value={teacherForm.class_teacher_classes[0] || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setTeacherForm(prev => ({ ...prev, class_teacher_classes: val ? [parseInt(val)] : [] }));
                                                        }}
                                                    >
                                                        <option value="">-- Select Class --</option>
                                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {(teacherForm.role === 'subject_teacher' || teacherForm.role === 'both') && (
                                                <div className="form-group mb-0" style={{ gridColumn: '1 / -1' }}>
                                                    <label className="form-label">Subject Teacher: Select Classes & Subjects</label>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                        {classes.map(c => {
                                                            const allowedSubjects = classSubjectMapping[c.name] || [];
                                                            const subjectsForClass = subjects.filter(s => allowedSubjects.includes(s.name));
                                                            if (subjectsForClass.length === 0) return null;
                                                            return (
                                                                <div key={c.id} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                                                                    <label style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem', cursor: 'pointer' }}>
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={teacherForm.subject_teacher_classes.includes(c.id)}
                                                                            onChange={(e) => {
                                                                                const isChecked = e.target.checked;
                                                                                setTeacherForm(prev => ({
                                                                                    ...prev,
                                                                                    subject_teacher_classes: isChecked
                                                                                        ? [...prev.subject_teacher_classes, c.id]
                                                                                        : prev.subject_teacher_classes.filter(id => id !== c.id)
                                                                                }));
                                                                            }}
                                                                        />
                                                                        Teach in {c.name}
                                                                    </label>
                                                                    {teacherForm.subject_teacher_classes.includes(c.id) && (
                                                                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginLeft: '2rem' }}>
                                                                            {subjectsForClass.map(s => {
                                                                                const isSubjectChecked = teacherForm.subject_assignments[c.id]?.includes(s.id) || false;
                                                                                return (
                                                                                    <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', cursor: 'pointer' }}>
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={isSubjectChecked}
                                                                                            onChange={(e) => handleSubjectAssignmentChange(c.id, s.id, e.target.checked)}
                                                                                            value={s.id}
                                                                                        />
                                                                                        {c.name}_{s.name}
                                                                                    </label>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
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
                                                        <button
                                                            className="btn btn-secondary"
                                                            style={{
                                                                fontSize: '0.75rem',
                                                                padding: '0.25rem 0.5rem',
                                                                backgroundColor: t.username === 'admin' ? '#f3f4f6' : '#fee2e2',
                                                                color: t.username === 'admin' ? '#9ca3af' : '#dc2626',
                                                                borderColor: t.username === 'admin' ? '#d1d5db' : '#fca5a5',
                                                                cursor: t.username === 'admin' ? 'not-allowed' : 'pointer'
                                                            }}
                                                            onClick={() => handleDeleteTeacher(t)}
                                                            disabled={t.username === 'admin'}
                                                            title={t.username === 'admin' ? 'Admin cannot be deleted' : 'Delete'}
                                                        >
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <h3>Manage Students</h3>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <select className="form-input" style={{ width: '150px', margin: 0 }} value={studentClassFilter} onChange={e => setStudentClassFilter(e.target.value)}>
                                        <option value="">All Classes</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <button className="btn btn-primary" onClick={() => {
                                        setShowStudentForm(!showStudentForm);
                                        if (showStudentForm) setStudentForm({ id: null, name: '', email: '', roll_number: '', classroom: '', parent_name: '', parent_mobile_number: '' });
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
                                        <input type="text" className="form-input" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} pattern="^[A-Za-z\s]+$" title="Name can only contain alphabets and spaces" />
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
                                    <div className="form-group mb-0" style={{ flexGrow: 1, minWidth: '200px' }}>
                                        <label className="form-label">Parent Name</label>
                                        <input type="text" className="form-input" value={studentForm.parent_name || ''} onChange={e => setStudentForm({ ...studentForm, parent_name: e.target.value })} />
                                    </div>
                                    <div className="form-group mb-0" style={{ flexGrow: 1, minWidth: '200px' }}>
                                        <label className="form-label">Parent Mobile</label>
                                        <input type="text" className="form-input" value={studentForm.parent_mobile_number || ''} onChange={e => setStudentForm({ ...studentForm, parent_mobile_number: e.target.value })} pattern="\d{10}" title="Mobile number must be exactly 10 digits" />
                                    </div>
                                    <button type="submit" className="btn btn-primary">{studentForm.id ? 'Save Changes' : 'Add Student'}</button>
                                </form>
                            )}

                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Name</th><th>Email</th><th>Roll No</th><th>Class</th><th>Parent Name</th><th>Parent Mobile</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {displayedStudents.map(s => (
                                            <tr key={s.id}>
                                                <td>{s.name}</td>
                                                <td>{s.email || '-'}</td>
                                                <td>{s.roll_number || '-'}</td>
                                                <td>{s.classroom_name}</td>
                                                <td>{s.parent_name || '-'}</td>
                                                <td>{s.parent_mobile_number || '-'}</td>
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
                                    <select className="form-input" style={{ width: '150px', margin: 0 }} value={exportExamFilter} onChange={e => setExportExamFilter(e.target.value)}>
                                        <option value="">All Exams</option>
                                        {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <button className="btn btn-primary" onClick={handleExportExcel}>
                                        Export to Excel
                                    </button>
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
                                            {processedExamData.columns.map(col => <th key={col}>{col.replace('_', ' ')}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedExamData.data.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{row['Class']}</td>
                                                <td>{row['Roll']}</td>
                                                <td>{row['Name']}</td>
                                                <td>{row['Exam Type']}</td>
                                                {processedExamData.columns.map(col => (
                                                    <td key={col}>
                                                        {row[col] !== undefined ? <span className="badge badge-purple">{row[col]}</span> : <span style={{ color: '#ccc' }}>-</span>}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                        {processedExamData.data.length === 0 && (
                                            <tr>
                                                <td colSpan={3 + processedExamData.columns.length} style={{ textAlign: 'center', padding: '1rem' }}>No data available</td>
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

export default SuperAdminDashboard;
