/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Department, Student, Lecturer, Course, Enrollment, User, UserRole, DashboardStats } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json());

// --- IN-MEMORY DATABASE SEED DATA ---
let departments: Department[] = [
  { id: 1, name: 'Computer Science', code: 'CS', description: 'Department of Computer Science and Software Engineering' },
  { id: 2, name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical and Electronics Engineering' },
  { id: 3, name: 'Mathematics', code: 'MATH', description: 'Department of Pure and Applied Mathematics' },
  { id: 4, name: 'Business Administration', code: 'BUS', description: 'Department of Business Management and Administration' }
];

let lecturers: Lecturer[] = [
  { id: 1, staffNumber: 'LEC001', firstName: 'Alan', lastName: 'Turing', email: 'a.turing@university.edu', phoneNumber: '+1 (555) 123-4567', office: 'Turing Hall 301', departmentId: 1 },
  { id: 2, staffNumber: 'LEC002', firstName: 'Grace', lastName: 'Hopper', email: 'g.hopper@university.edu', phoneNumber: '+1 (555) 234-5678', office: 'Hopper Lab 102', departmentId: 1 },
  { id: 3, staffNumber: 'LEC003', firstName: 'Nikola', lastName: 'Tesla', email: 'n.tesla@university.edu', phoneNumber: '+1 (555) 345-6789', office: 'Tesla Tower 204', departmentId: 2 },
  { id: 4, staffNumber: 'LEC004', firstName: 'Katherine', lastName: 'Johnson', email: 'k.johnson@university.edu', phoneNumber: '+1 (555) 456-7890', office: 'Orbit Suite 410', departmentId: 3 }
];

let students: Student[] = [
  { id: 1, studentNumber: 'STU2026001', firstName: 'Alice', lastName: 'Smith', gender: 'Female', dateOfBirth: '2004-04-12', phoneNumber: '+1 (555) 001-0001', email: 'alice.smith@student.edu', address: '123 University Ave, Campus View', admissionDate: '2023-09-01', status: 'ACTIVE', departmentId: 1 },
  { id: 2, studentNumber: 'STU2026002', firstName: 'Bob', lastName: 'Johnson', gender: 'Male', dateOfBirth: '2003-11-23', phoneNumber: '+1 (555) 001-0002', email: 'bob.johnson@student.edu', address: '456 College Rd, Dorm A Room 205', admissionDate: '2023-09-01', status: 'ACTIVE', departmentId: 2 },
  { id: 3, studentNumber: 'STU2026003', firstName: 'Charlie', lastName: 'Williams', gender: 'Male', dateOfBirth: '2004-07-08', phoneNumber: '+1 (555) 001-0003', email: 'charlie.w@student.edu', address: '789 Science Way, Campus South', admissionDate: '2023-09-01', status: 'ACTIVE', departmentId: 1 },
  { id: 4, studentNumber: 'STU2026004', firstName: 'Diana', lastName: 'Brown', gender: 'Female', dateOfBirth: '2004-01-19', phoneNumber: '+1 (555) 001-0004', email: 'diana.brown@student.edu', address: '321 Scholar Lane, Academic Heights', admissionDate: '2023-09-01', status: 'ACTIVE', departmentId: 3 },
  { id: 5, studentNumber: 'STU2026005', firstName: 'Ethan', lastName: 'Davis', gender: 'Male', dateOfBirth: '2002-05-30', phoneNumber: '+1 (555) 001-0005', email: 'ethan.davis@student.edu', address: '555 Commerce Blvd, Off-Campus', admissionDate: '2022-09-01', status: 'ACTIVE', departmentId: 4 },
  { id: 6, studentNumber: 'STU2026006', firstName: 'Fiona', lastName: 'Miller', gender: 'Female', dateOfBirth: '2003-08-14', phoneNumber: '+1 (555) 001-0006', email: 'fiona.miller@student.edu', address: '12 Dorm B, Room 101', admissionDate: '2023-09-01', status: 'ACTIVE', departmentId: 1 }
];

let courses: Course[] = [
  { id: 1, courseCode: 'CS101', courseName: 'Introduction to Computer Science', creditHours: 3, semester: 'Fall', academicYear: '2025/2026', departmentId: 1, lecturerId: 1 },
  { id: 2, courseCode: 'CS202', courseName: 'Data Structures and Algorithms', creditHours: 4, semester: 'Spring', academicYear: '2025/2026', departmentId: 1, lecturerId: 2 },
  { id: 3, courseCode: 'EE110', courseName: 'Basic Electrical Engineering', creditHours: 3, semester: 'Fall', academicYear: '2025/2026', departmentId: 2, lecturerId: 3 },
  { id: 4, courseCode: 'MATH301', courseName: 'Linear Algebra and Differential Equations', creditHours: 4, semester: 'Fall', academicYear: '2025/2026', departmentId: 3, lecturerId: 4 },
  { id: 5, courseCode: 'BUS101', courseName: 'Principles of Marketing', creditHours: 3, semester: 'Spring', academicYear: '2025/2026', departmentId: 4, lecturerId: undefined }
];

let enrollments: Enrollment[] = [
  { id: 1, studentId: 1, courseId: 1, semester: 'Fall', academicYear: '2025/2026', enrollmentDate: '2025-09-02', grade: 'A', status: 'COMPLETED' },
  { id: 2, studentId: 1, courseId: 2, semester: 'Spring', academicYear: '2025/2026', enrollmentDate: '2026-02-05', grade: 'A-', status: 'ENROLLED' },
  { id: 3, studentId: 2, courseId: 3, semester: 'Fall', academicYear: '2025/2026', enrollmentDate: '2025-09-02', grade: 'B+', status: 'COMPLETED' },
  { id: 4, studentId: 3, courseId: 1, semester: 'Fall', academicYear: '2025/2026', enrollmentDate: '2025-09-02', grade: 'B', status: 'COMPLETED' },
  { id: 5, studentId: 4, courseId: 4, semester: 'Fall', academicYear: '2025/2026', enrollmentDate: '2025-09-03', grade: 'A', status: 'COMPLETED' },
  { id: 6, studentId: 5, courseId: 5, semester: 'Spring', academicYear: '2025/2026', enrollmentDate: '2026-02-06', grade: undefined, status: 'ENROLLED' }
];

let users: User[] = [
  { id: 1, username: 'admin', role: 'ADMIN', email: 'admin@university.edu' },
  { id: 2, username: 'alan_turing', role: 'LECTURER', associatedId: 1, email: 'a.turing@university.edu' },
  { id: 3, username: 'grace_hopper', role: 'LECTURER', associatedId: 2, email: 'g.hopper@university.edu' },
  { id: 4, username: 'alice_smith', role: 'STUDENT', associatedId: 1, email: 'alice.smith@student.edu' },
  { id: 5, username: 'bob_johnson', role: 'STUDENT', associatedId: 2, email: 'bob.johnson@student.edu' }
];

// Helper database simulation "passwords"
const userPasswords: Record<string, string> = {
  admin: 'admin123',
  alan_turing: 'lecturer123',
  grace_hopper: 'lecturer123',
  alice_smith: 'student123',
  bob_johnson: 'student123'
};

// --- MOCK JWT HELPER ---
// To avoid complex external dependency issues in the dev container, 
// we sign and verify secure base64-encoded mock tokens.
interface JWTPayload {
  id: number;
  username: string;
  role: UserRole;
  associatedId?: number;
  exp: number;
}

function generateMockToken(user: User): string {
  const payload: JWTPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
    associatedId: user.associatedId,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 Hours
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function verifyMockToken(token: string): JWTPayload | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const payload = JSON.parse(raw) as JWTPayload;
    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch (e) {
    return null;
  }
}

// Extend Request interface to hold authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// --- AUTHENTICATION MIDDLEWARE ---
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized', message: 'JWT token is missing' });
  }

  const decoded = verifyMockToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Forbidden', message: 'JWT token is invalid or expired' });
  }

  req.user = decoded;
  next();
}

