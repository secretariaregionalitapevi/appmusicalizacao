-- ============================================
-- Schema inicial do Sistema de Musicalização Infantil CCB
-- ============================================
-- NOTA: Todas as tabelas usam o prefixo 'musicalizacao_' para evitar conflitos
-- com outras aplicações no mesmo projeto Supabase

-- 1. PROFILES_MUSICALIZACAO (estende auth.users)
-- Esta tabela é específica para esta aplicação e não conflita com a tabela 'profiles' existente
CREATE TABLE IF NOT EXISTS musicalizacao_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'instructor', 'coordinator')),
  phone TEXT,
  photo_url TEXT,
  regional TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS musicalizacao_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  responsible_name TEXT NOT NULL,
  responsible_phone TEXT NOT NULL,
  responsible_email TEXT,
  address TEXT,
  regional TEXT NOT NULL,
  local TEXT NOT NULL,
  photo_url TEXT,
  medical_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES musicalizacao_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. INSTRUCTORS
CREATE TABLE IF NOT EXISTS musicalizacao_instructors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES musicalizacao_profiles(id),
  full_name TEXT NOT NULL,
  specialty TEXT,
  regional TEXT NOT NULL,
  locals TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CLASSES
CREATE TABLE IF NOT EXISTS musicalizacao_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  class_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  regional TEXT NOT NULL,
  local TEXT NOT NULL,
  instructor_id UUID REFERENCES musicalizacao_instructors(id),
  observations TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES musicalizacao_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ATTENDANCE (presença de alunos)
CREATE TABLE IF NOT EXISTS musicalizacao_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES musicalizacao_classes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES musicalizacao_students(id),
  is_present BOOLEAN NOT NULL,
  notes TEXT,
  recorded_by UUID REFERENCES musicalizacao_profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- 6. INSTRUCTOR_ATTENDANCE (presença de instrutores)
CREATE TABLE IF NOT EXISTS musicalizacao_instructor_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES musicalizacao_classes(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES musicalizacao_instructors(id),
  is_present BOOLEAN NOT NULL,
  role TEXT,
  notes TEXT,
  recorded_by UUID REFERENCES musicalizacao_profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(class_id, instructor_id)
);

-- 7. CLASS_FILES (arquivos das aulas)
CREATE TABLE IF NOT EXISTS musicalizacao_class_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES musicalizacao_classes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES musicalizacao_profiles(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. REPORTS (relatórios gerados)
CREATE TABLE IF NOT EXISTS musicalizacao_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('attendance', 'administrative', 'student_progress', 'custom')),
  parameters JSONB,
  regional TEXT,
  local TEXT,
  start_date DATE,
  end_date DATE,
  generated_by UUID REFERENCES musicalizacao_profiles(id),
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES (IMPORTANTE!)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_musicalizacao_profiles_regional ON musicalizacao_profiles(regional);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_students_regional ON musicalizacao_students(regional);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_students_local ON musicalizacao_students(local);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_students_active ON musicalizacao_students(is_active);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_students_created_by ON musicalizacao_students(created_by);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_classes_date ON musicalizacao_classes(class_date);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_classes_regional ON musicalizacao_classes(regional);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_classes_status ON musicalizacao_classes(status);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_classes_instructor ON musicalizacao_classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_attendance_class ON musicalizacao_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_attendance_student ON musicalizacao_attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_instructor_attendance_class ON musicalizacao_instructor_attendance(class_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_instructor_attendance_instructor ON musicalizacao_instructor_attendance(instructor_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_class_files_class ON musicalizacao_class_files(class_id);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_reports_type ON musicalizacao_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_musicalizacao_reports_regional ON musicalizacao_reports(regional);

-- ============================================
-- TRIGGERS (para updated_at automático)
-- ============================================
-- Função já pode existir de outra aplicação, então usamos CREATE OR REPLACE
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
DROP TRIGGER IF EXISTS update_musicalizacao_profiles_updated_at ON musicalizacao_profiles;
CREATE TRIGGER update_musicalizacao_profiles_updated_at 
  BEFORE UPDATE ON musicalizacao_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_musicalizacao_students_updated_at ON musicalizacao_students;
CREATE TRIGGER update_musicalizacao_students_updated_at 
  BEFORE UPDATE ON musicalizacao_students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_musicalizacao_instructors_updated_at ON musicalizacao_instructors;
CREATE TRIGGER update_musicalizacao_instructors_updated_at 
  BEFORE UPDATE ON musicalizacao_instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_musicalizacao_classes_updated_at ON musicalizacao_classes;
CREATE TRIGGER update_musicalizacao_classes_updated_at 
  BEFORE UPDATE ON musicalizacao_classes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE musicalizacao_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_instructor_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_class_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE musicalizacao_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_PROFILES
-- ============================================

-- Usuários podem visualizar seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_profile" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_view_own_profile"
  ON musicalizacao_profiles FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar seu próprio perfil
DROP POLICY IF EXISTS "musicalizacao_users_can_update_own_profile" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_users_can_update_own_profile"
  ON musicalizacao_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins podem visualizar todos os perfis
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_profiles" ON musicalizacao_profiles;
CREATE POLICY "musicalizacao_admins_can_view_all_profiles"
  ON musicalizacao_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role = 'admin'
    )
  );

