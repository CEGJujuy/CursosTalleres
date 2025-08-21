/*
  # Sistema de Gestión de Cursos y Talleres - Esquema Local
  
  Este archivo documenta la estructura de datos que se maneja localmente
  en localStorage del navegador.
  
  ## Colecciones de Datos:
  
  1. **Cursos (courses)**
     - Información completa de cursos y talleres
     - Precios, módulos, fechas, instructores
     - Control de cupos y estados
  
  2. **Estudiantes (students)**
     - Datos personales y de contacto
     - Información de emergencia
     - Validación de emails y documentos únicos
  
  3. **Inscripciones (enrollments)**
     - Relación estudiante-curso
     - Control de montos pagados y pendientes
     - Estados de inscripción
  
  4. **Pagos (payments)**
     - Registro de todos los pagos
     - Métodos de pago y comprobantes
     - Relación con inscripciones
  
  5. **Recordatorios (reminders)**
     - Sistema de notificaciones
     - WhatsApp y email
     - Mensajes personalizables
  
  ## Características del Sistema:
  
  - ✅ Base de datos local (localStorage)
  - ✅ Sin dependencias externas
  - ✅ Datos persistentes en el navegador
  - ✅ Interfaz académica profesional
  - ✅ Colores institucionales (azul, blanco, gris)
  - ✅ Gestión completa de cursos y estudiantes
  - ✅ Sistema de pagos con comprobantes
  - ✅ Exportación de datos a CSV
  - ✅ Dashboard con estadísticas
  
  ## Próximas Funcionalidades:
  
  - 🔄 Sistema de inscripciones automáticas
  - 🔄 Recordatorios por WhatsApp/Email
  - 🔄 Reportes avanzados por curso/alumno
  - 🔄 Plantillas de mensajes editables
  - 🔄 Notificaciones automáticas de vencimientos
*/

-- Este archivo es solo documentativo para el sistema local
-- Los datos se manejan completamente en localStorage