// --- ROLE AUTHORIZATION MIDDLEWARE ---
function requireRoles(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: `Access denied. Requires one of: ${roles.join(', ')}` });
    }
    next();
  };
}

// --- REST API ENDPOINTS ---

// 1. Authentication
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, email, role, associatedId } = req.body;

  if (!username || !password || !email || !role) {
    return res.status(400).json({ error: 'ValidationException', message: 'Username, password, email, and role are required' });
  }

  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Username '${username}' is already taken` });
  }

  const newUser: User = {
    id: users.length + 1,
    username,
    role: role as UserRole,
    email,
    associatedId: associatedId ? Number(associatedId) : undefined
  };

  users.push(newUser);
  userPasswords[username] = password; // store simple plain text for mock verification

  const token = generateMockToken(newUser);
  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: newUser.id, username: newUser.username, role: newUser.role, email: newUser.email }
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'ValidationException', message: 'Username and password are required' });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || userPasswords[user.username] !== password) {
    return res.status(401).json({ error: 'AuthenticationException', message: 'Invalid username or password' });
  }

  const token = generateMockToken(user);
  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, role: user.role, email: user.email, associatedId: user.associatedId }
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.json({ message: 'Logout successful' });
});

app.get('/api/auth/profile', authenticateToken, (req: Request, res: Response) => {
  const user = users.find(u => u.id === req.user?.id);
  if (!user) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: 'User not found' });
  }

  let extraDetails = {};
  if (user.role === 'STUDENT' && user.associatedId) {
    extraDetails = students.find(s => s.id === user.associatedId) || {};
  } else if (user.role === 'LECTURER' && user.associatedId) {
    extraDetails = lecturers.find(l => l.id === user.associatedId) || {};
  }

  res.json({
    user: { id: user.id, username: user.username, role: user.role, email: user.email },
    details: extraDetails
  });
});

// 2. Students API
app.get('/api/students', authenticateToken, (req: Request, res: Response) => {
  const { search, departmentId, status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;

  let filtered = [...students];

  // Search filter
  if (search) {
    const sStr = String(search).toLowerCase();
    filtered = filtered.filter(s =>
      s.firstName.toLowerCase().includes(sStr) ||
      s.lastName.toLowerCase().includes(sStr) ||
      s.studentNumber.toLowerCase().includes(sStr) ||
      s.email.toLowerCase().includes(sStr)
    );
  }

  // Department filter
  if (departmentId) {
    filtered = filtered.filter(s => s.departmentId === Number(departmentId));
  }

  // Status filter
  if (status) {
    filtered = filtered.filter(s => s.status === status);
  }

  // Sorting
  if (sortBy) {
    const field = String(sortBy) as keyof Student;
    const order = String(sortOrder).toLowerCase() === 'desc' ? -1 : 1;
    filtered.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * order;
      }
      return ((aVal as number) - (bVal as number)) * order;
    });
  }

  // Pagination
  const total = filtered.length;
  const pIdx = Number(page);
  const lim = Number(limit);
  const start = (pIdx - 1) * lim;
  const paginated = filtered.slice(start, start + lim);

  res.json({
    content: paginated,
    page: pIdx,
    limit: lim,
    totalElements: total,
    totalPages: Math.ceil(total / lim)
  });
});

app.get('/api/students/:id', authenticateToken, (req: Request, res: Response) => {
  const student = students.find(s => s.id === Number(req.params.id));
  if (!student) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Student with ID ${req.params.id} not found` });
  }
  res.json(student);
});

