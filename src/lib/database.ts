// Simulación de base de datos local con localStorage
import { Course, Student, Enrollment, Payment, PaymentReminder, DashboardStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
  COURSES: 'courses',
  STUDENTS: 'students',
  ENROLLMENTS: 'enrollments',
  PAYMENTS: 'payments',
  REMINDERS: 'reminders',
};

// Inicializar datos de ejemplo si no existen
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.COURSES)) {
    const sampleCourses: Course[] = [
      {
        id: uuidv4(),
        name: 'Programación Web Full Stack',
        description: 'Curso completo de desarrollo web con React, Node.js y bases de datos',
        instructor: 'Prof. María González',
        price: 45000,
        modules: 8,
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        maxStudents: 25,
        currentStudents: 18,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Diseño UX/UI',
        description: 'Fundamentos de diseño de experiencia de usuario e interfaces',
        instructor: 'Prof. Carlos Ruiz',
        price: 35000,
        modules: 6,
        startDate: '2024-02-15',
        endDate: '2024-05-15',
        maxStudents: 20,
        currentStudents: 15,
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(sampleCourses));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    const sampleStudents: Student[] = [
      {
        id: uuidv4(),
        firstName: 'Ana',
        lastName: 'Martínez',
        email: 'ana.martinez@email.com',
        phone: '+54 11 1234-5678',
        document: '12345678',
        documentType: 'dni',
        address: 'Av. Corrientes 1234, CABA',
        birthDate: '1995-05-15',
        emergencyContact: 'Pedro Martínez',
        emergencyPhone: '+54 11 8765-4321',
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+54 11 2345-6789',
        document: '87654321',
        documentType: 'dni',
        address: 'Calle Falsa 123, CABA',
        birthDate: '1992-08-22',
        emergencyContact: 'María Pérez',
        emergencyPhone: '+54 11 9876-5432',
        createdAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(sampleStudents));
  }

  // Inicializar otras colecciones vacías si no existen
  if (!localStorage.getItem(STORAGE_KEYS.ENROLLMENTS)) {
    localStorage.setItem(STORAGE_KEYS.ENROLLMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REMINDERS)) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
  }
};

// Funciones genéricas para CRUD
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// API de Cursos
export const coursesAPI = {
  getAll: (): Course[] => getFromStorage<Course>(STORAGE_KEYS.COURSES),
  
  getById: (id: string): Course | undefined => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES);
    return courses.find(course => course.id === id);
  },
  
  create: (courseData: Omit<Course, 'id' | 'createdAt' | 'currentStudents'>): Course => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES);
    const newCourse: Course = {
      ...courseData,
      id: uuidv4(),
      currentStudents: 0,
      createdAt: new Date().toISOString(),
    };
    courses.push(newCourse);
    saveToStorage(STORAGE_KEYS.COURSES, courses);
    return newCourse;
  },
  
  update: (id: string, courseData: Partial<Course>): Course | null => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES);
    const index = courses.findIndex(course => course.id === id);
    if (index === -1) return null;
    
    courses[index] = { ...courses[index], ...courseData };
    saveToStorage(STORAGE_KEYS.COURSES, courses);
    return courses[index];
  },
  
  delete: (id: string): boolean => {
    const courses = getFromStorage<Course>(STORAGE_KEYS.COURSES);
    const filteredCourses = courses.filter(course => course.id !== id);
    if (filteredCourses.length === courses.length) return false;
    
    saveToStorage(STORAGE_KEYS.COURSES, filteredCourses);
    return true;
  },
};