-- Política única e permissiva para inserção de perfis
-- Permite que usuários autenticados criem seu próprio perfil
-- IMPORTANTE: Esta política é mais permissiva para permitir criação durante signup
DROP POLICY IF EXISTS "musicalizacao_users_can_insert_own_profile" ON musicalizacao_profiles;
DROP POLICY IF EXISTS "musicalizacao_allow_profile_creation_on_signup" ON musicalizacao_profiles;

-- Política única que permite inserção do próprio perfil
CREATE POLICY "musicalizacao_users_can_insert_own_profile"
  ON musicalizacao_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_STUDENTS
-- ============================================

-- Usuários autenticados podem visualizar alunos
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_authenticated_can_view_students"
  ON musicalizacao_students FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_create_students"
  ON musicalizacao_students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- Instrutores e acima podem atualizar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_update_students"
  ON musicalizacao_students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- Instrutores e acima podem deletar alunos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_students" ON musicalizacao_students;
CREATE POLICY "musicalizacao_instructors_can_delete_students"
  ON musicalizacao_students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_INSTRUCTORS
-- ============================================

-- Usuários autenticados podem visualizar instrutores
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructors" ON musicalizacao_instructors;
CREATE POLICY "musicalizacao_authenticated_can_view_instructors"
  ON musicalizacao_instructors FOR SELECT
  TO authenticated
  USING (true);

-- Admins e coordenadores podem gerenciar instrutores
DROP POLICY IF EXISTS "musicalizacao_admins_can_manage_instructors" ON musicalizacao_instructors;
CREATE POLICY "musicalizacao_admins_can_manage_instructors"
  ON musicalizacao_instructors FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_CLASSES
-- ============================================

-- Usuários autenticados podem visualizar aulas
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_authenticated_can_view_classes"
  ON musicalizacao_classes FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem criar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_create_classes"
  ON musicalizacao_classes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- Instrutores e acima podem atualizar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_update_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_update_classes"
  ON musicalizacao_classes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- Instrutores e acima podem deletar aulas
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_classes" ON musicalizacao_classes;
CREATE POLICY "musicalizacao_instructors_can_delete_classes"
  ON musicalizacao_classes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_ATTENDANCE
-- ============================================

-- Usuários autenticados podem visualizar presenças
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_authenticated_can_view_attendance"
  ON musicalizacao_attendance FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem gerenciar presenças
DROP POLICY IF EXISTS "musicalizacao_instructors_can_manage_attendance" ON musicalizacao_attendance;
CREATE POLICY "musicalizacao_instructors_can_manage_attendance"
  ON musicalizacao_attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_INSTRUCTOR_ATTENDANCE
-- ============================================

-- Usuários autenticados podem visualizar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_authenticated_can_view_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem gerenciar presenças de instrutores
DROP POLICY IF EXISTS "musicalizacao_instructors_can_manage_instructor_attendance" ON musicalizacao_instructor_attendance;
CREATE POLICY "musicalizacao_instructors_can_manage_instructor_attendance"
  ON musicalizacao_instructor_attendance FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_CLASS_FILES
-- ============================================

-- Usuários autenticados podem visualizar arquivos
DROP POLICY IF EXISTS "musicalizacao_authenticated_can_view_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_authenticated_can_view_class_files"
  ON musicalizacao_class_files FOR SELECT
  TO authenticated
  USING (true);

-- Instrutores e acima podem fazer upload de arquivos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_upload_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_instructors_can_upload_class_files"
  ON musicalizacao_class_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- Instrutores e acima podem deletar arquivos
DROP POLICY IF EXISTS "musicalizacao_instructors_can_delete_class_files" ON musicalizacao_class_files;
CREATE POLICY "musicalizacao_instructors_can_delete_class_files"
  ON musicalizacao_class_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );

-- ============================================
-- POLÍTICAS RLS PARA MUSICALIZACAO_REPORTS
-- ============================================

-- Usuários podem visualizar seus próprios relatórios
DROP POLICY IF EXISTS "musicalizacao_users_can_view_own_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_users_can_view_own_reports"
  ON musicalizacao_reports FOR SELECT
  TO authenticated
  USING (generated_by = auth.uid());

-- Admins podem visualizar todos os relatórios
DROP POLICY IF EXISTS "musicalizacao_admins_can_view_all_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_admins_can_view_all_reports"
  ON musicalizacao_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role = 'admin'
    )
  );

-- Instrutores e acima podem criar relatórios
DROP POLICY IF EXISTS "musicalizacao_instructors_can_create_reports" ON musicalizacao_reports;
CREATE POLICY "musicalizacao_instructors_can_create_reports"
  ON musicalizacao_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM musicalizacao_profiles
      WHERE musicalizacao_profiles.id = auth.uid()
      AND musicalizacao_profiles.role IN ('admin', 'instructor', 'coordinator')
    )
  );
