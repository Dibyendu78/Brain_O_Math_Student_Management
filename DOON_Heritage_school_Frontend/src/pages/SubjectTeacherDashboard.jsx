import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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
    const [excelFile, setExcelFile] = useState(null);
    const [excelUploadResult, setExcelUploadResult] = useState(null);
    const [excelMessage, setExcelMessage] = useState(null);
    const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
    const [isUploadingExcel, setIsUploadingExcel] = useState(false);
    const [excelInputKey, setExcelInputKey] = useState(0);

    const [isFetching, setIsFetching] = useState(false);
    const [fetchSuccess, setFetchSuccess] = useState(false);

    // Student Filter State
    const [studentSubjectFilter, setStudentSubjectFilter] = useState('');

    const [savingStates, setSavingStates] = useState({});
    const inputRefs = useRef({});

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
        setMarksInput({});
    }, [selectedExam, selectedSubject, selectedClass]);

    const assignments = subjects; // Since subjects from API are now assignments
    const assignedClasses = Array.from(
        new Map(assignments.map(a => [a.classroom, { id: a.classroom, name: a.classroom_name }])).values()
    );
    const assignmentsForSelectedClass = selectedClass
        ? assignments.filter(a => a.classroom.toString() === selectedClass)
        : assignments;
    const examsForSelectedClass = selectedClass
        ? exams.filter(ex => !ex.classroom_ids || ex.classroom_ids.includes(parseInt(selectedClass)))
        : exams;

    // Filter students by selected assignment's class
    const selectedAssignment = assignments.find(a => a.id.toString() === selectedSubject);
    const selectedClassId = selectedAssignment ? selectedAssignment.classroom.toString() : '';

    // Selected exam object
    const selectedExamObj = exams.find(e => e.id.toString() === selectedExam);

    // Extracted students matching the selected assignment's class
    const filteredStudents = selectedClassId ? students.filter(s => s.classroom.toString() === selectedClassId) : [];

    // Filter students for the "Students Enrolled" tab
    const selectedFilterAssignment = assignments.find(a => a.id.toString() === studentSubjectFilter);
    const displayedStudents = selectedFilterAssignment
        ? students.filter(s => s.classroom === selectedFilterAssignment.classroom)
        : students;

    const fetchData = async () => {
        setIsFetching(true);
        setFetchSuccess(false);
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
            setFetchSuccess(true);
            setTimeout(() => setFetchSuccess(false), 2000);
        } catch (error) {
            console.error("Error fetching subject teacher data", error);
        } finally {
            setIsFetching(false);
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
        if (selectedExamObj && selectedExamObj.full_marks) {
            if (Number(markValue) > Number(selectedExamObj.full_marks)) {
                alert(`Marks cannot be greater than full marks (${selectedExamObj.full_marks}).`);
                setSavingStates(prev => ({ ...prev, [studentId]: 'error' }));
                return;
            }
        }
        setSavingStates(prev => ({ ...prev, [studentId]: 'saving' }));
        try {
            await handleSaveMark(studentId, markValue);
            fetchData();
            setSavingStates(prev => ({ ...prev, [studentId]: 'saved' }));
            setTimeout(() => {
                setSavingStates(prev => ({ ...prev, [studentId]: null }));
            }, 2000);
        } catch (e) {
            setSavingStates(prev => ({ ...prev, [studentId]: 'error' }));
            alert("Failed to save mark.");
        }
    };

    const getExistingMarkValue = (studentId) => {
        const subjectId = selectedAssignment ? selectedAssignment.subject.toString() : '';
        const existingMark = marks.find(m => m.student === studentId && m.exam.toString() === selectedExam && m.subject.toString() === subjectId);
        return existingMark ? existingMark.marks : null;
    };

    const moveToNextEmpty = (currentIndex, currentTarget) => {
        for (let i = currentIndex + 1; i < filteredStudents.length; i++) {
            const nextInput = inputRefs.current[i];
            if (nextInput && !nextInput.value) {
                nextInput.focus();
                return;
            }
        }
        if (currentTarget) currentTarget.blur();
    };

    const moveFocus = (currentIndex, direction) => {
        let target = currentIndex + direction;
        while (target >= 0 && target < filteredStudents.length) {
            const targetInput = inputRefs.current[target];
            if (targetInput) {
                targetInput.focus();
                return;
            }
            target += direction;
        }
    };

    const handleKeyDown = (e, index, studentId) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            moveToNextEmpty(index, e.target);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            moveFocus(index, 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            moveFocus(index, -1);
        }
    };

    const handleBlur = (studentId, value) => {
        const existingValue = getExistingMarkValue(studentId);
        if (value !== undefined && value !== '' && String(value) !== String(existingValue || '')) {
            handleSaveSingleAndFetch(studentId, value);
        }
    };

    const handleDownloadExcel = async () => {
        if (!selectedClass || !selectedExam || !selectedAssignment) {
            alert("Please choose class, exam type, and subject first.");
            return;
        }

        setIsDownloadingExcel(true);
        setExcelMessage({ type: 'info', text: 'Preparing Excel file. Your download will start shortly.' });
        try {
            const params = new URLSearchParams({
                class_name: selectedAssignment.classroom_name,
                subject_name: selectedAssignment.subject_name,
                exam_id: selectedExam
            });
            const response = await api.get(`subject-teacher/marks-template/?${params.toString()}`, {
                responseType: 'blob'
            });

            const disposition = response.headers['content-disposition'] || '';
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `${selectedAssignment.classroom_name}_${selectedAssignment.subject_name}_marks.xlsx`;
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            setExcelMessage({ type: 'success', text: 'Excel download started successfully. Fill only the Marks Obtained column, save the file, then upload it here.' });
        } catch (error) {
            console.error("Error downloading Excel template", error);
            setExcelMessage({ type: 'error', text: error.response?.data?.error || "Failed to download Excel template." });
        } finally {
            setIsDownloadingExcel(false);
        }
    };

    const handleUploadExcel = async () => {
        if (!selectedClass || !selectedExam || !selectedAssignment) {
            alert("Please choose class, exam type, and subject first.");
            return;
        }
        if (!excelFile) {
            alert("Please choose an Excel file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', excelFile);
        formData.append('exam_id', selectedExam);

        setIsUploadingExcel(true);
        setExcelMessage({ type: 'info', text: 'Uploading Excel and updating marks. Please wait until this finishes.' });
        try {
            const response = await api.post('subject-teacher/marks-upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setExcelUploadResult(response.data);
            setExcelFile(null);
            setExcelInputKey(prev => prev + 1);
            fetchData();
            setExcelMessage({
                type: response.data.failed > 0 ? 'warning' : 'success',
                text: `Excel uploaded successfully. Saved ${response.data.saved} row(s), failed ${response.data.failed}.`
            });
        } catch (error) {
            console.error("Error uploading Excel", error);
            setExcelMessage({ type: 'error', text: error.response?.data?.error || "Failed to upload Excel." });
        } finally {
            setIsUploadingExcel(false);
        }
    };

    return (
        <div className="dashboard-layout">
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <h1 className="page-title" style={{ margin: 0 }}>My Subjects & Marks</h1>
                        {isFetching && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                <div style={{ width: '1rem', height: '1rem', border: '2px solid #bfdbfe', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                Fetching data...
                            </div>
                        )}
                        {fetchSuccess && !isFetching && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✔</span> Data fetched successfully
                            </div>
                        )}
                    </div>
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
                            </div>

                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Class</label>
                                    <select
                                        className="form-input"
                                        value={selectedClass}
                                        onChange={e => {
                                            setSelectedClass(e.target.value);
                                            setSelectedSubject('');
                                            setSelectedExam('');
                                            setExcelUploadResult(null);
                                            setExcelMessage(null);
                                        }}
                                    >
                                        <option value="">Choose Class...</option>
                                        {assignedClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Exam Type</label>
                                    <select className="form-input" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                                        <option value="">Choose Exam...</option>
                                        {examsForSelectedClass.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0" style={{ flexGrow: 1 }}>
                                    <label className="form-label">Subject</label>
                                    <select className="form-input" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                        <option value="">Choose Subject...</option>
                                        {assignmentsForSelectedClass.map(a => <option key={a.id} value={a.id}>{a.subject_name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group mb-0" style={{ flexBasis: '100%' }}>
                                    <label className="form-label">Marks Entry</label>
                                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', padding: '0.85rem', borderRadius: '8px', marginBottom: '0.75rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                        <strong>Two ways to enter marks:</strong>
                                        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.25rem' }}>
                                            <li><strong>Option 1 (Directly Below):</strong> Simply type the marks in the table below. It will automatically save when you press Enter or move to the next cell.</li>
                                            <li><strong>Option 2 (Using Excel):</strong> Follow these steps:</li>
                                        </ul>
                                        <ol style={{ margin: '0', paddingLeft: '2.5rem' }}>
                                            <li>Choose the class, exam type, and subject above.</li>
                                            <li>Click Download Excel. Open the downloaded file and enter marks only in the <em>Marks Obtained</em> column.</li>
                                            <li>Save the Excel file as .xlsx without changing any other columns.</li>
                                            <li>Select the saved file here and click Upload. The system will automatically update the marks.</li>
                                        </ol>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={handleDownloadExcel}
                                            disabled={isDownloadingExcel || isUploadingExcel}
                                        >
                                            {isDownloadingExcel ? 'Preparing...' : 'Download Excel'}
                                        </button>
                                        <input
                                            key={excelInputKey}
                                            type="file"
                                            accept=".xlsx"
                                            className="form-input"
                                            style={{ maxWidth: '280px', margin: 0 }}
                                            onChange={e => setExcelFile(e.target.files?.[0] || null)}
                                            disabled={isUploadingExcel || isDownloadingExcel}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-primary"
                                            onClick={handleUploadExcel}
                                            disabled={isUploadingExcel || isDownloadingExcel}
                                        >
                                            {isUploadingExcel ? 'Uploading...' : 'Upload'}
                                        </button>
                                    </div>
                                    {(isDownloadingExcel || isUploadingExcel) && (
                                        <div style={{ marginTop: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                                                <span>{isDownloadingExcel ? 'Download starting...' : 'Upload in progress...'}</span>
                                                <span>Please wait</span>
                                            </div>
                                            <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', width: '100%', background: 'linear-gradient(90deg, #2563eb, #22c55e)', borderRadius: '999px' }} />
                                            </div>
                                        </div>
                                    )}
                                    {excelMessage && (
                                        <div
                                            style={{
                                                marginTop: '0.75rem',
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                border: `1px solid ${excelMessage.type === 'error' ? '#fecaca' : excelMessage.type === 'warning' ? '#fde68a' : excelMessage.type === 'success' ? '#bbf7d0' : '#bfdbfe'}`,
                                                background: excelMessage.type === 'error' ? '#fef2f2' : excelMessage.type === 'warning' ? '#fffbeb' : excelMessage.type === 'success' ? '#f0fdf4' : '#eff6ff',
                                                color: excelMessage.type === 'error' ? '#991b1b' : excelMessage.type === 'warning' ? '#92400e' : excelMessage.type === 'success' ? '#166534' : '#1e3a8a',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            {excelMessage.text}
                                        </div>
                                    )}
                                    {excelUploadResult && (
                                        <div style={{ marginTop: '0.75rem', color: '#334155', fontSize: '0.9rem' }}>
                                            Processed {excelUploadResult.processed} rows. Saved {excelUploadResult.saved}. Failed {excelUploadResult.failed}.
                                            {excelUploadResult.failed_rows?.length > 0 && (
                                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
                                                    {excelUploadResult.failed_rows.slice(0, 5).map(item => (
                                                        <li key={`${item.row}-${item.reason}`}>Row {item.row}: {item.reason}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedExam && selectedSubject ? (
                                <div className="table-wrapper">
                                    <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '1.1rem' }}>
                                            Entering marks for Class: <strong>{selectedAssignment?.classroom_name}</strong> | Subject: <strong>{selectedAssignment?.subject_name}</strong>
                                        </h4>
                                        {Object.values(savingStates).includes('saving') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                <div style={{ width: '1rem', height: '1rem', border: '2px solid #bfdbfe', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                Saving...
                                            </div>
                                        )}
                                        {Object.values(savingStates).includes('saved') && !Object.values(savingStates).includes('saving') && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>✔</span> All changes saved
                                            </div>
                                        )}
                                    </div>
                                    <table>
                                        <thead><tr><th>Student Name</th><th>Roll No</th><th>Full Marks</th><th>Marks</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {filteredStudents.map((s, index) => (
                                                <tr key={s.id}>
                                                    <td>{s.name}</td>
                                                    <td>{s.roll_number || '-'}</td>
                                                    <td>{selectedExamObj?.full_marks || '-'}</td>
                                                    <td>
                                                        <input
                                                            ref={el => inputRefs.current[index] = el}
                                                            type="number"
                                                            className="form-input marks-input"
                                                            style={{ width: '100px', margin: 0, padding: '0.25rem 0.5rem', background: getExistingMarkValue(s.id) !== null ? '#f1f5f9' : 'white' }}
                                                            value={marksInput[s.id] !== undefined ? marksInput[s.id] : (getExistingMarkValue(s.id) !== null ? getExistingMarkValue(s.id) : '')}
                                                            onChange={e => setMarksInput(prev => ({ ...prev, [s.id]: e.target.value }))}
                                                            onKeyDown={e => handleKeyDown(e, index, s.id)}
                                                            onBlur={e => handleBlur(s.id, e.target.value)}
                                                            placeholder="Enter mark"
                                                        />
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                                                            {savingStates[s.id] === 'saving' && (
                                                                <div style={{ width: '1rem', height: '1rem', border: '2px solid #e2e8f0', borderTop: '2px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                            )}
                                                            {savingStates[s.id] === 'saved' && (
                                                                <span style={{ color: '#22c55e', fontSize: '1.2rem', lineHeight: 1 }}>✔</span>
                                                            )}
                                                            {savingStates[s.id] === 'error' && (
                                                                <span style={{ color: '#ef4444', fontSize: '1.2rem', lineHeight: 1 }}>❌</span>
                                                            )}
                                                        </div>
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
