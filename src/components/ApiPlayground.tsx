/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, Terminal, Play, Shield, HelpCircle, Code, ChevronRight, RefreshCw, Layers } from 'lucide-react';

interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  category: 'Auth' | 'Students' | 'Departments' | 'Courses' | 'Lecturers' | 'Enrollments' | 'Dashboard';
  description: string;
  requiredRole: 'ANY' | 'ADMIN' | 'LECTURER' | 'STUDENT' | 'ADMIN/LECTURER';
  defaultParams?: Record<string, string>;
  defaultBody?: string;
}

interface ApiPlaygroundProps {
  token: string;
}

export default function ApiPlayground({ token }: ApiPlaygroundProps) {
  const routes: ApiRoute[] = [
    {
      method: 'GET',
      path: '/api/dashboard',
      category: 'Dashboard',
      description: 'Calculates active student, course, enrollment, and grade statistics.',
      requiredRole: 'ANY'
    },
    {
      method: 'GET',
      path: '/api/auth/profile',
      category: 'Auth',
      description: 'Returns the current logged-in user profile and linked Student or Lecturer entity details.',
      requiredRole: 'ANY'
    },
    {
      method: 'POST',
      path: '/api/auth/login',
      category: 'Auth',
      description: 'Logs in a user, returning a signed secure mock JWT token.',
      requiredRole: 'ANY',
      defaultBody: JSON.stringify({ username: 'admin', password: 'admin123' }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/students',
      category: 'Students',
      description: 'Fetches paginated students with search sorting, department filters, and status filters.',
      requiredRole: 'ADMIN/LECTURER',
      defaultParams: { page: '1', limit: '10', search: '', departmentId: '', status: '' }
    },
    {
      method: 'GET',
      path: '/api/students/{id}',
      category: 'Students',
      description: 'Retrieves a student record by ID.',
      requiredRole: 'ANY',
      defaultParams: { id: '1' }
    },
    {
      method: 'POST',
      path: '/api/students',
      category: 'Students',
      description: 'Registers a new student profile in the directory. Enforces unique emails and student numbers.',
      requiredRole: 'ADMIN/LECTURER',
      defaultBody: JSON.stringify({
        studentNumber: 'STU2026999',
        firstName: 'Nikola',
        lastName: 'Tesla',
        gender: 'Male',
        dateOfBirth: '1999-07-10',
        phoneNumber: '+1 (555) 999-8888',
        email: 'tesla@student.edu',
        address: 'Wardenclyffe Lab, Shoreham',
        admissionDate: '2025-09-01',
        status: 'ACTIVE',
        departmentId: 2
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/departments',
      category: 'Departments',
      description: 'Lists all academic faculties and department divisions.',
      requiredRole: 'ANY'
    },
    {
      method: 'POST',
      path: '/api/departments',
      category: 'Departments',
      description: 'Creates a new department faculty division. Code constraint must be unique.',
      requiredRole: 'ADMIN',
      defaultBody: JSON.stringify({
        name: 'Chemical Engineering',
        code: 'CHEM',
        description: 'Department of Chemical and Molecular Engineering Sciences'
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/courses',
      category: 'Courses',
      description: 'Lists all available course catalogs with assigned credits, semesters, and lecturers.',
      requiredRole: 'ANY'
    },
    {
      method: 'POST',
      path: '/api/courses',
      category: 'Courses',
      description: 'Registers a new course module under a department, assigning credit hours.',
      requiredRole: 'ADMIN/LECTURER',
      defaultBody: JSON.stringify({
        courseCode: 'CS303',
        courseName: 'Compiler Construction',
        creditHours: 4,
        semester: 'Fall',
        academicYear: '2025/2026',
        departmentId: 1,
        lecturerId: 2
      }, null, 2)
    },
    {
      method: 'GET',
      path: '/api/lecturers',
      category: 'Lecturers',
      description: 'Lists all faculty lecturers and professors.',
      requiredRole: 'ANY'
    },
    {
      method: 'GET',
      path: '/api/enrollments',
      category: 'Enrollments',
      description: 'Lists all student-to-course enrollments logs.',
      requiredRole: 'ANY'
    },
    {
      method: 'POST',
      path: '/api/enrollments',
      category: 'Enrollments',
      description: 'Enrolls a student in a course module. Prevents duplicate active registrations.',
      requiredRole: 'ANY',
      defaultBody: JSON.stringify({
        studentId: 1,
        courseId: 3,
        semester: 'Spring',
        academicYear: '2025/2026'
      }, null, 2)
    }
  ];

  const [activeIdx, setActiveIdx] = useState(0);
  const selectedRoute = routes[activeIdx];

  // Parameter states
  const [routeParams, setRouteParams] = useState<Record<string, string>>(selectedRoute.defaultParams || {});
  const [requestBody, setRequestBody] = useState<string>(selectedRoute.defaultBody || '');

  // Response output states
  const [executing, setExecuting] = useState(false);
  const [respStatus, setRespStatus] = useState<number | null>(null);
  const [respStatusText, setRespStatusText] = useState('');
  const [respTime, setRespTime] = useState<number | null>(null);
  const [respBody, setRespBody] = useState<string>('');

  const handleRouteChange = (idx: number) => {
    setActiveIdx(idx);
    setRouteParams(routes[idx].defaultParams || {});
    setRequestBody(routes[idx].defaultBody || '');
    setRespStatus(null);
    setRespBody('');
    setRespTime(null);
  };

  const handleParamChange = (key: string, val: string) => {
    setRouteParams(p => ({ ...p, [key]: val }));
  };

  const handleExecute = async () => {
    setExecuting(true);
    setRespStatus(null);
    setRespBody('');
    
    const startTime = Date.now();
    try {
      // Build dynamic URL path
      let resolvedPath = selectedRoute.path;
      const queryParams: string[] = [];

      Object.entries(routeParams).forEach(([key, val]) => {
        const valStr = String(val);
        if (resolvedPath.includes(`{${key}}`)) {
          resolvedPath = resolvedPath.replace(`{${key}}`, encodeURIComponent(valStr));
        } else {
          if (valStr) {
            queryParams.push(`${encodeURIComponent(key)}=${encodeURIComponent(valStr)}`);
          }
        }
      });

      if (queryParams.length > 0) {
        resolvedPath += `?${queryParams.join('&')}`;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const options: RequestInit = {
        method: selectedRoute.method,
        headers
      };

      if (selectedRoute.method !== 'GET' && requestBody) {
        options.body = requestBody;
      }

      const response = await fetch(resolvedPath, options);
      const data = await response.json();

      setRespStatus(response.status);
      setRespStatusText(response.statusText || (response.status === 200 ? 'OK' : response.status === 201 ? 'Created' : ''));
      setRespTime(Date.now() - startTime);
      setRespBody(JSON.stringify(data, null, 2));

    } catch (err: any) {
      setRespStatus(0);
      setRespStatusText('Execution Error');
      setRespBody(JSON.stringify({ error: 'ClientNetworkException', message: err.message || 'Check connection to endpoint.' }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  const methodColors = {
    GET: 'bg-emerald-500 text-white',
    POST: 'bg-indigo-500 text-white',
    PUT: 'bg-amber-500 text-white',
    DELETE: 'bg-rose-500 text-white'
  };

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">REST API Interactive Client</h1>
        <p className="text-xs text-slate-500">Live API playground targeting our Express/Spring mock endpoints. Inspect and execute queries directly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Endpoints List */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-4 shadow-sm shadow-slate-50 max-h-[600px] overflow-y-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 pb-3 block border-b border-slate-50 mb-2">
            REST Endpoints Listing
          </span>
          <div className="space-y-1.5">
            {routes.map((route, idx) => (
              <button
                key={`${route.method}-${route.path}`}
                onClick={() => handleRouteChange(idx)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between text-xs cursor-pointer ${
                  activeIdx === idx 
                    ? 'bg-slate-900 text-white font-semibold shadow-md' 
                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                    activeIdx === idx 
                      ? 'bg-slate-800 text-indigo-300 border border-slate-700' 
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {route.method}
                  </span>
                  <span className="font-mono line-clamp-1">{route.path}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* API Workspace Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-50 space-y-4">
            
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-lg text-xs font-extrabold font-mono tracking-wider ${methodColors[selectedRoute.method]}`}>
                  {selectedRoute.method}
                </span>
                <span className="font-mono text-sm font-bold text-slate-900">{selectedRoute.path}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-semibold text-slate-500">Security Rule:</span>
                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-md text-[10px] uppercase">
                  {selectedRoute.requiredRole}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {selectedRoute.description}
            </p>

            {/* Inputs Form */}
            <div className="space-y-4 pt-2 text-xs">
              {Object.keys(routeParams).length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Query / Path Parameters</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(routeParams).map(([key, val]) => (
                      <div key={key}>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1 font-mono">{key}</label>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => handleParamChange(key, e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono text-xs"
                          placeholder={`Enter ${key}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedRoute.method !== 'GET' && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Request Payload Body (JSON)</span>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl h-44 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs leading-relaxed"
                    placeholder="{}"
                  />
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={executing}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-indigo-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                {executing ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    Executing REST Endpoint...
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5 fill-current" />
                    Send Live HTTP Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Response Inspector Box */}
          <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 flex-1 flex flex-col justify-between text-xs min-h-[300px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Terminal className="h-4 w-4" />
                  Response Output JSON
                </span>
                {respStatus !== null && (
                  <div className="flex items-center gap-3 font-semibold">
                    <span className="text-[10px] text-slate-500">Latency: <strong className="text-slate-300">{respTime}ms</strong></span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${
                      respStatus >= 200 && respStatus < 300 
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' 
                        : 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                    }`}>
                      STATUS: {respStatus} {respStatusText}
                    </span>
                  </div>
                )}
              </div>

              {respBody ? (
                <pre className="overflow-auto max-h-[340px] text-emerald-400 leading-relaxed font-mono whitespace-pre-wrap">
                  {respBody}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500 font-medium text-center">
                  <HelpCircle className="h-10 w-10 text-slate-600 mb-2" />
                  <p>Send a request to see the live server response body output</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-900 text-[10px] text-slate-500 font-bold font-mono tracking-wide uppercase flex items-center gap-2">
              <Code className="h-4 w-4 text-slate-600" />
              <span>Response header Content-Type: application/json</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
