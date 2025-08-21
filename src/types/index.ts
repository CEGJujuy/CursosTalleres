export interface Course {
  id: string;
  name: string;
  description: string;
  instructor: string;
  price: number;
  modules: number;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  document: string;
  documentType: 'dni' | 'passport' | 'other';
  address: string;
  birthDate: string;
  emergencyContact: string;
  emergencyPhone: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped';
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface Payment {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'transfer' | 'card' | 'other';
  module?: number;
  description: string;
  receiptPath?: string;
  createdAt: string;
}

export interface PaymentReminder {
  id: string;
  enrollmentId: string;
  studentId: string;
  courseId: string;
  reminderDate: string;
  reminderType: 'whatsapp' | 'email';
  message: string;
  sent: boolean;
  sentAt?: string;
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
  activeCourses: number;
}