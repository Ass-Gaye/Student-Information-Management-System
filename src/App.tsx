/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  BookOpen, 
  Layers, 
  Database, 
  Terminal, 
  Code, 
  LogOut, 
  ChevronRight, 
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

import { UserRole } from './types';
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import StudentModule from './components/StudentModule';
import LecturerModule from './components/LecturerModule';
import CourseModule from './components/CourseModule';
import EnrollmentModule from './components/EnrollmentModule';
import DepartmentModule from './components/DepartmentModule';
import DatabaseSchemaView from './components/DatabaseSchemaView';
import ApiPlayground from './components/ApiPlayground';
import SpringBootViewer from './components/SpringBootViewer';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: number; username: string; role: UserRole; email: string; associatedId?: number } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if session token exists in local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('sims_token');
    const storedUser = localStorage.getItem('sims_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('sims_token', newToken);
    localStorage.setItem('sims_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sims_token');
    localStorage.removeItem('sims_user');
    setActiveTab('dashboard');
  };

  // Auth Guard Screen
  if (!token || !user) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar Menu Definitions
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'students', label: user.role === 'STUDENT' ? 'My Student Profile' : 'Students List', icon: Users, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'lecturers', label: user.role === 'LECTURER' ? 'My Lecturer Profile' : 'Lecturers List', icon: UserCheck, roles: ['ADMIN', 'LECTURER'] },
    { id: 'courses', label: 'Courses Catalog', icon: BookOpen, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'enrollments', label: 'Enrollments Ledger', icon: Layers, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'departments', label: 'Departments List', icon: Layers, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'er-diagram', label: 'ER Relations Diagram', icon: Database, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'api-playground', label: 'REST API Playground', icon: Terminal, roles: ['ADMIN', 'LECTURER', 'STUDENT'] },
    { id: 'spring-boot', label: 'Spring Boot Source', icon: Code, roles: ['ADMIN', 'LECTURER', 'STUDENT'] }
  ];

  const visibleNavItems = navigationItems.filter(item => item.roles.includes(user.role));

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView token={token} userRole={user.role} associatedId={user.associatedId} />;
      case 'students':
        return <StudentModule token={token} userRole={user.role} associatedId={user.associatedId} />;
      case 'lecturers':
        return <LecturerModule token={token} userRole={user.role} associatedId={user.associatedId} />;
      case 'courses':
        return <CourseModule token={token} userRole={user.role} associatedId={user.associatedId} />;
      case 'enrollments':
        return <EnrollmentModule token={token} userRole={user.role} associatedId={user.associatedId} />;
      case 'departments':
        return <DepartmentModule token={token} userRole={user.role} />;
      case 'er-diagram':
        return <DatabaseSchemaView />;
      case 'api-playground':
        return <ApiPlayground token={token} />;
      case 'spring-boot':
        return <SpringBootViewer />;
      default:
        return <DashboardView token={token} userRole={user.role} associatedId={user.associatedId} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <header className="md:hidden bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-indigo-400" />
          <span className="font-bold font-display tracking-tight text-base">SIMS Portal</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation Drawer */}
      <nav className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        fixed md:relative inset-0 md:inset-auto z-40 md:z-auto
        w-64 bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out h-full md:h-screen
      `}>
        <div className="flex flex-col overflow-y-auto">
          {/* Brand Row (Desktop) */}
          <div className="hidden md:flex items-center gap-3 px-6 py-6 border-b border-slate-800/60">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-900/30">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight font-display text-slate-100">SIMS Admin</h2>
              <span className="text-[10px] text-indigo-300 font-semibold tracking-wider uppercase">Portal Console</span>
            </div>
          </div>

          {/* User Profile Summary */}
          <div className="p-4 mx-4 my-4 bg-slate-950 border border-slate-800/40 rounded-2xl flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl text-white font-bold flex items-center justify-center text-sm font-display uppercase">
              {user.username.slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-slate-200 truncate">{user.username}</h4>
              <span className="inline-block bg-indigo-950 text-indigo-400 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5 border border-indigo-900/40">
                {user.role}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800/60 bg-slate-950/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700/40 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Workspace Stage */}
      <main className="flex-1 md:h-screen md:overflow-y-auto px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto w-full">
        {renderActiveTabContent()}
      </main>

    </div>
  );
}
