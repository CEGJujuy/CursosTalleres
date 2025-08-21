import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  DollarSign,
  BookOpen,
  Filter,
  MoreVertical
} from 'lucide-react';
import { Course } from '../types';
import { coursesAPI } from '../lib/database';
import { formatCurrency, formatDate } from '../lib/utils';
import CourseForm from '../components/CourseForm';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter]);

  const loadCourses = () => {
    setLoading(true);
    try {
      const coursesData = coursesAPI.getAll();
      setCourses(coursesData);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setShowForm(true);
  };

  const handleDelete = (course: Course) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.name}"?`)) {
      coursesAPI.delete(course.id);
      loadCourses();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedCourse(undefined);
  };

  const handleFormSave = () => {
    loadCourses();
  };

  const getStatusBadge = (status: Course['status']) => {
    const statusConfig = {
      active: { label: 'Activo', className: 'bg-green-100 text-green-800' },
      inactive: { label: 'Inactivo', className: 'bg-gray-100 text-gray-800' },
      completed: { label: 'Completado', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue mx-auto"></div>
          <p className="mt-4 text-academic-gray">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-darkgray">Cursos</h1>
          <p className="text-academic-gray">Gestiona los cursos y talleres disponibles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <Plus size={16} className="mr-2" />
          Nuevo Curso
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-gray" size={20} />
              <input
                type="text"
                placeholder="Buscar cursos por nombre, instructor o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-academic-gray" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field min-w-[120px]"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-academic-darkgray mb-2">
                    {course.name}
                  </h3>
                  {getStatusBadge(course.status)}
                </div>
                <div className="relative">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical size={16} className="text-academic-gray" />
                  </button>
                </div>
              </div>

              <p className="text-academic-gray text-sm mb-4 line-clamp-2">
                {course.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-academic-gray">
                  <BookOpen size={16} className="mr-2" />
                  <span>Instructor: {course.instructor}</span>
                </div>
                
                <div className="flex items-center text-sm text-academic-gray">
                  <Users size={16} className="mr-2" />
                  <span>{course.currentStudents}/{course.maxStudents} estudiantes</span>
                </div>

                <div className="flex items-center text-sm text-academic-gray">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(course.startDate)} - {formatDate(course.endDate)}</span>
                </div>

                <div className="flex items-center text-sm text-academic-gray">
                  <DollarSign size={16} className="mr-2" />
                  <span className="font-medium text-academic-darkgray">
                    {formatCurrency(course.price)}
                  </span>
                  <span className="ml-1">({course.modules} módulos)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-academic-gray mb-1">
                  <span>Ocupación</span>
                  <span>{Math.round((course.currentStudents / course.maxStudents) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-academic-blue h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(course.currentStudents / course.maxStudents) * 100}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(course)}
                  className="flex-1 btn-secondary flex items-center justify-center"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(course)}
                  className="btn-danger flex items-center justify-center px-3"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-academic-gray mb-4" />
              <h3 className="text-lg font-medium text-academic-darkgray mb-2">
                No se encontraron cursos
              </h3>
              <p className="text-academic-gray mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'Comienza creando tu primer curso'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary flex items-center mx-auto"
                >
                  <Plus size={16} className="mr-2" />
                  Crear Primer Curso
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <CourseForm
          course={selectedCourse}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default Courses;