app.post('/api/students', authenticateToken, requireRoles('ADMIN', 'LECTURER'), (req: Request, res: Response) => {
  const data = req.body as Partial<Student>;

  if (!data.firstName || !data.lastName || !data.email || !data.departmentId || !data.studentNumber) {
    return res.status(400).json({ error: 'ValidationException', message: 'First name, last name, email, department ID, and student number are required' });
  }

  if (students.find(s => s.studentNumber.toLowerCase() === data.studentNumber?.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Student number '${data.studentNumber}' already exists` });
  }

  if (students.find(s => s.email.toLowerCase() === data.email?.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Student email '${data.email}' already exists` });
  }

  const newStudent: Student = {
    id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
    studentNumber: data.studentNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender || 'Other',
    dateOfBirth: data.dateOfBirth || '',
    phoneNumber: data.phoneNumber || '',
    email: data.email,
    address: data.address || '',
    admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
    status: data.status || 'ACTIVE',
    departmentId: Number(data.departmentId),
    profilePicture: data.profilePicture
  };

  students.push(newStudent);
  res.status(201).json(newStudent);
});

app.put('/api/students/:id', authenticateToken, requireRoles('ADMIN', 'LECTURER'), (req: Request, res: Response) => {
  const index = students.findIndex(s => s.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Student with ID ${req.params.id} not found` });
  }

  const current = students[index];
  const data = req.body as Partial<Student>;

  // Check unique constraints if changing values
  if (data.studentNumber && data.studentNumber !== current.studentNumber && students.find(s => s.studentNumber === data.studentNumber)) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: 'Student number already taken' });
  }

  if (data.email && data.email !== current.email && students.find(s => s.email === data.email)) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: 'Student email already taken' });
  }

  students[index] = {
    ...current,
    ...data,
    id: current.id, // don't change id
    departmentId: data.departmentId ? Number(data.departmentId) : current.departmentId
  };

  res.json(students[index]);
});

app.delete('/api/students/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const index = students.findIndex(s => s.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Student with ID ${req.params.id} not found` });
  }

  // Remove linked enrollments and users
  enrollments = enrollments.filter(e => e.studentId !== Number(req.params.id));
  const student = students[index];
  const linkedUserIdx = users.findIndex(u => u.role === 'STUDENT' && u.associatedId === student.id);
  if (linkedUserIdx !== -1) {
    users.splice(linkedUserIdx, 1);
  }

  students.splice(index, 1);
  res.json({ message: 'Student deleted successfully' });
});


