/*
  # Sistema de Gestión de Cursos y Talleres - Schema Inicial

  1. Nuevas Tablas
    - `courses` - Información de cursos y talleres
      - `id` (uuid, primary key)
      - `name` (text) - Nombre del curso
      - `description` (text) - Descripción del curso
      - `price` (decimal) - Precio total del curso
      - `modules` (integer) - Número de módulos
      - `start_date` (date) - Fecha de inicio
      - `end_date` (date) - Fecha de finalización
      - `instructor` (text) - Nombre del instructor
      - `max_students` (integer) - Máximo de estudiantes
      - `created_at` (timestamp)

    - `students` - Información de estudiantes
      - `id` (uuid, primary key)
      - `name` (text) - Nombre completo
      - `email` (text, unique) - Email del estudiante
      - `phone` (text) - Teléfono
      - `document_number` (text, unique) - Número de documento
      - `address` (text) - Dirección
      - `created_at` (timestamp)

    - `enrollments` - Inscripciones de estudiantes a cursos
      - `id` (uuid, primary key)
      - `student_id` (uuid, foreign key)
      - `course_id` (uuid, foreign key)
      - `enrollment_date` (timestamp)
      - `status` (enum) - Estado de la inscripción
      - `created_at` (timestamp)

    - `payments` - Pagos realizados por los estudiantes
      - `id` (uuid, primary key)
      - `enrollment_id` (uuid, foreign key)
      - `amount` (decimal) - Monto del pago
      - `payment_date` (date) - Fecha del pago
      - `module_number` (integer, optional) - Número de módulo
      - `payment_method` (enum) - Método de pago
      - `receipt_url` (text, optional) - URL del comprobante
      - `notes` (text, optional) - Notas adicionales
      - `created_at` (timestamp)

    - `reminders` - Recordatorios enviados
      - `id` (uuid, primary key)
      - `enrollment_id` (uuid, foreign key)
      - `type` (enum) - Tipo de recordatorio (whatsapp/email)
      - `message` (text) - Mensaje del recordatorio
      - `sent_date` (timestamp) - Fecha de envío
      - `status` (enum) - Estado del envío
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para usuarios autenticados
    - Índices para optimizar consultas

  3. Storage
    - Bucket para comprobantes de pago
*/

-- Crear tabla de cursos
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0,
  modules integer NOT NULL DEFAULT 1,
  start_date date NOT NULL,
  end_date date NOT NULL,
  instructor text NOT NULL,
  max_students integer NOT NULL DEFAULT 20,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de estudiantes
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  document_number text UNIQUE NOT NULL,
  address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de inscripciones
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date timestamptz DEFAULT now(),
  status text CHECK (status IN ('active', 'inactive', 'completed')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, course_id)
);

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date date NOT NULL,
  module_number integer,
  payment_method text CHECK (payment_method IN ('cash', 'transfer', 'card', 'other')) DEFAULT 'cash',
  receipt_url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Crear tabla de recordatorios
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id uuid REFERENCES enrollments(id) ON DELETE CASCADE,
  type text CHECK (type IN ('whatsapp', 'email')) NOT NULL,
  message text NOT NULL,
  sent_date timestamptz DEFAULT now(),
  status text CHECK (status IN ('sent', 'failed')) DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para cursos
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage courses"
  ON courses
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para estudiantes
CREATE POLICY "Anyone can read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage students"
  ON students
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para inscripciones
CREATE POLICY "Anyone can read enrollments"
  ON enrollments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage enrollments"
  ON enrollments
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para pagos
CREATE POLICY "Anyone can read payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para recordatorios
CREATE POLICY "Anyone can read reminders"
  ON reminders
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage reminders"
  ON reminders
  FOR ALL
  TO authenticated
  USING (true);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id ON payments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_reminders_enrollment_id ON reminders(enrollment_id);

-- Crear bucket para comprobantes de pago
INSERT INTO storage.buckets (id, name, public) 
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Política para el bucket de comprobantes
CREATE POLICY "Anyone can upload receipts"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Anyone can view receipts"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'receipts');