// API de Estudiantes
export const studentsAPI = {
  getAll: (): Student[] => getFromStorage<Student>(STORAGE_KEYS.STUDENTS),
  
  getById: (id: string): Student | undefined => {
    const students = getFromStorage<Student>(STORAGE_KEYS.STUDENTS);
    return students.find(student => student.id === id);
  },
  
  create: (studentData: Omit<Student, 'id' | 'createdAt'>): Student => {
    const students = getFromStorage<Student>(STORAGE_KEYS.STUDENTS);
    const newStudent: Student = {
      ...studentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },
  
  update: (id: string, studentData: Partial<Student>): Student | null => {
    const students = getFromStorage<Student>(STORAGE_KEYS.STUDENTS);
    const index = students.findIndex(student => student.id === id);
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...studentData };
    saveToStorage(STORAGE_KEYS.STUDENTS, students);
    return students[index];
  },
  
  delete: (id: string): boolean => {
    const students = getFromStorage<Student>(STORAGE_KEYS.STUDENTS);
    const filteredStudents = students.filter(student => student.id !== id);
    if (filteredStudents.length === students.length) return false;
    
    saveToStorage(STORAGE_KEYS.STUDENTS, filteredStudents);
    return true;
  },
};

// API de Inscripciones
export const enrollmentsAPI = {
  getAll: (): Enrollment[] => getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS),
  
  getById: (id: string): Enrollment | undefined => {
    const enrollments = getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS);
    return enrollments.find(enrollment => enrollment.id === id);
  },
  
  getByStudentId: (studentId: string): Enrollment[] => {
    const enrollments = getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS);
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  },
  
  getByCourseId: (courseId: string): Enrollment[] => {
    const enrollments = getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS);
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  },
  
  create: (enrollmentData: Omit<Enrollment, 'id'>): Enrollment => {
    const enrollments = getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS);
    const newEnrollment: Enrollment = {
      ...enrollmentData,
      id: uuidv4(),
    };
    enrollments.push(newEnrollment);
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);
    
    // Actualizar contador de estudiantes en el curso
    const course = coursesAPI.getById(enrollmentData.courseId);
    if (course) {
      coursesAPI.update(course.id, { currentStudents: course.currentStudents + 1 });
    }
    
    return newEnrollment;
  },
  
  update: (id: string, enrollmentData: Partial<Enrollment>): Enrollment | null => {
    const enrollments = getFromStorage<Enrollment>(STORAGE_KEYS.ENROLLMENTS);
    const index = enrollments.findIndex(enrollment => enrollment.id === id);
    if (index === -1) return null;
    
    enrollments[index] = { ...enrollments[index], ...enrollmentData };
    saveToStorage(STORAGE_KEYS.ENROLLMENTS, enrollments);
    return enrollments[index];
  },
};

// API de Pagos
export const paymentsAPI = {
  getAll: (): Payment[] => getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS),
  
  getByEnrollmentId: (enrollmentId: string): Payment[] => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);
    return payments.filter(payment => payment.enrollmentId === enrollmentId);
  },
  
  create: (paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment => {
    const payments = getFromStorage<Payment>(STORAGE_KEYS.PAYMENTS);
    const newPayment: Payment = {
      ...paymentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    payments.push(newPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    
    // Actualizar montos en la inscripción
    const enrollment = enrollmentsAPI.getById(paymentData.enrollmentId);
    if (enrollment) {
      const newPaidAmount = enrollment.paidAmount + paymentData.amount;
      const newPendingAmount = enrollment.totalAmount - newPaidAmount;
      enrollmentsAPI.update(enrollment.id, {
        paidAmount: newPaidAmount,
        pendingAmount: newPendingAmount,
      });
    }
    
    return newPayment;
  },
};

// API de Dashboard
export const dashboardAPI = {
  getStats: (): DashboardStats => {
    const courses = coursesAPI.getAll();
    const students = studentsAPI.getAll();
    const enrollments = enrollmentsAPI.getAll();
    const payments = paymentsAPI.getAll();
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const pendingPayments = enrollments.reduce((sum, enrollment) => sum + enrollment.pendingAmount, 0);
    const activeCourses = courses.filter(course => course.status === 'active').length;
    
    return {
      totalCourses: courses.length,
      totalStudents: students.length,
      totalEnrollments: enrollments.length,
      totalRevenue,
      pendingPayments,
      activeCourses,
    };
  },
};

// Inicializar datos al cargar
initializeData();