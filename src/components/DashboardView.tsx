/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, Award, TrendingUp, RefreshCw, Circle, CheckCircle, UserCheck } from 'lucide-react';
import { DashboardStats, UserRole } from '../types';

interface DashboardViewProps {
  token: string;
  userRole: UserRole;
  associatedId?: number;
}

export default function DashboardView({ token, userRole, associatedId }: DashboardViewProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm">
        Failed to load dashboard metrics. Ensure the Express server is running. Error: {error}
      </div>
    );
  }

  // Find max counts for custom SVG scaling
  const maxDeptCount = Math.max(...stats.studentsPerDepartment.map(d => d.count), 1);
  const maxEnrollCount = Math.max(...stats.enrollmentBySemester.map(s => s.count), 1);
  const maxGradeCount = Math.max(...stats.gradeDistribution.map(g => g.count), 1);

  // Colors for donut/bar segments
  const deptColors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-sky-500'];
  const gradeColors = {
    'A': '#6366f1', // indigo
    'B': '#10b981', // emerald
    'C': '#f59e0b', // amber
    'D': '#3b82f6', // blue
    'F': '#ef4444'  // red
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-display tracking-tight">
            SIMS Dashboard Overview
          </h1>
          <p className="text-indigo-200 text-sm mt-1 max-w-xl">
            Welcome to the Student Information Management System. You are currently logged in with <span className="font-semibold px-2 py-0.5 rounded bg-indigo-800 text-white border border-indigo-700 text-xs uppercase">{userRole}</span> administrative privileges.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center justify-center gap-2 self-start md:self-auto bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl border border-indigo-500/30 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Stats
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats.totalStudents}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <UserCheck className="h-3 w-3 mr-0.5" />
                {stats.activeStudents} active
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lecturers</p>
            <span className="text-2xl font-bold text-slate-900">{stats.totalLecturers}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Faculty staff members</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Courses</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stats.totalCourses}</span>
              <span className="text-xs text-indigo-600 font-semibold">{stats.activeCourses} active</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3.5 bg-sky-50 text-sky-600 rounded-xl">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollments</p>
            <span className="text-2xl font-bold text-slate-900">{stats.totalEnrollments}</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Course enrollment records</p>
          </div>
        </div>
      </div>

      {/* Charts Section (Bento Grid Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Distribution (Custom Bar Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 font-display">Students by Department</h3>
              <p className="text-xs text-slate-500">Breakdown of student body distribution</p>
            </div>
            <Award className="h-5 w-5 text-indigo-500" />
          </div>

          <div className="space-y-4">
            {stats.studentsPerDepartment.map((dept, idx) => {
              const percentage = Math.round((dept.count / maxDeptCount) * 100);
              const colorClass = deptColors[idx % deptColors.length];
              return (
                <div key={dept.departmentName} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-700">
                    <span>{dept.departmentName} Department</span>
                    <span className="font-bold">{dept.count} Students ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${colorClass} rounded-full transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade Distribution (Custom Donut/Pie Visual) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 font-display">Grade Distribution</h3>
              <p className="text-xs text-slate-500">Traditional letter grading counts</p>
            </div>
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            {/* Elegant SVG Donut Chart */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                {(() => {
                  let accumulatedPercent = 0;
                  const totalGrades = stats.gradeDistribution.reduce((acc, g) => acc + g.count, 0) || 1;
                  
                  return stats.gradeDistribution.map((item) => {
                    const pct = (item.count / totalGrades) * 100;
                    const strokeDashArray = `${pct} ${100 - pct}`;
                    const strokeDashOffset = 100 - accumulatedPercent;
                    accumulatedPercent += pct;
                    const color = gradeColors[item.grade as keyof typeof gradeColors] || '#64748b';

                    return (
                      <circle
                        key={item.grade}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={color}
                        strokeWidth="4"
                        strokeDasharray={strokeDashArray}
                        strokeDashoffset={strokeDashOffset}
                        className="transition-all duration-1000"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Grades</span>
                <span className="text-xl font-extrabold text-slate-800">{stats.totalEnrollments}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3 mt-5 w-full">
              {stats.gradeDistribution.map((item) => {
                const color = gradeColors[item.grade as keyof typeof gradeColors] || '#64748b';
                return (
                  <div key={item.grade} className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                    <Circle className="h-2.5 w-2.5 fill-current" style={{ color }} />
                    <span>Grade {item.grade}: <strong className="text-slate-800">{item.count}</strong></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Semester Enrollment Line/Trend Visual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm shadow-slate-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 font-display">Enrollment Trends</h3>
            <p className="text-xs text-slate-500">Historic and current semester enrolment trends</p>
          </div>
          <CheckCircle className="h-5 w-5 text-sky-500" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.enrollmentBySemester.map((sem, idx) => {
            const pct = Math.round((sem.count / maxEnrollCount) * 100);
            return (
              <div key={sem.semester} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Semester</p>
                  <p className="font-bold text-slate-800 mt-0.5">{sem.semester}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-indigo-600 block">{sem.count}</span>
                  <span className="text-[10px] text-slate-500 font-medium">registered students</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
