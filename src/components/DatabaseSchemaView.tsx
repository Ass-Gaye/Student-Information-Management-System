/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Table, Key, Info, Share2, Eye } from 'lucide-react';

interface SchemaTable {
  name: string;
  description: string;
  columns: { name: string; type: string; constraints: string[]; isPk?: boolean; isFk?: boolean }[];
}

export default function DatabaseSchemaView() {
  const [selectedTable, setSelectedTable] = useState<string>('STUDENT');

  const databaseTables: SchemaTable[] = [
    {
      name: 'USER',
      description: 'Holds secure user credentials, password hashes, and links to roles and entities.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'username', type: 'VARCHAR(50)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'password', type: 'VARCHAR(255)', constraints: ['NOT NULL'] },
        { name: 'email', type: 'VARCHAR(100)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'role_id', type: 'BIGINT', constraints: ['FOREIGN KEY references ROLE(id)'], isFk: true },
        { name: 'associated_id', type: 'BIGINT', constraints: ['NULLABLE'] }
      ]
    },
    {
      name: 'ROLE',
      description: 'Defines Roles for system-wide access controls (ADMIN, LECTURER, STUDENT).',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'name', type: 'VARCHAR(20)', constraints: ['NOT NULL', 'UNIQUE'] }
      ]
    },
    {
      name: 'STUDENT',
      description: 'Stores personal details, academic statuses, and links to departments.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'student_number', type: 'VARCHAR(20)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'first_name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
        { name: 'last_name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
        { name: 'gender', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
        { name: 'date_of_birth', type: 'DATE', constraints: ['NOT NULL'] },
        { name: 'phone_number', type: 'VARCHAR(20)', constraints: ['NULLABLE'] },
        { name: 'email', type: 'VARCHAR(100)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'address', type: 'VARCHAR(255)', constraints: ['NULLABLE'] },
        { name: 'admission_date', type: 'DATE', constraints: ['NOT NULL'] },
        { name: 'status', type: 'VARCHAR(20)', constraints: ["DEFAULT 'ACTIVE'"] },
        { name: 'department_id', type: 'BIGINT', constraints: ['FOREIGN KEY references DEPARTMENT(id)'], isFk: true }
      ]
    },
    {
      name: 'DEPARTMENT',
      description: 'Faculties within the university. Organizes students, courses, and lecturers.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
        { name: 'code', type: 'VARCHAR(10)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'description', type: 'TEXT', constraints: ['NULLABLE'] }
      ]
    },
    {
      name: 'LECTURER',
      description: 'Faculty professors assigned to departments and courses.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'staff_number', type: 'VARCHAR(20)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'first_name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
        { name: 'last_name', type: 'VARCHAR(50)', constraints: ['NOT NULL'] },
        { name: 'email', type: 'VARCHAR(100)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'phone_number', type: 'VARCHAR(20)', constraints: ['NULLABLE'] },
        { name: 'office', type: 'VARCHAR(50)', constraints: ['NULLABLE'] },
        { name: 'department_id', type: 'BIGINT', constraints: ['FOREIGN KEY references DEPARTMENT(id)'], isFk: true }
      ]
    },
    {
      name: 'COURSE',
      description: 'Academic class modules, containing credit hours, and assigned lecturers.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'course_code', type: 'VARCHAR(10)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'course_name', type: 'VARCHAR(100)', constraints: ['NOT NULL'] },
        { name: 'credit_hours', type: 'INT', constraints: ['NOT NULL'] },
        { name: 'semester', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
        { name: 'academic_year', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
        { name: 'department_id', type: 'BIGINT', constraints: ['FOREIGN KEY references DEPARTMENT(id)'], isFk: true },
        { name: 'lecturer_id', type: 'BIGINT', constraints: ['NULLABLE', 'FOREIGN KEY references LECTURER(id)'], isFk: true }
      ]
    },
    {
      name: 'ENROLLMENT',
      description: 'Resolves the Many-to-Many join between STUDENTS and COURSES. Records final letter grades.',
      columns: [
        { name: 'id', type: 'BIGINT AUTO_INCREMENT', constraints: ['NOT NULL', 'PRIMARY KEY'], isPk: true },
        { name: 'student_id', type: 'BIGINT', constraints: ['FOREIGN KEY references STUDENT(id)'], isFk: true },
        { name: 'course_id', type: 'BIGINT', constraints: ['FOREIGN KEY references COURSE(id)'], isFk: true },
        { name: 'semester', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
        { name: 'academic_year', type: 'VARCHAR(20)', constraints: ['NOT NULL'] },
        { name: 'enrollment_date', type: 'DATE', constraints: ['NOT NULL'] },
        { name: 'grade', type: 'VARCHAR(5)', constraints: ['NULLABLE'] },
        { name: 'status', type: 'VARCHAR(20)', constraints: ["DEFAULT 'ENROLLED'"] }
      ]
    }
  ];

  const activeTable = databaseTables.find(t => t.name === selectedTable) || databaseTables[2];

  return (
    <div className="space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Database Schema & ER Diagram</h1>
        <p className="text-xs text-slate-500">normalized MySQL schema. Click the tables on the canvas to inspect SQL attributes and keys definitions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive SVG Diagram Board */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-2 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <Database className="h-4 w-4" />
              MySQL Relations Diagram
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Click a table to inspect</span>
          </div>

          <div className="overflow-auto min-h-[420px] flex items-center justify-center bg-slate-950 rounded-2xl relative p-4">
            <svg viewBox="0 0 820 460" className="w-full max-w-xl h-auto" xmlns="http://www.w3.org/2000/svg">
              
              {/* Relational lines / FK Paths */}
              {/* Dept to Student */}
              <path d="M 270 90 L 330 90 L 330 200 L 410 200" fill="transparent" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Dept to Lecturer */}
              <path d="M 270 90 L 330 90 L 330 350 L 410 350" fill="transparent" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3,3" />
              {/* Dept to Course */}
              <path d="M 270 90 L 330 90 L 330 230 C 330 230 330 230 330 230 L 150 230 L 150 270" fill="transparent" stroke="#4f46e5" strokeWidth="1.5" strokeDasharray="3,3" />
              
              {/* Lecturer to Course */}
              <path d="M 410 350 L 150 350 L 150 320" fill="transparent" stroke="#10b981" strokeWidth="1.5" />
              
              {/* Student to Enrollment */}
              <path d="M 530 200 L 610 200 L 610 250 L 670 250" fill="transparent" stroke="#f59e0b" strokeWidth="1.5" />
              {/* Course to Enrollment */}
              <path d="M 210 295 L 610 295 L 610 250 L 670 250" fill="transparent" stroke="#e11d48" strokeWidth="1.5" />

              {/* Roles to User */}
              <path d="M 410 50 L 530 50" fill="transparent" stroke="#64748b" strokeWidth="1.5" />

              {/* TABLE: ROLE */}
              <g 
                onClick={() => setSelectedTable('ROLE')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'ROLE' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="290" y="20" width="120" height="60" rx="8" fill="#1e293b" stroke={selectedTable === 'ROLE' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="290" y="20" width="120" height="20" rx="8" fill="#334155" />
                <text x="350" y="34" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ROLE</text>
                <text x="300" y="55" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="300" y="70" fill="#94a3b8" fontSize="8" fontFamily="monospace">name</text>
              </g>

              {/* TABLE: USER */}
              <g 
                onClick={() => setSelectedTable('USER')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'USER' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="530" y="20" width="130" height="90" rx="8" fill="#1e293b" stroke={selectedTable === 'USER' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="530" y="20" width="130" height="20" rx="8" fill="#334155" />
                <text x="595" y="34" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">USER</text>
                <text x="540" y="55" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="540" y="68" fill="#94a3b8" fontSize="8" fontFamily="monospace">username</text>
                <text x="540" y="81" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 role_id (FK)</text>
                <text x="540" y="94" fill="#64748b" fontSize="7" fontFamily="monospace">associated_id</text>
              </g>

              {/* TABLE: DEPARTMENT */}
              <g 
                onClick={() => setSelectedTable('DEPARTMENT')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'DEPARTMENT' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="130" y="60" width="140" height="80" rx="8" fill="#1e293b" stroke={selectedTable === 'DEPARTMENT' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="130" y="60" width="140" height="20" rx="8" fill="#334155" />
                <text x="200" y="74" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">DEPARTMENT</text>
                <text x="140" y="95" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="140" y="110" fill="#94a3b8" fontSize="8" fontFamily="monospace">name</text>
                <text x="140" y="125" fill="#94a3b8" fontSize="8" fontFamily="monospace">code (UNIQ)</text>
              </g>

              {/* TABLE: STUDENT */}
              <g 
                onClick={() => setSelectedTable('STUDENT')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'STUDENT' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="410" y="150" width="120" height="90" rx="8" fill="#1e293b" stroke={selectedTable === 'STUDENT' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="410" y="150" width="120" height="20" rx="8" fill="#334155" />
                <text x="470" y="164" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">STUDENT</text>
                <text x="420" y="185" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="420" y="198" fill="#94a3b8" fontSize="8" fontFamily="monospace">student_no</text>
                <text x="420" y="211" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 department_id</text>
                <text x="420" y="224" fill="#64748b" fontSize="7" fontFamily="monospace">first/last name</text>
              </g>

              {/* TABLE: LECTURER */}
              <g 
                onClick={() => setSelectedTable('LECTURER')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'LECTURER' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="410" y="310" width="120" height="90" rx="8" fill="#1e293b" stroke={selectedTable === 'LECTURER' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="410" y="310" width="120" height="20" rx="8" fill="#334155" />
                <text x="470" y="324" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">LECTURER</text>
                <text x="420" y="345" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="420" y="358" fill="#94a3b8" fontSize="8" fontFamily="monospace">staff_no</text>
                <text x="420" y="371" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 department_id</text>
                <text x="420" y="384" fill="#64748b" fontSize="7" fontFamily="monospace">first/last name</text>
              </g>

              {/* TABLE: COURSE */}
              <g 
                onClick={() => setSelectedTable('COURSE')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'COURSE' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="90" y="270" width="120" height="90" rx="8" fill="#1e293b" stroke={selectedTable === 'COURSE' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="90" y="270" width="120" height="20" rx="8" fill="#334155" />
                <text x="150" y="284" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">COURSE</text>
                <text x="100" y="305" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="100" y="318" fill="#94a3b8" fontSize="8" fontFamily="monospace">course_code</text>
                <text x="100" y="331" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 department_id</text>
                <text x="100" y="344" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 lecturer_id</text>
              </g>

              {/* TABLE: ENROLLMENT (M:N Link) */}
              <g 
                onClick={() => setSelectedTable('ENROLLMENT')} 
                className={`cursor-pointer transition-all duration-300 ${selectedTable === 'ENROLLMENT' ? 'scale-[1.03] filter drop-shadow-[0_0_12px_rgba(79,70,229,0.2)]' : 'opacity-85 hover:opacity-100'}`}
              >
                <rect x="670" y="190" width="130" height="110" rx="8" fill="#1e293b" stroke={selectedTable === 'ENROLLMENT' ? '#6366f1' : '#475569'} strokeWidth="1.5" />
                <rect x="670" y="190" width="130" height="20" rx="8" fill="#334155" />
                <text x="735" y="204" fill="#f8fafc" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">ENROLLMENT</text>
                <text x="680" y="225" fill="#94a3b8" fontSize="8" fontFamily="monospace">🗝️ id (PK)</text>
                <text x="680" y="238" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 student_id (FK)</text>
                <text x="680" y="251" fill="#94a3b8" fontSize="8" fontFamily="monospace">🔗 course_id (FK)</text>
                <text x="680" y="264" fill="#94a3b8" fontSize="8" fontFamily="monospace">grade</text>
                <text x="680" y="277" fill="#64748b" fontSize="7" fontFamily="monospace">semester, academic_yr</text>
              </g>

            </svg>
          </div>
        </div>

        {/* Selected Table Metadata Inspector */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm shadow-slate-50 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <Table className="h-5 w-5" />
              <h3 className="font-bold text-lg font-display text-slate-900">Table: {activeTable.name}</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
              {activeTable.description}
            </p>

            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Column Schema Mapping</span>
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {activeTable.columns.map((col) => (
                  <div key={col.name} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        {col.isPk ? (
                          <Key className="h-3 w-3 text-amber-500 fill-current" />
                        ) : col.isFk ? (
                          <Share2 className="h-3 w-3 text-indigo-500" />
                        ) : (
                          <div className="h-1 w-1 bg-slate-400 rounded-full" />
                        )}
                        <span className="font-mono font-bold text-slate-800">{col.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{col.type}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {col.constraints.map(c => (
                        <span key={c} className="px-1.5 py-0.5 bg-white border border-slate-200 text-slate-600 text-[9px] font-semibold rounded-md uppercase tracking-wider font-mono scale-90">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase">
            <Eye className="h-4.5 w-4.5 text-slate-300" />
            <span>Fully normalized 3rd Normal Form (3NF)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
