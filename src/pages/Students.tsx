import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  User,
  Filter,
  Download,
  UserPlus
} from 'lucide-react';
import { Student, Enrollment } from '../types';
import { studentsAPI, enrollmentsAPI, coursesAPI } from '../lib/database';
import { formatDate, calculateAge, exportToCSV } from '../lib/utils';
import StudentForm from '../components/StudentForm';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const loadData = () => {
    setLoading(true);
    try {
      const studentsData = studentsAPI.getAll();
      const enrollmentsData = enrollmentsAPI.getAll();
      setStudents(studentsData);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.document.includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
  };

  const getStudentEnrollments = (studentId: string) => {
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  };

  const getStudentCourses = (studentId: string) => {
    const studentEnrollments = getStudentEnrollments(studentId);
    return studentEnrollments.map(enrollment => {
      const course = coursesAPI.getById(enrollment.courseId);
      return {
        ...enrollment,
        courseName: course?.name || 'Curso no encontrado',
      };
    });
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDelete = (student: Student) => {
    const studentEnrollments = getStudentEnrollments(student.id);
    
    if (studentEnrollments.length > 0) {
      alert('No se puede eliminar un estudiante que tiene inscripciones activas.');
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${student.firstName} ${student.lastName}?`)) {
      studentsAPI.delete(student.id);
      loadData();
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedStudent(undefined);
  };

  const handleFormSave = () => {
    loadData();
  };

  const handleExportCSV = () => {
    const exportData = filteredStudents.map(student => {
      const studentEnrollments = getStudentEnrollments(student.id);
      const totalPaid = studentEnrollments.reduce((sum, e) => sum + e.paidAmount, 0);
      const totalPending = studentEnrollments.reduce((sum, e) => sum + e.pendingAmount, 0);
      
      return {
        'Nombre': student.firstName,
        'Apellido': student.lastName,
        'Email': student.email,
        'Teléfono': student.phone,
        'Documento': student.document,
        'Edad': calculateAge(student.birthDate),
        'Inscripciones': studentEnrollments.length,
        'Total Pagado': totalPaid,
        'Total Pendiente': totalPending,
        'Fecha Registro': formatDate(student.createdAt),
      };
    });

    exportToCSV(exportData, `estudiantes-${new Date().toISOString().split('T')[0]}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-academic-blue mx-auto"></div>
          <p className="mt-4 text-academic-gray">Cargando estudiantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-darkgray">Estudiantes</h1>
          <p className="text-academic-gray">Gestiona la información de los estudiantes</p>
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
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Nuevo Estudiante
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-gray" size={20} />
          <input
            type="text"
            placeholder="Buscar estudiantes por nombre, email o documento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Lista de estudiantes */}
      <div className="card">
        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Estudiante
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Contacto
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Información
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Inscripciones
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-academic-darkgray">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentCourses = getStudentCourses(student.id);
                  const totalPending = studentCourses.reduce((sum, course) => sum + course.pendingAmount, 0);
                  
                  return (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-academic-blue rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.firstName[0]}{student.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-academic-darkgray">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-sm text-academic-gray">
                              {student.documentType.toUpperCase()}: {student.document}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-academic-gray">
                            <Mail size={14} className="mr-2" />
                            <span className="truncate max-w-[200px]">{student.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-academic-gray">
                            <Phone size={14} className="mr-2" />
                            <span>{student.phone}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-academic-gray">
                            <Calendar size={14} className="mr-2" />
                            <span>{calculateAge(student.birthDate)} años</span>
                          </div>
                          <div className="flex items-center text-sm text-academic-gray">
                            <MapPin size={14} className="mr-2" />
                            <span className="truncate max-w-[150px]">{student.address || 'No especificada'}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-sm font-medium text-academic-darkgray">
                            {studentCourses.length} curso{studentCourses.length !== 1 ? 's' : ''}
                          </p>
                          {totalPending > 0 && (
                            <p className="text-sm text-red-600">
                              Debe: ${totalPending.toLocaleString()}
                            </p>
                          )}
                          {studentCourses.length > 0 && (
                            <div className="mt-1">
                              {studentCourses.slice(0, 2).map((course, index) => (
                                <p key={index} className="text-xs text-academic-gray truncate max-w-[150px]">
                                  {course.courseName}
                                </p>
                              ))}
                              {studentCourses.length > 2 && (
                                <p className="text-xs text-academic-gray">
                                  +{studentCourses.length - 2} más
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 text-academic-blue hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar estudiante"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar estudiante"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-academic-gray mb-4" />
            <h3 className="text-lg font-medium text-academic-darkgray mb-2">
              No se encontraron estudiantes
            </h3>
            <p className="text-academic-gray mb-4">
              {searchTerm 
                ? 'Intenta ajustar el término de búsqueda'
                : 'Comienza registrando tu primer estudiante'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary flex items-center mx-auto"
              >
                <UserPlus size={16} className="mr-2" />
                Registrar Primer Estudiante
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={handleFormClose}
          onSave={handleFormSave}
        />
      )}
    </div>
  );
};

export default Students;