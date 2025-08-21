import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { dashboardAPI, coursesAPI, studentsAPI, enrollmentsAPI, paymentsAPI } from '../lib/database';
import { DashboardStats, Course, Student, Enrollment, Payment } from '../types';
import { formatCurrency, formatDate } from '../lib/utils';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Cargar estadísticas
    const dashboardStats = dashboardAPI.getStats();
    setStats(dashboardStats);

    // Cargar actividad reciente (últimos pagos y inscripciones)
    const payments = paymentsAPI.getAll().slice(-5).reverse();
    const enrollments = enrollmentsAPI.getAll().slice(-5).reverse();
    
    const activity = [
      ...payments.map(payment => {
        const student = studentsAPI.getById(payment.studentId);
        const course = coursesAPI.getById(payment.courseId);
        return {
          type: 'payment',
          date: payment.createdAt,
          description: `${student?.firstName} ${student?.lastName} pagó ${formatCurrency(payment.amount)} por ${course?.name}`,
          amount: payment.amount,
        };
      }),
      ...enrollments.map(enrollment => {
        const student = studentsAPI.getById(enrollment.studentId);
        const course = coursesAPI.getById(enrollment.courseId);
        return {
          type: 'enrollment',
          date: enrollment.enrollmentDate,
          description: `${student?.firstName} ${student?.lastName} se inscribió en ${course?.name}`,
          amount: enrollment.totalAmount,
        };
      }),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    setRecentActivity(activity);

    // Cargar próximos vencimientos (simulado)
    const enrollmentsWithDebt = enrollmentsAPI.getAll().filter(e => e.pendingAmount > 0);
    const upcoming = enrollmentsWithDebt.map(enrollment => {
      const student = studentsAPI.getById(enrollment.studentId);
      const course = coursesAPI.getById(enrollment.courseId);
      return {
        student: `${student?.firstName} ${student?.lastName}`,
        course: course?.name,
        amount: enrollment.pendingAmount,
        dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Fecha aleatoria en los próximos 30 días
      };
    }).slice(0, 5);

    setUpcomingPayments(upcoming);
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue mx-auto"></div>
          <p className="mt-4 text-academic-gray">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Cursos',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'bg-blue-500',
      change: '+2 este mes',
    },
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-green-500',
      change: '+12 este mes',
    },
    {
      title: 'Inscripciones Activas',
      value: stats.totalEnrollments,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8 este mes',
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: '+15% este mes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-darkgray">Dashboard</h1>
        <p className="text-academic-gray">Resumen general del sistema académico</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-academic-gray">{stat.title}</p>
                  <p className="text-2xl font-bold text-academic-darkgray mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alertas y Pendientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pagos Pendientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-academic-darkgray flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} />
              Pagos Pendientes
            </h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {formatCurrency(stats.pendingPayments)}
            </span>
          </div>
          <div className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm text-academic-darkgray">
                      {payment.student}
                    </p>
                    <p className="text-xs text-academic-gray">{payment.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm text-red-600">
                      {formatCurrency(payment.amount)}
                    </p>
                    <p className="text-xs text-academic-gray">
                      Vence: {formatDate(payment.dueDate)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-academic-gray text-sm text-center py-4">
                No hay pagos pendientes
              </p>
            )}
          </div>
        </div>

        {/* Cursos Activos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-academic-darkgray flex items-center">
              <Calendar className="mr-2 text-blue-500" size={20} />
              Cursos Activos
            </h3>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {stats.activeCourses}
            </span>
          </div>
          <div className="space-y-3">
            {coursesAPI.getAll().filter(c => c.status === 'active').slice(0, 4).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm text-academic-darkgray">
                    {course.name}
                  </p>
                  <p className="text-xs text-academic-gray">
                    {course.instructor}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    {course.currentStudents}/{course.maxStudents}
                  </p>
                  <p className="text-xs text-academic-gray">estudiantes</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actividad Reciente */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-academic-darkgray flex items-center">
            <Activity className="mr-2 text-green-500" size={20} />
            Actividad Reciente
          </h3>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full ${
                  activity.type === 'payment' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'payment' ? (
                    <CreditCard className={`${
                      activity.type === 'payment' ? 'text-green-600' : 'text-blue-600'
                    }`} size={16} />
                  ) : (
                    <Users className="text-blue-600" size={16} />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-academic-darkgray">{activity.description}</p>
                  <p className="text-xs text-academic-gray">
                    {formatDate(activity.date)}
                  </p>
                </div>
                {activity.type === 'payment' && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {formatCurrency(activity.amount)}
                    </p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-academic-gray text-center py-8">
              No hay actividad reciente
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;