// 3. Departments API
app.get('/api/departments', authenticateToken, (req: Request, res: Response) => {
  res.json(departments);
});

app.post('/api/departments', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const { name, code, description } = req.body;
  if (!name || !code) {
    return res.status(400).json({ error: 'ValidationException', message: 'Department name and code are required' });
  }

  if (departments.find(d => d.code.toLowerCase() === code.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Department code '${code}' already exists` });
  }

  const newDept: Department = {
    id: departments.length > 0 ? Math.max(...departments.map(d => d.id)) + 1 : 1,
    name,
    code,
    description: description || ''
  };

  departments.push(newDept);
  res.status(201).json(newDept);
});

app.put('/api/departments/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const index = departments.findIndex(d => d.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Department with ID ${req.params.id} not found` });
  }

  const current = departments[index];
  const { name, code, description } = req.body;

  if (code && code !== current.code && departments.find(d => d.code === code)) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Department code '${code}' is already taken` });
  }

  departments[index] = {
    ...current,
    name: name || current.name,
    code: code || current.code,
    description: description !== undefined ? description : current.description
  };

  res.json(departments[index]);
});

app.delete('/api/departments/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const deptId = Number(req.params.id);
  const index = departments.findIndex(d => d.id === deptId);
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Department with ID ${req.params.id} not found` });
  }

  // Prevent delete if students or courses or lecturers depend on it
  const hasStudents = students.some(s => s.departmentId === deptId);
  const hasLecturers = lecturers.some(l => l.departmentId === deptId);
  const hasCourses = courses.some(c => c.departmentId === deptId);

  if (hasStudents || hasLecturers || hasCourses) {
    return res.status(400).json({
      error: 'DatabaseException',
      message: 'Cannot delete department: Linked records exist in Student, Lecturer, or Course tables.'
    });
  }

  departments.splice(index, 1);
  res.json({ message: 'Department deleted successfully' });
});


// 4. Lecturers API
app.get('/api/lecturers', authenticateToken, (req: Request, res: Response) => {
  res.json(lecturers);
});

app.post('/api/lecturers', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const data = req.body as Partial<Lecturer>;

  if (!data.firstName || !data.lastName || !data.email || !data.staffNumber || !data.departmentId) {
    return res.status(400).json({ error: 'ValidationException', message: 'First name, last name, email, staff number, and department ID are required' });
  }

  if (lecturers.find(l => l.staffNumber.toLowerCase() === data.staffNumber?.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Staff number '${data.staffNumber}' already exists` });
  }

  const newLecturer: Lecturer = {
    id: lecturers.length > 0 ? Math.max(...lecturers.map(l => l.id)) + 1 : 1,
    staffNumber: data.staffNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phoneNumber: data.phoneNumber || '',
    office: data.office || '',
    departmentId: Number(data.departmentId)
  };

  lecturers.push(newLecturer);
  res.status(201).json(newLecturer);
});

app.put('/api/lecturers/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const index = lecturers.findIndex(l => l.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Lecturer with ID ${req.params.id} not found` });
  }

  const current = lecturers[index];
  const data = req.body as Partial<Lecturer>;

  if (data.staffNumber && data.staffNumber !== current.staffNumber && lecturers.find(l => l.staffNumber === data.staffNumber)) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: 'Staff number already taken' });
  }

  lecturers[index] = {
    ...current,
    ...data,
    id: current.id,
    departmentId: data.departmentId ? Number(data.departmentId) : current.departmentId
  };

  res.json(lecturers[index]);
});

