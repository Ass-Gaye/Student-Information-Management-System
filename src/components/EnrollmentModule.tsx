/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, UserCheck, Plus, Trash2, Calendar, Award, RefreshCw, X, Edit2, AlertCircle } from 'lucide-react';
import { Enrollment, Student, Course, UserRole } from '../types';

interface EnrollmentModuleProps {
  token: string;
  userRole: UserRole;
  associatedId?: number;
}

export default function EnrollmentModule({ token, userRole, associatedId }: EnrollmentModuleProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'enroll' | 'grade'>('enroll');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semester, setSemester] = useState('Spring');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState<'ENROLLED' | 'COMPLETED' | 'DROPPED'>('ENROLLED');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [enrollRes, studentsRes, coursesRes] = await Promise.all([
        fetch('/api/enrollments', { headers }),
        fetch('/api/students', { headers }),
        fetch('/api/courses', { headers })
      ]);

      if (!enrollRes.ok || !studentsRes.ok || !coursesRes.ok) {
        throw new Error('Failed to load enrollment ledger files.');
      }

      const eData = await enrollRes.json();
      const sData = await studentsRes.json();
      const cData = await coursesRes.json();

      setCourses(cData);
      setStudents(sData.content || sData);

      if (userRole === 'STUDENT' && associatedId) {
        // Only load enrollments for this student
        setEnrollments(eData.filter((e: Enrollment) => e.studentId === associatedId));
      } else {
        setEnrollments(eData);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, userRole, associatedId]);

  const handleOpenEnroll = () => {
    setModalMode('enroll');
    setSelectedEnrollment(null);
    setStudentId(userRole === 'STUDENT' ? String(associatedId) : (students[0]?.id.toString() || ''));
    setCourseId(courses[0]?.id.toString() || '');
    setSemester('Spring');
    setAcademicYear('2025/2026');
    setStatus('ENROLLED');
    setShowModal(true);
    setError('');
  };

  const handleOpenGrade = (enrollment: Enrollment) => {
    setModalMode('grade');
    setSelectedEnrollment(enrollment);
    setGrade(enrollment.grade || 'A');
    setStatus(enrollment.status);
    setShowModal(true);
    setError('');
  };

  const handleDrop = async (enrollId: number) => {
    if (!window.confirm('Are you sure you want to drop this course? Your academic progress will be archived.')) return;
    try {
      const res = await fetch(`/api/enrollments/${enrollId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'DROPPED' })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to drop course');
      }

      setSuccessMsg('Course dropped successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (enrollId: number) => {
    if (!window.confirm('Admin Action: Permanently delete this enrollment record?')) return;
    try {
      const res = await fetch(`/api/enrollments/${enrollId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to purge record');
      }

      setSuccessMsg('Enrollment record permanently deleted.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (modalMode === 'enroll') {
        const payload = {
          studentId: Number(studentId),
          courseId: Number(courseId),
          semester,
          academicYear,
          status: 'ENROLLED'
        };

        const res = await fetch('/api/enrollments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Duplicate or constraints error');

        setSuccessMsg('Successfully enrolled in course');
      } else {
        // Grade updating
        const payload = {
          grade: grade || undefined,
          status
        };

        const res = await fetch(`/api/enrollments/${selectedEnrollment?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update grades');

        setSuccessMsg('Academic grades and status published successfully');
      }

      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStudentName = (id: number) => {
    const s = students.find(item => item.id === id);
    return s ? `${s.firstName} ${s.lastName} (${s.studentNumber})` : `Student #${id}`;
  };

  const getCourseCode = (id: number) => {
    const c = courses.find(item => item.id === id);
    return c ? `${c.courseCode} — ${c.courseName}` : `Course #${id}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Enrollments Ledger</h1>
          <p className="text-xs text-slate-500">
            {userRole === 'STUDENT' ? 'Review your semester syllabus and grades achievements' : 'Enroll students, enter traditional final letters grading, and process course drops'}
          </p>
        </div>
        <button
          onClick={handleOpenEnroll}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          {userRole === 'STUDENT' ? 'Enroll in a Course' : 'Process New Enrollment'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {error && !showModal && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-100 text-slate-400">
          <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">No active or historic enrollments listed in ledger.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                <tr>
                  {userRole !== 'STUDENT' && <th className="py-3 px-4">Student</th>}
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Grade</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    {userRole !== 'STUDENT' && (
                      <td className="py-3 px-4 font-semibold text-slate-900">{getStudentName(e.studentId)}</td>
                    )}
                    <td className="py-3 px-4 font-medium text-slate-800">{getCourseCode(e.courseId)}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 font-semibold">{e.semester} {e.academicYear}</td>
                    <td className="py-3 px-4 text-center">
                      {e.grade ? (
                        <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                          {e.grade}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No Grade</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        e.status === 'ENROLLED'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : e.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        {userRole !== 'STUDENT' && e.status === 'ENROLLED' && (
                          <button
                            onClick={() => handleOpenGrade(e)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Assign Grade / Complete"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {e.status === 'ENROLLED' && (
                          <button
                            onClick={() => handleDrop(e.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Drop Course"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                            title="Admin: Purge Record"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Enroll/Grade Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-950 font-display">
                {modalMode === 'enroll' ? 'Student Registration Flow' : 'Syllabus Grading Board'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {modalMode === 'enroll' ? (
                /* Enroll Fields */
                <>
                  {userRole !== 'STUDENT' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Student</label>
                      <select
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        {students.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({s.studentNumber})</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                      <span className="text-slate-400 block font-semibold mb-0.5">Enrolling Self:</span>
                      <strong className="text-slate-800 text-sm">{getStudentName(Number(studentId))}</strong>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Select Course Catalog Code</label>
                    <select
                      value={courseId}
                      onChange={(e) => setCourseId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {courses.map(c => (
                        <option key={c.id} value={c.id}>{c.courseCode} — {c.courseName} ({c.creditHours} Credits)</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Semester</label>
                      <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="Fall">Fall</option>
                        <option value="Spring">Spring</option>
                        <option value="Summer">Summer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Academic Year</label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Grade Fields */
                <>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div>
                      <span className="text-slate-400 block">Student:</span>
                      <strong className="text-slate-800">{getStudentName(selectedEnrollment?.studentId || 0)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Course:</span>
                      <strong className="text-slate-800">{getCourseCode(selectedEnrollment?.courseId || 0)}</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Letter Grade Award</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    >
                      <option value="">No Grade Yet (In Progress)</option>
                      <option value="A">A (Excellent - 4.00)</option>
                      <option value="A-">A- (3.70)</option>
                      <option value="B+">B+ (3.30)</option>
                      <option value="B">B (Good - 3.00)</option>
                      <option value="B-">B- (2.70)</option>
                      <option value="C+">C+ (2.30)</option>
                      <option value="C">C (Satisfactory - 2.00)</option>
                      <option value="D">D (Poor - 1.00)</option>
                      <option value="F">F (Failing - 0.00)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Completion Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="ENROLLED">IN PROGRESS (ENROLLED)</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="DROPPED">DROPPED</option>
                    </select>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  {modalMode === 'enroll' ? 'Enroll Student' : 'Publish Academic Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
