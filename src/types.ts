/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'LECTURER' | 'STUDENT';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  associatedId?: number; // Links to Student ID or Lecturer ID
  email: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description: string;
}

export interface Student {
  id: number;
  studentNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  admissionDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'GRADUATED';
  departmentId: number;
  profilePicture?: string;
}

export interface Lecturer {
  id: number;
  staffNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  office: string;
  departmentId: number;
}

export interface Course {
  id: number;
  courseCode: string;
  courseName: string;
  creditHours: number;
  semester: string;
  academicYear: string;
  departmentId: number;
  lecturerId?: number;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  semester: string;
  academicYear: string;
  enrollmentDate: string;
  grade?: string; // e.g. 'A', 'B+', 'F', or numeric / percentage, we'll support traditional letters
  status: 'ENROLLED' | 'COMPLETED' | 'DROPPED';
}

// For Dashboard analytics
export interface DashboardStats {
  totalStudents: number;
  totalLecturers: number;
  totalDepartments: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
  activeCourses: number;
  studentsPerDepartment: { departmentName: string; count: number }[];
  enrollmentBySemester: { semester: string; count: number }[];
  gradeDistribution: { grade: string; count: number }[];
}
