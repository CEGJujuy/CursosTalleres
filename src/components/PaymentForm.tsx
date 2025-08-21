import React, { useState, useEffect } from 'react';
import { Payment, Enrollment, Student, Course } from '../types';
import { paymentsAPI, enrollmentsAPI, studentsAPI, coursesAPI } from '../lib/database';
import { X, Save, CreditCard, Upload, FileText, DollarSign } from 'lucide-react';
import { formatCurrency } from '../lib/utils';

interface PaymentFormProps {
  enrollmentId?: string;
  onClose: () => void;
  onSave: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ enrollmentId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    enrollmentId: enrollmentId || '',
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash' as const,
    module: 1,
    description: '',
    receiptFile: null as File | null,
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar inscripciones
    const allEnrollments = enrollmentsAPI.getAll();
    setEnrollments(allEnrollments);

    // Si hay un enrollmentId específico, seleccionarlo
    if (enrollmentId) {
      const enrollment = allEnrollments.find(e => e.id === enrollmentId);
      if (enrollment) {
        setSelectedEnrollment(enrollment);
        loadEnrollmentDetails(enrollment);
      }
    }
  }, [enrollmentId]);

  const loadEnrollmentDetails = (enrollment: Enrollment) => {
    const studentData = studentsAPI.getById(enrollment.studentId);
    const courseData = coursesAPI.getById(enrollment.courseId);
    
    setStudent(studentData || null);
    setCourse(courseData || null);
    
    // Sugerir monto basado en el pendiente
    if (enrollment.pendingAmount > 0) {
      const suggestedAmount = courseData ? 
        Math.ceil(enrollment.pendingAmount / courseData.modules) : 
        enrollment.pendingAmount;
      
      setFormData(prev => ({
        ...prev,
        amount: suggestedAmount,
        description: `Pago módulo ${prev.module} - ${courseData?.name || 'Curso'}`,
      }));
    }
  };

  const handleEnrollmentChange = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (enrollment) {
      setSelectedEnrollment(enrollment);
      loadEnrollmentDetails(enrollment);
      setFormData(prev => ({ ...prev, enrollmentId }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.enrollmentId) {
      newErrors.enrollmentId = 'Debe seleccionar una inscripción';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (selectedEnrollment && formData.amount > selectedEnrollment.pendingAmount) {
      newErrors.amount = `El monto no puede ser mayor al pendiente (${formatCurrency(selectedEnrollment.pendingAmount)})`;
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = 'La fecha de pago es obligatoria';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !selectedEnrollment || !student || !course) return;

    setLoading(true);
    try {
      // Simular subida de archivo (en un sistema real, subirías a un servidor)
      let receiptPath = undefined;
      if (formData.receiptFile) {
        receiptPath = `receipts/${Date.now()}-${formData.receiptFile.name}`;
        // Aquí normalmente subirías el archivo a un servidor o almacenamiento
      }

      const paymentData = {
        enrollmentId: formData.enrollmentId,
        studentId: selectedEnrollment.studentId,
        courseId: selectedEnrollment.courseId,
        amount: formData.amount,
        paymentDate: formData.paymentDate,
        paymentMethod: formData.paymentMethod,
        module: formData.module,
        description: formData.description,
        receiptPath,
      };

      paymentsAPI.create(paymentData);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al registrar el pago:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, receiptFile: 'Solo se permiten archivos JPG, PNG o PDF' }));
        return;
      }
      
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, receiptFile: 'El archivo no puede ser mayor a 5MB' }));
        return;
      }
      
      setFormData(prev => ({ ...prev, receiptFile: file }));
      setErrors(prev => ({ ...prev, receiptFile: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-academic-darkgray flex items-center">
            <CreditCard size={24} className="mr-2" />
            Registrar Pago
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de inscripción */}
          {!enrollmentId && (
            <div>
              <label className="label">
                Inscripción *
              </label>
              <select
                name="enrollmentId"
                value={formData.enrollmentId}
                onChange={(e) => handleEnrollmentChange(e.target.value)}
                className={`input-field ${errors.enrollmentId ? 'border-red-500' : ''}`}
              >
                <option value="">Seleccionar inscripción...</option>
                {enrollments.map((enrollment) => {
                  const studentData = studentsAPI.getById(enrollment.studentId);
                  const courseData = coursesAPI.getById(enrollment.courseId);
                  return (
                    <option key={enrollment.id} value={enrollment.id}>
                      {studentData?.firstName} {studentData?.lastName} - {courseData?.name} 
                      (Pendiente: {formatCurrency(enrollment.pendingAmount)})
                    </option>
                  );
                })}
              </select>
              {errors.enrollmentId && (
                <p className="text-red-500 text-sm mt-1">{errors.enrollmentId}</p>
              )}
            </div>
          )}

          {/* Información de la inscripción seleccionada */}
          {selectedEnrollment && student && course && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-academic-blue mb-2">Información de la Inscripción</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Estudiante:</strong> {student.firstName} {student.lastName}</p>
                  <p><strong>Email:</strong> {student.email}</p>
                </div>
                <div>
                  <p><strong>Curso:</strong> {course.name}</p>
                  <p><strong>Monto Total:</strong> {formatCurrency(selectedEnrollment.totalAmount)}</p>
                </div>
                <div>
                  <p><strong>Pagado:</strong> {formatCurrency(selectedEnrollment.paidAmount)}</p>
                </div>
                <div>
                  <p><strong>Pendiente:</strong> <span className="text-red-600 font-medium">{formatCurrency(selectedEnrollment.pendingAmount)}</span></p>
                </div>
              </div>
            </div>
          )}

          {/* Detalles del pago */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center">
                <DollarSign size={16} className="mr-1" />
                Monto *
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="100"
                className={`input-field ${errors.amount ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
            </div>

            <div>
              <label className="label">
                Fecha de Pago *
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className={`input-field ${errors.paymentDate ? 'border-red-500' : ''}`}
              />
              {errors.paymentDate && (
                <p className="text-red-500 text-sm mt-1">{errors.paymentDate}</p>
              )}
            </div>

            <div>
              <label className="label">
                Método de Pago
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="input-field"
              >
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia</option>
                <option value="card">Tarjeta</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div>
              <label className="label">
                Módulo
              </label>
              <input
                type="number"
                name="module"
                value={formData.module}
                onChange={handleChange}
                min="1"
                max={course?.modules || 1}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="label">
              Descripción *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className={`input-field resize-none ${errors.description ? 'border-red-500' : ''}`}
              placeholder="Descripción del pago..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Subida de comprobante */}
          <div>
            <label className="label flex items-center">
              <Upload size={16} className="mr-1" />
              Comprobante (Opcional)
            </label>
            <div className="mt-2">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-academic-blue hover:bg-blue-50 transition-colors"
              >
                <div className="text-center">
                  <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {formData.receiptFile ? formData.receiptFile.name : 'Haz clic para subir un comprobante'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG o PDF (máx. 5MB)
                  </p>
                </div>
              </label>
              {errors.receiptFile && (
                <p className="text-red-500 text-sm mt-1">{errors.receiptFile}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Registrando...' : 'Registrar Pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;