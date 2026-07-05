/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Code, Copy, FileCode, Check, Folder, ChevronDown, ChevronRight, Download, Server } from 'lucide-react';

interface JavaFile {
  name: string;
  path: string;
  type: 'java' | 'xml' | 'sql' | 'properties';
  content: string;
}

export default function SpringBootViewer() {
  const [activePath, setActivePath] = useState<string>('Student.java');
  const [copied, setCopied] = useState<boolean>(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    config: true,
    entity: true,
    controller: true,
    service: true,
    repository: true
  });

  const javaFiles: JavaFile[] = [
    {
      name: 'pom.xml',
      path: 'pom.xml',
      type: 'xml',
      content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.3</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.sims</groupId>
    <artifactId>student-management-system</artifactId>
    <version>1.0.0</version>
    <name>SIMS</name>
    <description>Student Information Management System Backend</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Web MVC Layer -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Security with OAuth2 & JWT -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- Spring Data JPA with Hibernate -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Database Connectors & Drivers -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- Jakarta Validation API -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Project Lombok (Boilerplate reduction) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Springdoc OpenAPI (Swagger UI Doc generation) -->
        <dependency>
            <groupId>org.springdoc</groupId>
            <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
            <version>2.3.0</version>
        </dependency>

        <!-- JWT Token sign/verify -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>

        <!-- Testing Frameworks -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
    },
    {
      name: 'schema.sql',
      path: 'src/main/resources/schema.sql',
      type: 'sql',
      content: `-- Student Information Management System SQL Schema
-- Platform: MySQL 8.0+

CREATE DATABASE IF NOT EXISTS sims_db;
USE sims_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dept_code (code)
) ENGINE=InnoDB;

-- 2. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    role_id BIGINT NOT NULL,
    associated_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_user_username (username)
) ENGINE=InnoDB;

-- 4. Lecturers Table
CREATE TABLE IF NOT EXISTS lecturers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    staff_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20),
    office VARCHAR(50),
    department_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_lect_staff (staff_number)
) ENGINE=InnoDB;

-- 5. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_number VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(100) NOT NULL UNIQUE,
    address VARCHAR(255),
    admission_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    department_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_stud_number (student_number)
) ENGINE=InnoDB;

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(10) NOT NULL UNIQUE,
    course_name VARCHAR(100) NOT NULL,
    credit_hours INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    department_id BIGINT NOT NULL,
    lecturer_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (lecturer_id) REFERENCES lecturers(id) ON DELETE SET NULL,
    INDEX idx_course_code (course_code)
) ENGINE=InnoDB;

-- 7. Enrollments Table (M:N Join student_id & course_id)
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    enrollment_date DATE NOT NULL,
    grade VARCHAR(5),
    status VARCHAR(20) DEFAULT 'ENROLLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_stud_course (student_id, course_id, semester, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB;`
    },
    {
      name: 'Student.java',
      path: 'src/main/java/com/sims/entity/Student.java',
      type: 'java',
      content: `package com.sims.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

/**
 * Student Domain Entity illustrating complete Object-Oriented encapsulation,
 * associations, mapping, and Jakarta Validation constraints.
 */
@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Student number is required")
    @Size(max = 20)
    @Column(name = "student_number", unique = true, nullable = false, length = 20)
    private String studentNumber;

    @NotBlank(message = "First name is required")
    @Size(max = 50)
    @Column(name = "first_name", nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 50)
    @Column(name = "last_name", nullable = false, length = 50)
    private String lastName;

    @NotBlank(message = "Gender specification is required")
    @Column(nullable = false, length = 20)
    private String gender;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Email(message = "Provide a valid email address")
    @NotBlank(message = "Email is required")
    @Size(max = 100)
    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Size(max = 20)
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Size(max = 255)
    @Column(length = 255)
    private String address;

    @NotNull(message = "Admission date is required")
    @Column(name = "admission_date", nullable = false)
    private LocalDate admissionDate;

    @NotBlank(message = "Status specification is required")
    @Column(nullable = false, length = 20)
    private String status; // ACTIVE, INACTIVE, GRADUATED

    // Association: Many Students belong to One Department
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // Association: One Student has Many Course Enrollments
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private Set<Enrollment> enrollments = new HashSet<>();

    /**
     * OOP Helper method: safe association linking
     */
    public void addEnrollment(Enrollment enrollment) {
        this.enrollments.add(enrollment);
        enrollment.setStudent(this);
    }

    public void removeEnrollment(Enrollment enrollment) {
        this.enrollments.remove(enrollment);
        enrollment.setStudent(null);
    }
}`
    },
    {
      name: 'SecurityConfig.java',
      path: 'src/main/java/com/sims/config/SecurityConfig.java',
      type: 'java',
      content: `package com.sims.config;

import com.sims.security.AuthEntryPointJwt;
import com.sims.security.AuthTokenFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthEntryPointJwt unauthorizedHandler;
    private final AuthTokenFilter authTokenFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Stateless REST API: Disable CSRF
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoint rules
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // Secured endpoint rules
                .requestMatchers("/api/students/**").hasAnyRole("ADMIN", "LECTURER")
                .requestMatchers("/api/departments/**").hasRole("ADMIN")
                .requestMatchers("/api/courses/**").hasAnyRole("ADMIN", "LECTURER")
                .requestMatchers("/api/enrollments/**").hasAnyRole("ADMIN", "LECTURER", "STUDENT")
                .anyRequest().authenticated()
            );

        // Append stateless JWT middleware filter
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`
    },
    {
      name: 'StudentController.java',
      path: 'src/main/java/com/sims/controller/StudentController.java',
      type: 'java',
      content: `package com.sims.controller;

import com.sims.dto.StudentDto;
import com.sims.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
@Tag(name = "Student Controller", description = "REST APIs managing Student directories. Secured with RBAC.")
@SecurityRequirement(name = "BearerJWT")
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Get paginated, filtered students", description = "Admin and lecturers can query paginated list with search filters.")
    public ResponseEntity<Page<StudentDto>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        Page<StudentDto> students = studentService.getPaginatedStudents(search, departmentId, status, pageable);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER') or (hasRole('STUDENT') and @securityService.isSelfStudent(#id))")
    @Operation(summary = "Find student by ID", description = "Loads detail student sheets. Restricted to staff, or self student.")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register new student", description = "Saves student records. Verifies unique email and student number constraints.")
    @ApiResponse(responseCode = "201", description = "Student successfully saved")
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody StudentDto dto) {
        StudentDto saved = studentService.createStudent(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @Operation(summary = "Revise student details", description = "Saves changes. Verifies unique constraint safety before committing.")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Long id, @Valid @RequestBody StudentDto dto) {
        return ResponseEntity.ok(studentService.updateStudent(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete student record", description = "Cascades and purges enrollments and account. Admin only.")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}`
    },
    {
      name: 'GlobalExceptionHandler.java',
      path: 'src/main/java/com/sims/exception/GlobalExceptionHandler.java',
      type: 'java',
      content: `package com.sims.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex) {
        ErrorResponse err = new ErrorResponse("ResourceNotFoundException", ex.getMessage(), HttpStatus.NOT_FOUND.value());
        return new ResponseEntity<>(err, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex) {
        ErrorResponse err = new ErrorResponse("DuplicateResourceException", ex.getMessage(), HttpStatus.BAD_REQUEST.value());
        return new ResponseEntity<>(err, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        ErrorResponse err = new ErrorResponse("InternalServerError", "An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR.value());
        return new ResponseEntity<>(err, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ErrorResponse {
        private String error;
        private String message;
        private int status;
        private LocalDateTime timestamp = LocalDateTime.now();

        public ErrorResponse(String error, String message, int status) {
            this.error = error;
            this.message = message;
            this.status = status;
        }
    }
}`
    }
  ];

  const activeFile = javaFiles.find(f => f.name === activePath) || javaFiles[2];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderName]: !prev[folderName]
    }));
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Spring Boot Code Explorer</h1>
          <p className="text-xs text-slate-500">
            Browse the production-ready Java 17 + Spring Boot 3 enterprise source code.
          </p>
        </div>
        <div className="inline-flex gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
            <Server className="h-4 w-4 text-slate-500" />
            JDK 17 + Spring Boot 3.2
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Project Tree Nav Panel */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 text-slate-300 rounded-3xl p-4 shadow-xl text-xs max-h-[600px] overflow-y-auto">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
            <Folder className="h-4.5 w-4.5 text-indigo-400" />
            <span className="font-bold tracking-wide uppercase font-display text-slate-200">Spring Project Tree</span>
          </div>

          <div className="space-y-2 font-mono">
            {/* Root items */}
            <div 
              onClick={() => setActivePath('pom.xml')}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                activePath === 'pom.xml' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-700/50' : 'hover:bg-slate-800'
              }`}
            >
              <FileCode className="h-4 w-4" />
              <span>pom.xml</span>
            </div>

            <div 
              onClick={() => setActivePath('schema.sql')}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                activePath === 'schema.sql' ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-700/50' : 'hover:bg-slate-800'
              }`}
            >
              <FileCode className="h-4 w-4 text-emerald-400" />
              <span>src/main/resources/schema.sql</span>
            </div>

            {/* Folder: Config */}
            <div>
              <div 
                onClick={() => toggleFolder('config')}
                className="flex items-center gap-1.5 p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-400 font-semibold"
              >
                {expandedFolders.config ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Folder className="h-4 w-4 text-indigo-400 fill-current" />
                <span>com.sims.config</span>
              </div>
              {expandedFolders.config && (
                <div className="pl-6 space-y-1 mt-1 border-l border-slate-800 ml-3.5">
                  <div 
                    onClick={() => setActivePath('SecurityConfig.java')}
                    className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${
                      activePath === 'SecurityConfig.java' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>SecurityConfig.java</span>
                  </div>
                </div>
              )}
            </div>

            {/* Folder: Entity */}
            <div>
              <div 
                onClick={() => toggleFolder('entity')}
                className="flex items-center gap-1.5 p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-400 font-semibold"
              >
                {expandedFolders.entity ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Folder className="h-4 w-4 text-indigo-400 fill-current" />
                <span>com.sims.entity</span>
              </div>
              {expandedFolders.entity && (
                <div className="pl-6 space-y-1 mt-1 border-l border-slate-800 ml-3.5">
                  <div 
                    onClick={() => setActivePath('Student.java')}
                    className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${
                      activePath === 'Student.java' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>Student.java</span>
                  </div>
                </div>
              )}
            </div>

            {/* Folder: Controller */}
            <div>
              <div 
                onClick={() => toggleFolder('controller')}
                className="flex items-center gap-1.5 p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-400 font-semibold"
              >
                {expandedFolders.controller ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Folder className="h-4 w-4 text-indigo-400 fill-current" />
                <span>com.sims.controller</span>
              </div>
              {expandedFolders.controller && (
                <div className="pl-6 space-y-1 mt-1 border-l border-slate-800 ml-3.5">
                  <div 
                    onClick={() => setActivePath('StudentController.java')}
                    className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${
                      activePath === 'StudentController.java' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>StudentController.java</span>
                  </div>
                </div>
              )}
            </div>

            {/* Folder: Exception */}
            <div>
              <div 
                onClick={() => toggleFolder('exception')}
                className="flex items-center gap-1.5 p-2 hover:bg-slate-800 rounded-lg cursor-pointer text-slate-400 font-semibold"
              >
                {expandedFolders.exception ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <Folder className="h-4 w-4 text-indigo-400 fill-current" />
                <span>com.sims.exception</span>
              </div>
              {expandedFolders.exception && (
                <div className="pl-6 space-y-1 mt-1 border-l border-slate-800 ml-3.5">
                  <div 
                    onClick={() => setActivePath('GlobalExceptionHandler.java')}
                    className={`flex items-center gap-2 p-1.5 rounded-md cursor-pointer ${
                      activePath === 'GlobalExceptionHandler.java' ? 'bg-indigo-600/30 text-indigo-300' : 'hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5" />
                    <span>GlobalExceptionHandler.java</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Code Editor Display */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950 border border-slate-900 rounded-3xl overflow-hidden shadow-2xl min-h-[500px]">
          {/* Header tabs row */}
          <div className="bg-slate-900 px-6 py-3 border-b border-slate-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-indigo-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">{activeFile.path}</span>
            </div>
            
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer border border-slate-700/50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  Code Copied!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy File
                </>
              )}
            </button>
          </div>

          {/* Core Content Viewer */}
          <div className="p-6 overflow-auto text-xs font-mono max-h-[500px] leading-relaxed select-text">
            <pre className="text-slate-300">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
