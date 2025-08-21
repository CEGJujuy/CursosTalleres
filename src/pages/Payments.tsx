import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  CreditCard, 
  Calendar,
  DollarSign,
  FileText,
  Filter,
  Download,
  Eye,
  AlertCircle
} from 'lucide-react';
import { Payment, Enrollment, Student, Course } from '../types';
import { paymentsAPI, enrollmentsAPI, studentsAPI, coursesAPI } from '../lib/database';
import { formatCurrency, formatDate, exportToCSV } from '../lib/utils';
import PaymentForm from '../components/PaymentForm';

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, methodFilter, dateFilter]);

  const loadData = () => {
    setLoading(true);
    try {
      const paymentsData = paymentsAPI.getAll();
      const enrollmentsData = enrollmentsAPI.getAll();
      setPayments(paymentsData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(payment => {
        const student = studentsAPI.getById(payment.studentId);
        const course = coursesAPI.getById(payment.courseId);
        const studentName = `${student?.firstName} ${student?.lastName}`.toLowerCase();
        const courseName = course?.name.toLowerCase() || '';
        const description = payment.description.toLowerCase();
        
        return studentName.includes(searchTerm.toLowerCase()) ||
               courseName.includes(searchTerm.toLowerCase()) ||
               description.includes(searchTerm.toLowerCase());
      });
    }

    // Filtrar por método de pago
    if (methodFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentMethod === methodFilter);
    }

    // Filtrar por fecha
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(payment => 
            new Date(payment.paymentDate) >= filterDate
          );
          break;
      }
    }

    // Ordenar por fecha más reciente
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredPayments(filtered);
  };

  const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
    const methods = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
      other: 'Otro',
    };
    return methods[method];
  };

  const getPaymentMethodBadge = (method: Payment['paymentMethod']) => {
    const methodConfig = {
      cash: { label: 'Efectivo', className: 'bg-green-100 text-green-800' },
      transfer: { label: 'Transferencia', className: 'bg-blue-100 text-blue-800' },
      card: { label: 'Tarjeta', className: 'bg-purple-100 text-purple-800' },
      other: { label: 'Otro', className: 'bg-gray-100 text-gray-800' },
    };

    const config = methodConfig[method];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleNewPayment = (enrollmentId?: string) => {
    setSelectedEnrollmentId(enrollmentId || '');
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEnrollmentId('');
  };

  const handleFormSave = () => {
    loadData();
  };

  const handleExportCSV = () => {
    const exportData = filteredPayments.map(payment => {
      const student = studentsAPI.getById(payment.studentId);
      const course = coursesAPI.getById(payment.courseId);
      
      return {
        'Fecha': formatDate(payment.paymentDate),
        'Estudiante': `${student?.firstName} ${student?.lastName}`,
        'Curso': course?.name,
        'Monto': payment.amount,
        'Método': getPaymentMethodLabel(payment.paymentMethod),
        'Módulo': payment.module || 'N/A',
        'Descripción': payment.description,
        'Comprobante': payment.receiptPath ? 'Sí' : 'No',
      };
    });

    exportToCSV(exportData, `pagos-${new Date().toISOString().split('T')[0]}`);
  };

  const getTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const getPendingEnrollments = () => {
    return enrollments.filter(enrollment => enrollment.pendingAmount > 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue mx-auto"></div>
          <p className="mt-4 text-academic-gray">Cargando pagos...</p>
        </div>
      </div>
    );
  }

  const pendingEnrollments = getPendingEnrollments();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-darkgray">Pagos</h1>
          <p className="text-academic-gray">Gestiona los pagos y cuotas de los estudiantes</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={handleExportCSV}
            className="btn-secondary flex items-center"
          >
            <Download size={16} className="mr-2" />
            Exportar CSV
          </button>
          <button
            onClick={() => handleNewPayment()}
            className="btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Registrar Pago
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-academic-gray">Total Recaudado</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalAmount())}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-academic-gray">Pagos Registrados</p>
              <p className="text-2xl font-bold text-academic-darkgray">
                {filteredPayments.length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-academic-gray">Pendientes</p>
              <p className="text-2xl font-bold text-red-600">
                {pendingEnrollments.length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Inscripciones con pagos pendientes */}
      {pendingEnrollments.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-academic-darkgray flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} />
              Pagos Pendientes
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEnrollments.slice(0, 6).map((enrollment) => {
              const student = studentsAPI.getById(enrollment.studentId);
              const course = coursesAPI.getById(enrollment.courseId);
              
              return (
                <div key={enrollment.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-academic-darkgray">
                        {student?.firstName} {student?.lastName}
                      </p>
                      <p className="text-sm text-academic-gray">{course?.name}</p>
                    </div>
                    <button
                      onClick={() => handleNewPayment(enrollment.id)}
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Pagar
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-academic-gray">Debe:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(enrollment.pendingAmount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar por estudiante, curso o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
              <option value="other">Otro</option>
            </select>
          </div>
          
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de pagos */}
      <div className="card">
        {filteredPayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Estudiante
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Curso
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Monto
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Método
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Detalles
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Comprobante
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const student = studentsAPI.getById(payment.studentId);
                  const course = coursesAPI.getById(payment.courseId);
                  
                  return (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center text-sm">
                          <Calendar size={14} className="mr-2 text-academic-gray" />
                          <span>{formatDate(payment.paymentDate)}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-academic-darkgray">
                            {student?.firstName} {student?.lastName}
                          </p>
                          <p className="text-sm text-academic-gray">{student?.email}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-academic-darkgray">
                            {course?.name}
                          </p>
                          {payment.module && (
                            <p className="text-sm text-academic-gray">
                              Módulo {payment.module}
                            </p>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <p className="font-bold text-green-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </td>
                      
                      <td className="py-4 px-4">
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </td>
                      
                      <td className="py-4 px-4">
                        <p className="text-sm text-academic-gray max-w-[200px] truncate">
                          {payment.description}
                        </p>
                      </td>
                      
                      <td className="py-4 px-4">
                        {payment.receiptPath ? (
                          <button className="flex items-center text-academic-blue hover:text-blue-700 text-sm">
                            <FileText size={14} className="mr-1" />
                            Ver
                          </button>
                        ) : (
                          <span className="text-academic-gray text-sm">Sin comprobante</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard size={48} className="mx-auto text-academic-gray mb-4" />
            <h3 className="text-lg font-medium text-academic-darkgray mb-2">
              No se encontraron pagos
            </h3>
            <p className="text-academic-gray mb-4">
              {searchTerm || methodFilter !== 'all' || dateFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los pagos registrados aparecerán aquí'
              }
            </p>
            {!searchTerm && methodFilter === 'all' && dateFilter === 'all' && (
              <button
                onClick={() => handleNewPayment()}
                className="btn-primary flex items-center mx-auto"
              >
                <Plus size={16} className="mr-2" />
                Registrar Primer Pago
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <PaymentForm
          enrollmentId={selectedEnrollmentId}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default Payments;