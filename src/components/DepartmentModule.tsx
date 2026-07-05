/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { Department, UserRole } from '../types';

interface DepartmentModuleProps {
  token: string;
  userRole: UserRole;
}

export default function DepartmentModule({ token, userRole }: DepartmentModuleProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load departments');
      const data = await res.json();
      setDepartments(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [token]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedDept(null);
    setName('');
    setCode('');
    setDescription('');
    setShowModal(true);
    setError('');
  };

  const handleOpenEdit = (dept: Department) => {
    setModalMode('edit');
    setSelectedDept(dept);
    setName(dept.name);
    setCode(dept.code);
    setDescription(dept.description);
    setShowModal(true);
    setError('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department? Doing so requires no students or courses depend on it.')) return;
    try {
      const res = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to remove department');

      setSuccessMsg('Department removed successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !code) {
      setError('Please fill in Name and Code.');
      return;
    }

    try {
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const endpoint = modalMode === 'create' ? '/api/departments' : `/api/departments/${selectedDept?.id}`;

      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, code, description })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Validation or database error');

      setSuccessMsg(modalMode === 'create' ? 'Department created successfully' : 'Department adjusted successfully');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowModal(false);
      fetchDepartments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">University Departments</h1>
          <p className="text-xs text-slate-500">Configure academic faculties, departments codes, and description files</p>
        </div>
        {userRole === 'ADMIN' && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Department
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
      ) : departments.length === 0 ? (
        <div className="bg-white text-center py-12 rounded-2xl border border-slate-100 text-slate-400">
          <Layers className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-sm">No departments registers recorded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                    {dept.code}
                  </span>
                  <Layers className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{dept.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3">{dept.description || 'No description provided.'}</p>
                </div>
              </div>

              {userRole === 'ADMIN' && (
                <div className="flex justify-end gap-1.5 border-t border-slate-50 mt-4 pt-3">
                  <button
                    onClick={() => handleOpenEdit(dept)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CRUD Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-100 shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-950 font-display">
                {modalMode === 'create' ? 'Create Department Faculty' : 'Modify Department details'}
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

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Code</label>
                  <input
                    type="text"
                    placeholder="CS"
                    disabled={modalMode === 'edit'}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Faculty / Dept Name</label>
                  <input
                    type="text"
                    placeholder="Computer Science"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24 resize-none"
                  placeholder="Provide department description details..."
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
                  {modalMode === 'create' ? 'Create Faculty' : 'Save Adjustments'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