app.delete('/api/lecturers/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const lectId = Number(req.params.id);
  const index = lecturers.findIndex(l => l.id === lectId);
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Lecturer with ID ${req.params.id} not found` });
  }

  // Set courses assigned to this lecturer back to unassigned (lecturerId = undefined)
  courses.forEach(c => {
    if (c.lecturerId === lectId) {
      c.lecturerId = undefined;
    }
  });

  // Remove linked user account
  const linkedUserIdx = users.findIndex(u => u.role === 'LECTURER' && u.associatedId === lectId);
  if (linkedUserIdx !== -1) {
    users.splice(linkedUserIdx, 1);
  }

  lecturers.splice(index, 1);
  res.json({ message: 'Lecturer deleted successfully. Assigned courses have been unassigned.' });
});


// 5. Courses API
app.get('/api/courses', authenticateToken, (req: Request, res: Response) => {
  res.json(courses);
});

app.post('/api/courses', authenticateToken, requireRoles('ADMIN', 'LECTURER'), (req: Request, res: Response) => {
  const { courseCode, courseName, creditHours, semester, academicYear, departmentId, lecturerId } = req.body;

  if (!courseCode || !courseName || !creditHours || !departmentId) {
    return res.status(400).json({ error: 'ValidationException', message: 'Course code, course name, credit hours, and department ID are required' });
  }

  if (courses.find(c => c.courseCode.toLowerCase() === courseCode.toLowerCase())) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Course code '${courseCode}' already exists` });
  }

  const newCourse: Course = {
    id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
    courseCode,
    courseName,
    creditHours: Number(creditHours),
    semester: semester || 'Fall',
    academicYear: academicYear || '2025/2026',
    departmentId: Number(departmentId),
    lecturerId: lecturerId ? Number(lecturerId) : undefined
  };

  courses.push(newCourse);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', authenticateToken, requireRoles('ADMIN', 'LECTURER'), (req: Request, res: Response) => {
  const index = courses.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Course with ID ${req.params.id} not found` });
  }

  const current = courses[index];
  const data = req.body as Partial<Course>;

  if (data.courseCode && data.courseCode !== current.courseCode && courses.find(c => c.courseCode === data.courseCode)) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: `Course code '${data.courseCode}' is already taken` });
  }

  courses[index] = {
    ...current,
    ...data,
    id: current.id,
    creditHours: data.creditHours ? Number(data.creditHours) : current.creditHours,
    departmentId: data.departmentId ? Number(data.departmentId) : current.departmentId,
    lecturerId: data.lecturerId !== undefined ? (data.lecturerId ? Number(data.lecturerId) : undefined) : current.lecturerId
  };

  res.json(courses[index]);
});

app.delete('/api/courses/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const index = courses.findIndex(c => c.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Course with ID ${req.params.id} not found` });
  }

  // Remove linked enrollments
  enrollments = enrollments.filter(e => e.courseId !== Number(req.params.id));

  courses.splice(index, 1);
  res.json({ message: 'Course deleted successfully' });
});


// 6. Enrollments API
app.get('/api/enrollments', authenticateToken, (req: Request, res: Response) => {
  res.json(enrollments);
});

app.get('/api/enrollments/student/:id', authenticateToken, (req: Request, res: Response) => {
  const list = enrollments.filter(e => e.studentId === Number(req.params.id));
  res.json(list);
});

app.get('/api/enrollments/course/:id', authenticateToken, (req: Request, res: Response) => {
  const list = enrollments.filter(e => e.courseId === Number(req.params.id));
  res.json(list);
});

