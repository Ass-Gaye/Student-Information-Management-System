/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Edit2, Trash2, Mail, Phone, MapPin, Calendar, Award, User, RefreshCw, ChevronLeft, ChevronRight, X, Info } from 'lucide-react';
import { Student, Department, UserRole } from '../types';

interface StudentModuleProps {
  token: string;
  userRole: UserRole;
  associatedId?: number;
}

export default function StudentModule({ token, userRole, associatedId }: StudentModuleProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Sorting
  const [sortBy, setSortBy] = useState('lastName');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form Fields
  const [studentNumber, setStudentNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('Male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [admissionDate, setAdmissionDate] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'GRADUATED'>('ACTIVE');
  const [departmentId, setDepartmentId] = useState('');

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      // If user is STUDENT, they can only load their own record!
      if (userRole === 'STUDENT' && associatedId) {
        const res = await fetch(`/api/students/${associatedId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch student record');
        const data = await res.json();
        setStudents([data]);
        setTotalElements(1);
        setTotalPages(1);
      } else {
        // Admin or Lecturer - fetch all paginated
        const url = `/api/students?search=${encodeURIComponent(search)}&departmentId=${deptFilter}&status=${statusFilter}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=5`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to load students directory');
        const data = await res.json();
        setStudents(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [token, search, deptFilter, statusFilter, page, sortBy, sortOrder, userRole, associatedId]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedStudent(null);
    setStudentNumber('STU' + Date.now().toString().slice(-7));
    setFirstName('');
    setLastName('');
    setGender('Male');
    setDateOfBirth('2004-01-01');
    setPhoneNumber('');
    setEmail('');
    setAddress('');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setStatus('ACTIVE');
    setDepartmentId(departments[0]?.id.toString() || '');
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (student: Student) => {
    setModalMode('edit');
    setSelectedStudent(student);
    setStudentNumber(student.studentNumber);
    setFirstName(student.firstName);
    setLastName(student.lastName);
    setGender(student.gender);
    setDateOfBirth(student.dateOfBirth);
    setPhoneNumber(student.phoneNumber);
    setEmail(student.email);
    setAddress(student.address);
    setAdmissionDate(student.admissionDate);
    setStatus(student.status);
    setDepartmentId(student.departmentId.toString());
    setShowModal(true);
    setError('');
  };

  const handleOpenView = (student: Student) => {
    setModalMode('view');
    setSelectedStudent(student);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you absolutely sure you want to delete this student and their enrollments? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete student');

      setSuccessMsg('Student and linked records deleted successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!firstName || !lastName || !email || !departmentId) {
      setError('Please fill in all required fields.');
      return;
    }

    const payload = {
      studentNumber,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      email,
      address,
      admissionDate,
      status,
      departmentId: Number(departmentId)
    };

    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const endpoint = modalMode === 'create' ? '/api/students' : `/api/students/${selectedStudent?.id}`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Validation or constraints error');

      setSuccessMsg(modalMode === 'create' ? 'Student registered successfully' : 'Student details updated successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchStudents();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getDeptCode = (id: number) => {
    return departments.find(d => d.id === id)?.code || `DEPT ${id}`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">
            {userRole === 'STUDENT' ? 'My Student Profile' : 'Students Directory'}
          </h1>
          <p className="text-xs text-slate-500">
            {userRole === 'STUDENT' ? 'View and verify your registered academic credentials' : 'Manage student enrollments, academic details, and personal records'}
          </p>
        </div>
        {userRole !== 'STUDENT' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl border border-transparent shadow-md shadow-indigo-100 transition-colors cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            Add New Student
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

      {/* Filters (Only for ADMIN/LECTURER) */}
      {userRole !== 'STUDENT' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute inset-y-0 left-3 h-4.5 w-4.5 text-slate-400 self-center m-auto" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by student number, name, email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder-slate-400"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="GRADUATED">GRADUATED</option>
            </select>
            <button
              onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter(''); setPage(1); }}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Directory Table / Single Profile Card */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-100 text-slate-400">
          <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">No students found matching your criteria</p>
        </div>
      ) : userRole === 'STUDENT' ? (
        /* Student Profile View */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-900" />
          <div className="px-6 pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-16 mb-6">
              <div className="h-28 w-28 bg-white p-1 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
                <div className="h-full w-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-3xl font-display">
                  {students[0].firstName[0]}{students[0].lastName[0]}
                </div>
              </div>
              <div className="space-y-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {students[0].status}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  {students[0].firstName} {students[0].lastName}
                </h2>
                <p className="text-sm font-mono text-slate-500">Student ID: {students[0].studentNumber}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 border-t border-slate-100 pt-6 text-sm">
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider">Academic Information</h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <Award className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Department</span>
                    <span className="font-semibold">{getDeptCode(students[0].departmentId)} Department</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Date of Admission</span>
                    <span>{students[0].admissionDate}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider">Contact Information</h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Email Address</span>
                    <span>{students[0].email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Phone Number</span>
                    <span>{students[0].phoneNumber || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 uppercase text-xs tracking-wider">Personal Information</h3>
                <div className="flex items-center gap-3 text-slate-600">
                  <User className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Gender & DOB</span>
                    <span>{students[0].gender} — Born {students[0].dateOfBirth}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <MapPin className="h-4 w-4 text-indigo-500" />
                  <div>
                    <span className="text-xs text-slate-400 block">Address</span>
                    <span>{students[0].address || 'Not specified'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Admin/Lecturer Paginated Directory View */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase border-b border-slate-100">
                <tr>
                  <th onClick={() => toggleSort('studentNumber')} className="py-3 px-4 cursor-pointer hover:bg-slate-100">
                    Student No. {sortBy === 'studentNumber' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => toggleSort('lastName')} className="py-3 px-4 cursor-pointer hover:bg-slate-100">
                    Full Name {sortBy === 'lastName' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">{student.studentNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{student.firstName} {student.lastName}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{student.gender} | DOB: {student.dateOfBirth}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-md">
                        {getDeptCode(student.departmentId)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium text-xs">{student.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        student.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : student.status === 'GRADUATED'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : 'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <button
                          onClick={() => handleOpenView(student)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Info className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {userRole === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{students.length}</strong> of{' '}
              <strong className="text-slate-800">{totalElements}</strong> students
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Student Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-950 font-display">
                {modalMode === 'create' ? 'Register New Student' : modalMode === 'edit' ? 'Modify Student Record' : 'Student Credential Certificate'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="p-4 mx-6 mt-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
                {error}
              </div>
            )}

            {modalMode === 'view' && selectedStudent ? (
              /* View Detail Mode */
              <div className="p-6 space-y-6">
                <div className="flex gap-4 items-center">
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-600 font-bold text-xl rounded-xl flex items-center justify-center">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg text-slate-900">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
                    <p className="text-xs text-slate-500 font-mono">No. {selectedStudent.studentNumber} | Status: <strong className="text-emerald-600">{selectedStudent.status}</strong></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm border-t border-slate-100 pt-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Department</span>
                    <span className="font-semibold text-slate-800">{getDeptCode(selectedStudent.departmentId)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Admission Date</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.admissionDate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Email Address</span>
                    <span className="font-semibold text-indigo-600">{selectedStudent.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Phone Number</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.phoneNumber || 'Not provided'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Date of Birth</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.dateOfBirth} ({selectedStudent.gender})</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Residential Address</span>
                    <span className="font-semibold text-slate-800">{selectedStudent.address || 'Not provided'}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs hover:bg-slate-200 cursor-pointer">
                    Close Sheet
                  </button>
                </div>
              </div>
            ) : (
              /* Create/Edit Form Mode */
              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Student Number (Constraint)</label>
                    <input
                      type="text"
                      disabled={modalMode === 'edit'}
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                      required
                    />
                  </div>
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
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admission Date</label>
                    <input
                      type="date"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {modalMode === 'edit' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Admission Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="GRADUATED">GRADUATED</option>
                      </select>
                    </div>
                  )}
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
                    {modalMode === 'create' ? 'Register Student' : 'Save Adjustments'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
