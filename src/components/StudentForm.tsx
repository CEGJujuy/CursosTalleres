import React, { useState } from 'react';
import { Student } from '../types';
import { studentsAPI } from '../lib/database';
import { X, Save, User, Mail, Phone, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { validateEmail, validatePhone } from '../lib/utils';

interface StudentFormProps {
  student?: Student;
  onClose: () => void;
  onSave: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ student, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: student?.firstName || '',
    lastName: student?.lastName || '',
    email: student?.email || '',
    phone: student?.phone || '',
    document: student?.document || '',
    documentType: student?.documentType || 'dni' as const,
    address: student?.address || '',
    birthDate: student?.birthDate || '',
    emergencyContact: student?.emergencyContact || '',
    emergencyPhone: student?.emergencyPhone || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'El teléfono no es válido';
    }

    if (!formData.document.trim()) {
      newErrors.document = 'El documento es obligatorio';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    }

    if (!formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'El contacto de emergencia es obligatorio';
    }

    if (!formData.emergencyPhone.trim()) {
      newErrors.emergencyPhone = 'El teléfono de emergencia es obligatorio';
    } else if (!validatePhone(formData.emergencyPhone)) {
      newErrors.emergencyPhone = 'El teléfono de emergencia no es válido';
    }

    // Verificar email único
    if (formData.email) {
      const existingStudents = studentsAPI.getAll();
      const emailExists = existingStudents.some(s => 
        s.email === formData.email && s.id !== student?.id
      );
      if (emailExists) {
        newErrors.email = 'Ya existe un estudiante con este email';
      }
    }

    // Verificar documento único
    if (formData.document) {
      const existingStudents = studentsAPI.getAll();
      const documentExists = existingStudents.some(s => 
        s.document === formData.document && s.id !== student?.id
      );
      if (documentExists) {
        newErrors.document = 'Ya existe un estudiante con este documento';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (student) {
        studentsAPI.update(student.id, formData);
      } else {
        studentsAPI.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar el estudiante:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-academic-darkgray">
            {student ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información personal */}
          <div>
            <h3 className="text-lg font-medium text-academic-darkgray mb-4 flex items-center">
              <User size={20} className="mr-2" />
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input-field ${errors.firstName ? 'border-red-500' : ''}`}
                  placeholder="Nombre"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input-field ${errors.lastName ? 'border-red-500' : ''}`}
                  placeholder="Apellido"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center">
                  <Calendar size={16} className="mr-1" />
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`input-field ${errors.birthDate ? 'border-red-500' : ''}`}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
                )}
              </div>

              <div>
                <label className="label">
                  Tipo de Documento
                </label>
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="dni">DNI</option>
                  <option value="passport">Pasaporte</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="label">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  name="document"
                  value={formData.document}
                  onChange={handleChange}
                  className={`input-field ${errors.document ? 'border-red-500' : ''}`}
                  placeholder="12345678"
                />
                {errors.document && (
                  <p className="text-red-500 text-sm mt-1">{errors.document}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center">
                  <MapPin size={16} className="mr-1" />
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Dirección completa"
                />
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div>
            <h3 className="text-lg font-medium text-academic-darkgray mb-4 flex items-center">
              <Mail size={20} className="mr-2" />
              Información de Contacto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label flex items-center">
                  <Mail size={16} className="mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="email@ejemplo.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center">
                  <Phone size={16} className="mr-1" />
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contacto de emergencia */}
          <div>
            <h3 className="text-lg font-medium text-academic-darkgray mb-4 flex items-center">
              <AlertTriangle size={20} className="mr-2" />
              Contacto de Emergencia
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">
                  Nombre del Contacto *
                </label>
                <input
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className={`input-field ${errors.emergencyContact ? 'border-red-500' : ''}`}
                  placeholder="Nombre completo"
                />
                {errors.emergencyContact && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>
                )}
              </div>

              <div>
                <label className="label flex items-center">
                  <Phone size={16} className="mr-1" />
                  Teléfono de Emergencia *
                </label>
                <input
                  type="tel"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                  className={`input-field ${errors.emergencyPhone ? 'border-red-500' : ''}`}
                  placeholder="+54 11 1234-5678"
                />
                {errors.emergencyPhone && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>
                )}
              </div>
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
              {loading ? 'Guardando...' : 'Guardar Estudiante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;