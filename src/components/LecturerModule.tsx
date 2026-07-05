/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserCheck, BookOpen, Mail, Phone, MapPin, Plus, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { Lecturer, Department, Course, UserRole } from '../types';

interface LecturerModuleProps {
  token: string;
  userRole: UserRole;
  associatedId?: number;
}

export default function LecturerModule({ token, userRole, associatedId }: LecturerModuleProps) {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLecturer, setSelectedLecturer] = useState<Lecturer | null>(null);

  const [staffNumber, setStaffNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [office, setOffice] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [lectRes, deptRes, courseRes] = await Promise.all([
        fetch('/api/lecturers', { headers }),
        fetch('/api/departments', { headers }),
        fetch('/api/courses', { headers })
      ]);

      if (!lectRes.ok || !deptRes.ok || !courseRes.ok) {
        throw new Error('Failed to load lecturers or associated resources');
      }

      const lData = await lectRes.json();
      const dData = await deptRes.json();
      const cData = await courseRes.json();

      setDepartments(dData);
      setCourses(cData);

      if (userRole === 'LECTURER' && associatedId) {
        // filter down to only their own profile
        const self = lData.find((l: Lecturer) => l.id === associatedId);
        setLecturers(self ? [self] : []);
      } else {
        setLecturers(lData);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token, userRole, associatedId]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedLecturer(null);
    setStaffNumber('LEC00' + (lecturers.length + 1));
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhoneNumber('');
    setOffice('');
    setDepartmentId(departments[0]?.id.toString() || '');
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (lecturer: Lecturer) => {
    setModalMode('edit');
    setSelectedLecturer(lecturer);
    setStaffNumber(lecturer.staffNumber);
    setFirstName(lecturer.firstName);
    setLastName(lecturer.lastName);
    setEmail(lecturer.email);
    setPhoneNumber(lecturer.phoneNumber);
    setOffice(lecturer.office);
    setDepartmentId(lecturer.departmentId.toString());
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this lecturer? All assigned courses will be unassigned.')) return;
    try {
      const res = await fetch(`/api/lecturers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to remove lecturer');
      }

      setSuccessMsg('Lecturer deleted and assigned courses reset successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !staffNumber || !departmentId) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      staffNumber,
      firstName,
      lastName,
      email,
      phoneNumber,
      office,
      departmentId: Number(departmentId)
    };

    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const endpoint = modalMode === 'create' ? '/api/lecturers' : `/api/lecturers/${selectedLecturer?.id}`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error occurred while saving lecturer details.');

      setSuccessMsg(modalMode === 'create' ? 'Lecturer profile created' : 'Lecturer profile updated');
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

  const getAssignedCourses = (lectId: number) => {
    return courses.filter(c => c.lecturerId === lectId);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
            {userRole === 'LECTURER' ? 'My Lecturer Profile' : 'Lecturers Directory'}
          </h1>
          <p className="text-xs text-slate-500">
            {userRole === 'LECTURER' ? 'Inspect your designated courses and contact information' : 'Organize university faculty staff, assign courses, and view teaching offices'}
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Lecturer
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
      ) : lecturers.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-100 text-slate-400">
          <UserCheck className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">No lecturers records currently available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lecturers.map((lec) => {
            const assigned = getAssignedCourses(lec.id);
            return (
              <div key={lec.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Top line name & actions */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-indigo-50 text-indigo-600 font-bold text-lg rounded-xl flex items-center justify-center">
                        {lec.firstName[0]}{lec.lastName[0]}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                          {getDeptCode(lec.departmentId)}
                        </span>
                        <h3 className="font-bold text-slate-900 mt-1">{lec.firstName} {lec.lastName}</h3>
                        <p className="text-xs text-slate-500 font-mono">ID: {lec.staffNumber}</p>
                      </div>
                    </div>

                    {userRole === 'ADMIN' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenEdit(lec)}
                          className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(lec.id)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Details block */}
                  <div className="space-y-2 border-t border-b border-slate-100 py-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lec.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{lec.phoneNumber || 'No phone number'}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      <span>Office: <strong className="text-slate-800">{lec.office || 'Unassigned'}</strong></span>
                    </div>
                  </div>

                  {/* Teaching Schedule */}
                  <div className="space-y-2 pt-1">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                      Teaching Schedule ({assigned.length} Courses)
                    </h4>
                    {assigned.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No courses currently assigned for this academic year.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {assigned.map(c => (
                          <span key={c.id} className="inline-flex items-center px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg" title={c.courseName}>
                            {c.courseCode}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CRUD Lecturer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-950 font-display">
                {modalMode === 'create' ? 'Create Lecturer Profile' : 'Modify Lecturer Profile'}
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Staff Number (Constraint)</label>
                  <input
                    type="text"
                    disabled={modalMode === 'edit'}
                    value={staffNumber}
                    onChange={(e) => setStaffNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faculty Department</label>
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
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Office Room / Suite</label>
                <input
                  type="text"
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Turing Hall 301"
                />
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
                  {modalMode === 'create' ? 'Register Lecturer' : 'Save Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