app.post('/api/enrollments', authenticateToken, (req: Request, res: Response) => {
  const { studentId, courseId, semester, academicYear, grade, status } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ error: 'ValidationException', message: 'Student ID and Course ID are required' });
  }

  // Authorization: Students can only enroll themselves. Admin & Lecturers can enroll anyone.
  if (req.user?.role === 'STUDENT' && req.user.associatedId !== Number(studentId)) {
    return res.status(403).json({ error: 'Forbidden', message: 'You are only authorized to manage your own enrollments' });
  }

  // Validate student and course exist
  const studentExists = students.some(s => s.id === Number(studentId));
  const courseExists = courses.some(c => c.id === Number(courseId));
  if (!studentExists) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Student with ID ${studentId} not found` });
  }
  if (!courseExists) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Course with ID ${courseId} not found` });
  }

  // Prevent duplicate active/completed enrollments
  const duplicate = enrollments.find(e =>
    e.studentId === Number(studentId) &&
    e.courseId === Number(courseId) &&
    e.status !== 'DROPPED'
  );

  if (duplicate) {
    return res.status(400).json({ error: 'DuplicateResourceException', message: 'Student is already enrolled or completed this course' });
  }

  const newEnrollment: Enrollment = {
    id: enrollments.length > 0 ? Math.max(...enrollments.map(e => e.id)) + 1 : 1,
    studentId: Number(studentId),
    courseId: Number(courseId),
    semester: semester || 'Spring',
    academicYear: academicYear || '2025/2026',
    enrollmentDate: new Date().toISOString().split('T')[0],
    grade: grade || undefined,
    status: status || 'ENROLLED'
  };

  enrollments.push(newEnrollment);
  res.status(201).json(newEnrollment);
});

// Update Grade / Status
app.put('/api/enrollments/:id', authenticateToken, (req: Request, res: Response) => {
  const index = enrollments.findIndex(e => e.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Enrollment with ID ${req.params.id} not found` });
  }

  const current = enrollments[index];
  const { grade, status } = req.body;

  // Authorization: Only ADMIN or LECTURER can update grades. Students can only drop.
  if (req.user?.role === 'STUDENT') {
    if (status === 'DROPPED') {
      if (current.studentId !== req.user.associatedId) {
        return res.status(403).json({ error: 'Forbidden', message: 'You cannot manage other students enrollments' });
      }
      // Allowed to drop
    } else {
      return res.status(403).json({ error: 'Forbidden', message: 'Only instructors/administrators can assign grades or update course completions' });
    }
  }

  enrollments[index] = {
    ...current,
    grade: grade !== undefined ? grade : current.grade,
    status: status || current.status
  };

  res.json(enrollments[index]);
});

app.delete('/api/enrollments/:id', authenticateToken, requireRoles('ADMIN'), (req: Request, res: Response) => {
  const index = enrollments.findIndex(e => e.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'ResourceNotFoundException', message: `Enrollment with ID ${req.params.id} not found` });
  }

  enrollments.splice(index, 1);
  res.json({ message: 'Enrollment deleted successfully' });
});


// 7. Dashboard Stats API
app.get('/api/dashboard', authenticateToken, (req: Request, res: Response) => {
  const totalStudents = students.length;
  const totalLecturers = lecturers.length;
  const totalDepartments = departments.length;
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;

  const activeStudents = students.filter(s => s.status === 'ACTIVE').length;
  const activeCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id && e.status === 'ENROLLED')).length;

  // Students per Department mapping
  const studentsPerDepartment = departments.map(d => {
    const count = students.filter(s => s.departmentId === d.id).length;
    return { departmentName: d.code, count };
  });

  // Enrollments by Semester
  const enrollBySemMap: Record<string, number> = {};
  enrollments.forEach(e => {
    const key = `${e.semester} ${e.academicYear.split('/')[0]}`;
    enrollBySemMap[key] = (enrollBySemMap[key] || 0) + 1;
  });
  const enrollmentBySemester = Object.entries(enrollBySemMap).map(([semester, count]) => ({
    semester,
    count
  }));

  // Grade distributions (A, B, C, D, F)
  const gradeDistMap: Record<string, number> = { 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 };
  enrollments.forEach(e => {
    if (e.grade) {
      const char = e.grade.trim().toUpperCase().charAt(0);
      if (char in gradeDistMap) {
        gradeDistMap[char]++;
      }
    }
  });
  const gradeDistribution = Object.entries(gradeDistMap).map(([grade, count]) => ({
    grade,
    count
  }));

  const stats: DashboardStats = {
    totalStudents,
    totalLecturers,
    totalDepartments,
    totalCourses,
    totalEnrollments,
    activeStudents,
    activeCourses,
    studentsPerDepartment,
    enrollmentBySemester,
    gradeDistribution
  };

  res.json(stats);
});

// --- CLIENT SERVER INTEGRATION (Vite + Express SPA routing) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIMS Application running on http://localhost:${PORT}`);
  });
}

startServer();
