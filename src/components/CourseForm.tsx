import React, { useState } from 'react';
import { Course } from '../types';
import { coursesAPI } from '../lib/database';
import { X, Save, Calendar, Users, DollarSign } from 'lucide-react';

interface CourseFormProps {
  course?: Course;
  onClose: () => void;
  onSave: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({ course, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: course?.name || '',
    description: course?.description || '',
    instructor: course?.instructor || '',
    price: course?.price || 0,
    modules: course?.modules || 1,
    startDate: course?.startDate || '',
    endDate: course?.endDate || '',
    maxStudents: course?.maxStudents || 20,
    status: course?.status || 'active' as const,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del curso es obligatorio';
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'El instructor es obligatorio';
    }

    if (formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.modules <= 0) {
      newErrors.modules = 'Debe tener al menos 1 módulo';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es obligatoria';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la de inicio';
    }

    if (formData.maxStudents <= 0) {
      newErrors.maxStudents = 'Debe permitir al menos 1 estudiante';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (course) {
        coursesAPI.update(course.id, formData);
      } else {
        coursesAPI.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar el curso:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-academic-darkgray">
            {course ? 'Editar Curso' : 'Nuevo Curso'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="label">
                Nombre del Curso *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Ej: Programación Web Full Stack"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="input-field resize-none"
                placeholder="Descripción detallada del curso..."
              />
            </div>

            <div>
              <label className="label">
                Instructor *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleChange}
                className={`input-field ${errors.instructor ? 'border-red-500' : ''}`}
                placeholder="Nombre del instructor"
              />
              {errors.instructor && (
                <p className="text-red-500 text-sm mt-1">{errors.instructor}</p>
              )}
            </div>

            <div>
              <label className="label">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
                <option value="completed">Completado</option>
              </select>
            </div>
          </div>

          {/* Información financiera y académica */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="label flex items-center">
                <DollarSign size={16} className="mr-1" />
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="100"
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="label">
                Módulos *
              </label>
              <input
                type="number"
                name="modules"
                value={formData.modules}
                onChange={handleChange}
                min="1"
                className={`input-field ${errors.modules ? 'border-red-500' : ''}`}
                placeholder="1"
              />
              {errors.modules && (
                <p className="text-red-500 text-sm mt-1">{errors.modules}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center">
                <Users size={16} className="mr-1" />
                Máx. Estudiantes *
              </label>
              <input
                type="number"
                name="maxStudents"
                value={formData.maxStudents}
                onChange={handleChange}
                min="1"
                className={`input-field ${errors.maxStudents ? 'border-red-500' : ''}`}
                placeholder="20"
              />
              {errors.maxStudents && (
                <p className="text-red-500 text-sm mt-1">{errors.maxStudents}</p>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label flex items-center">
                <Calendar size={16} className="mr-1" />
                Fecha de Inicio *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`input-field ${errors.startDate ? 'border-red-500' : ''}`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="label flex items-center">
                <Calendar size={16} className="mr-1" />
                Fecha de Fin *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`input-field ${errors.endDate ? 'border-red-500' : ''}`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
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
              {loading ? 'Guardando...' : 'Guardar Curso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;