/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, UserCheck, Trash2, Edit, Plus, Layers, Award, Calendar, RefreshCw, X } from 'lucide-react';
import { Course, Lecturer, Department, UserRole } from '../types';

interface CourseModuleProps {
  token: string;
  userRole: UserRole;
  associatedId?: number;
}

export default function CourseModule({ token, userRole, associatedId }: CourseModuleProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [creditHours, setCreditHours] = useState('3');
  const [semester, setSemester] = useState('Fall');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [departmentId, setDepartmentId] = useState('');
  const [lecturerId, setLecturerId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [coursesRes, lecturersRes, departmentsRes] = await Promise.all([
        fetch('/api/courses', { headers }),
        fetch('/api/lecturers', { headers }),
        fetch('/api/departments', { headers })
      ]);

      if (!coursesRes.ok || !lecturersRes.ok || !departmentsRes.ok) {
        throw new Error('Failed to load course information records.');
      }

      const cData = await coursesRes.json();
      const lData = await lecturersRes.json();
      const dData = await departmentsRes.json();

      setCourses(cData);
      setLecturers(lData);
      setDepartments(dData);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedCourse(null);
    setCourseCode('');
    setCourseName('');
    setCreditHours('3');
    setSemester('Fall');
    setAcademicYear('2025/2026');
    setDepartmentId(departments[0]?.id.toString() || '');
    setLecturerId('');
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (course: Course) => {
    setModalMode('edit');
    setSelectedCourse(course);
    setCourseCode(course.courseCode);
    setCourseName(course.courseName);
    setCreditHours(course.creditHours.toString());
    setSemester(course.semester);
    setAcademicYear(course.academicYear);
    setDepartmentId(course.departmentId.toString());
    setLecturerId(course.lecturerId ? course.lecturerId.toString() : '');
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this course? Doing so will also clear all linked student enrollments.')) return;
    try {
      const res = await fetch(`/api/courses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete course');
      }

      setSuccessMsg('Course and enrollment records purged successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!courseCode || !courseName || !creditHours || !departmentId) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      courseCode,
      courseName,
      creditHours: Number(creditHours),
      semester,
      academicYear,
      departmentId: Number(departmentId),
      lecturerId: lecturerId ? Number(lecturerId) : undefined
    };

    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const endpoint = modalMode === 'create' ? '/api/courses' : `/api/courses/${selectedCourse?.id}`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Validation/Constraints error saving course details');

      setSuccessMsg(modalMode === 'create' ? 'Course successfully published to catalog' : 'Course details modified successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getDeptCode = (id: number) => {
    return departments.find(d => d.id === id)?.code || `DEPT ${id}`;
  };

  const getLecturerName = (id?: number) => {
    if (!id) return 'TBA (Unassigned)';
    const lec = lecturers.find(l => l.id === id);
    return lec ? `Dr. ${lec.firstName} ${lec.lastName}` : `Lec #${id}`;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Courses Catalog</h1>
          <p className="text-xs text-slate-500">View academic syllabus requirements, assign credits, and organize faculty instructors</p>
        </div>
        {userRole !== 'STUDENT' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add New Course
          </button>
        )}
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
      ) : courses.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-100 text-slate-400">
          <BookOpen className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">No courses matching standard criteria exist in directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course) => (
            <div key={course.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    {course.courseCode}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md">
                    {getDeptCode(course.departmentId)}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1" title={course.courseName}>
                    {course.courseName}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium text-slate-600">{getLecturerName(course.lecturerId)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-3 text-[11px] text-slate-500 font-medium">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Credits</span>
                    <span className="font-bold text-slate-800">{course.creditHours} Hrs</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Term</span>
                    <span className="font-bold text-slate-800">{course.semester}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-400">Year</span>
                    <span className="font-bold text-slate-800">{course.academicYear.split('/')[0]}</span>
                  </div>
                </div>
              </div>

              {userRole !== 'STUDENT' && (
                <div className="flex justify-end gap-2 border-t border-slate-50 mt-4 pt-3">
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {userRole === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CRUD Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-950 font-display">
                {modalMode === 'create' ? 'Publish Course Syllabus' : 'Revise Course Requirements'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Code (Unique)</label>
                  <input
                    type="text"
                    placeholder="e.g. CS101"
                    disabled={modalMode === 'edit'}
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={creditHours}
                    onChange={(e) => setCreditHours(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Programming"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Department</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Faculty Lecturer</label>
                  <select
                    value={lecturerId}
                    onChange={(e) => setLecturerId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">TBA (Unassigned)</option>
                    {lecturers.map(l => (
                      <option key={l.id} value={l.id}>Dr. {l.firstName} {l.lastName} ({getDeptCode(l.departmentId)})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Semester Term</label>
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
                    placeholder="e.g. 2025/2026"
                    required
                  />
                </div>
              </div>

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
                  {modalMode === 'create' ? 'Publish Course' : 'Publish Revisions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
