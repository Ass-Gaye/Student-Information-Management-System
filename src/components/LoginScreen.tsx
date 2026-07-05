/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Key, Mail, User as UserIcon, GraduationCap, ArrowRight, Activity, BookOpen } from 'lucide-react';
import { UserRole } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (token: string, user: { id: number; username: string; role: UserRole; email: string; associatedId?: number }) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [associatedId, setAssociatedId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'ADMIN', label: 'Administrator Account', icon: Shield, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { username: 'alan_turing', password: 'lecturer123', role: 'LECTURER', label: 'Dr. Alan Turing (Lecturer)', icon: BookOpen, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { username: 'alice_smith', password: 'student123', role: 'STUDENT', label: 'Alice Smith (Student)', icon: GraduationCap, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  ];

  const handleDemoClick = (account: typeof demoAccounts[0]) => {
    setUsername(account.username);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || (isRegister && !email)) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister 
        ? { username, password, email, role, associatedId: associatedId ? Number(associatedId) : undefined }
        : { username, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during authentication.');
      }

      onLoginSuccess(data.token, data.user);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 text-white mb-4">
          <GraduationCap className="h-10 w-10" id="brand-logo" />
        </div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">
          SIMS Portal
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Student Information Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl shadow-slate-100 rounded-2xl border border-slate-100 sm:px-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-sm text-rose-600 flex items-start gap-3">
              <Activity className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="username">
                Username
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-4 w-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {isRegister && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700" htmlFor="email">
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="you@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    System Access Role
                  </label>
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {(['STUDENT', 'LECTURER', 'ADMIN'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2.5 px-3 border rounded-xl text-xs font-semibold text-center transition-all ${
                          role === r
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {role !== 'ADMIN' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700" htmlFor="associatedId">
                      Linked Entity ID (e.g., studentId or lecturerId)
                    </label>
                    <input
                      id="associatedId"
                      type="number"
                      value={associatedId}
                      onChange={(e) => setAssociatedId(e.target.value)}
                      className="mt-1 block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="e.g. 1"
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Links this user login to a matching student/lecturer record.
                    </p>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Key className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500 font-medium">Or quick login via presets</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2.5">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.username}
                    type="button"
                    onClick={() => handleDemoClick(account)}
                    className={`flex items-center justify-between p-3 border rounded-xl text-left hover:shadow-sm transition-all text-xs font-medium cursor-pointer ${account.color}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 shrink-0" />
                      <div>
                        <div className="font-semibold text-slate-900">{account.label}</div>
                        <div className="text-[10px] text-slate-500">Username: {account.username} | Password: {account.password}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold border border-current px-2 py-0.5 rounded-full tracking-wider shrink-0">
                      {account.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register instead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
