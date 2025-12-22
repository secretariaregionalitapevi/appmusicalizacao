-- ============================================
-- Migration: Dados de Teste para o Sistema
-- ============================================
-- Esta migration popula o banco de dados com dados de exemplo
-- para permitir testes e visualização do sistema funcionando

-- NOTA: Esta migration usa SECURITY DEFINER para bypassar RLS temporariamente
-- e inserir dados de teste. Em produção, isso deve ser revisado.

-- Função auxiliar para inserir dados bypassando RLS
CREATE OR REPLACE FUNCTION seed_test_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_profile_id UUID;
BEGIN
  -- Buscar ID de perfil admin existente (se houver)
  SELECT id INTO admin_profile_id FROM musicalizacao_profiles WHERE role = 'administrador' LIMIT 1;
  
  -- Se não houver admin, usar NULL (o campo recorded_by é opcional)
  -- Isso permite que os registros sejam criados mesmo sem um profile específico
  -- ============================================
  -- 1. POLOS
  -- ============================================
  INSERT INTO musicalizacao_polos (id, nome, cidade, regional, endereco, telefone, email, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Polo Cotia', 'Cotia', 'Regional Itapevi', 'Rua das Flores, 123', '(11) 99999-1111', 'cotia@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000002', 'Polo Caucaia do Alto', 'Caucaia do Alto', 'Regional Itapevi', 'Av. Principal, 456', '(11) 99999-2222', 'caucaia@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000003', 'Polo Vargem Grande Paulista', 'Vargem Grande Paulista', 'Regional Itapevi', 'Rua Central, 789', '(11) 99999-3333', 'vargemgrande@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000004', 'Polo Itapevi', 'Itapevi', 'Regional Itapevi', 'Rua das Palmeiras, 321', '(11) 99999-4444', 'itapevi@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000005', 'Polo Jandira', 'Jandira', 'Regional Itapevi', 'Av. das Acácias, 654', '(11) 99999-5555', 'jandira@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000006', 'Polo Santana de Parnaíba', 'Santana de Parnaíba', 'Regional Itapevi', 'Rua dos Ipês, 987', '(11) 99999-6666', 'santanaparnaiba@ccb.org.br', true),
  ('00000000-0000-0000-0000-000000000007', 'Polo Pirapora do Bom Jesus', 'Pirapora do Bom Jesus', 'Regional Itapevi', 'Av. dos Jasmins, 147', '(11) 99999-7777', 'pirapora@ccb.org.br', true)
  ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    cidade = EXCLUDED.cidade,
    regional = EXCLUDED.regional,
    endereco = EXCLUDED.endereco,
    telefone = EXCLUDED.telefone,
    email = EXCLUDED.email,
    is_active = EXCLUDED.is_active;

  -- ============================================
  -- 2. INSTRUTORES
  -- ============================================
  -- Nota: profile_id pode ser NULL ou referenciar um profile real
  INSERT INTO musicalizacao_instructors (id, profile_id, full_name, specialty, regional, locals, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000101', NULL, 'Maria Silva', 'Musicalização Infantil', 'Regional Itapevi', ARRAY['Itapevi', 'Cotia'], true),
  ('00000000-0000-0000-0000-000000000102', NULL, 'João Santos', 'Canto Coral', 'Regional Itapevi', ARRAY['Jandira', 'Itapevi'], true),
  ('00000000-0000-0000-0000-000000000103', NULL, 'Ana Costa', 'Instrumentos de Corda', 'Regional Itapevi', ARRAY['Vargem Grande Paulista'], true),
  ('00000000-0000-0000-0000-000000000104', NULL, 'Carlos Oliveira', 'Teoria Musical', 'Regional Itapevi', ARRAY['Itapevi', 'Santana de Parnaíba'], true)
  ON CONFLICT DO NOTHING;

  -- ============================================
  -- 3. ALUNOS
  -- ============================================
  -- Usar INSERT ... ON CONFLICT ... DO UPDATE para garantir que os dados sejam atualizados
  INSERT INTO musicalizacao_students (
  id, full_name, birth_date, gender, responsible_name, responsible_phone, 
  responsible_email, address, regional, local, is_active, enrollment_date, polo_id
)
VALUES
  ('00000000-0000-0000-0000-000000000201', 'Pedro Henrique Almeida', '2015-03-15', 'male', 'Roberto Almeida', '(11) 98765-4321', 'roberto@email.com', 'Rua A, 100', 'Regional Itapevi', 'Itapevi', true, '2024-01-15', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000202', 'Julia Fernanda Souza', '2016-07-22', 'female', 'Fernanda Souza', '(11) 98765-4322', 'fernanda@email.com', 'Rua B, 200', 'Regional Itapevi', 'Itapevi', true, '2024-02-01', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000203', 'Lucas Gabriel Lima', '2015-11-08', 'male', 'Gabriel Lima', '(11) 98765-4323', 'gabriel@email.com', 'Rua C, 300', 'Regional Itapevi', 'Caucaia do Alto', true, '2024-01-20', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000204', 'Isabella Maria Ferreira', '2016-05-30', 'female', 'Maria Ferreira', '(11) 98765-4324', 'maria@email.com', 'Rua D, 400', 'Regional Itapevi', 'Vargem Grande Paulista', true, '2024-02-10', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000205', 'Rafael Augusto Rocha', '2015-09-12', 'male', 'Augusto Rocha', '(11) 98765-4325', 'augusto@email.com', 'Rua E, 500', 'Regional Itapevi', 'Jandira', true, '2024-01-25', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000206', 'Sophia Beatriz Martins', '2016-12-05', 'female', 'Beatriz Martins', '(11) 98765-4326', 'beatriz@email.com', 'Rua F, 600', 'Regional Itapevi', 'Santana de Parnaíba', false, '2024-02-15', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000207', 'Enzo Miguel Pereira', '2015-04-18', 'male', 'Miguel Pereira', '(11) 98765-4327', 'miguel@email.com', 'Rua G, 700', 'Regional Itapevi', 'Itapevi', true, '2024-03-01', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000208', 'Valentina Luiza Barbosa', '2016-08-25', 'female', 'Luiza Barbosa', '(11) 98765-4328', 'luiza@email.com', 'Rua H, 800', 'Regional Itapevi', 'Pirapora do Bom Jesus', false, '2024-03-05', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0000-000000000209', 'Arthur Felipe Cardoso', '2015-01-14', 'male', 'Felipe Cardoso', '(11) 98765-4329', 'felipe@email.com', 'Rua I, 900', 'Regional Itapevi', 'Cotia', false, '2024-03-10', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000210', 'Laura Eduarda Nunes', '2016-10-03', 'female', 'Eduarda Nunes', '(11) 98765-4330', 'eduarda@email.com', 'Rua J, 1000', 'Regional Itapevi', 'Itapevi', true, '2024-03-15', '00000000-0000-0000-0000-000000000004')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    responsible_name = EXCLUDED.responsible_name,
    responsible_phone = EXCLUDED.responsible_phone,
    responsible_email = EXCLUDED.responsible_email,
    address = EXCLUDED.address,
    regional = EXCLUDED.regional,
    local = EXCLUDED.local,
    is_active = EXCLUDED.is_active,
    enrollment_date = EXCLUDED.enrollment_date,
    polo_id = EXCLUDED.polo_id;

  -- ============================================
  -- 4. AULAS (algumas completadas, algumas agendadas)
  -- ============================================
  -- Aulas no passado (completadas)
  INSERT INTO musicalizacao_classes (
  id, title, description, class_date, start_time, end_time, 
  regional, local, instructor_id, status, observations, polo_id
)
VALUES
  -- Aulas completadas (último mês)
  -- IMPORTANTE: Ordem cronológica (mais antiga para mais recente):
  -- 304: 10 dias atrás
  -- 301: 7 dias atrás
  -- 306: 6 dias atrás
  -- 302: 5 dias atrás
  -- 307: 4 dias atrás
  -- 303: 3 dias atrás
  -- 305: 2 dias atrás
  -- 308: 1 dia atrás (mais recente)
  
  ('00000000-0000-0000-0000-000000000304', 'Teoria Musical Básica', 'Conceitos fundamentais de teoria musical', CURRENT_DATE - INTERVAL '10 days', '14:30:00', '16:00:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000104', 'completed', 'Material didático utilizado', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000301', 'Introdução à Musicalização', 'Primeira aula de introdução aos conceitos básicos de música', CURRENT_DATE - INTERVAL '7 days', '14:00:00', '15:30:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000101', 'completed', 'Aula muito produtiva, todos participaram ativamente', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000306', 'Aula de Reforço 1', 'Aula de reforço para alunos com dificuldades', CURRENT_DATE - INTERVAL '6 days', '14:00:00', '15:30:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000101', 'completed', 'Aula de reforço', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000302', 'Canto e Expressão', 'Aula de canto com foco em expressão vocal', CURRENT_DATE - INTERVAL '5 days', '15:00:00', '16:30:00', 'Regional Itapevi', 'Caucaia do Alto', '00000000-0000-0000-0000-000000000102', 'completed', 'Boa participação dos alunos', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0000-000000000307', 'Aula de Reforço 2', 'Aula de reforço para alunos com dificuldades', CURRENT_DATE - INTERVAL '4 days', '14:00:00', '15:30:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000101', 'completed', 'Aula de reforço', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000303', 'Instrumentos de Corda - Iniciantes', 'Primeira aula prática com violão', CURRENT_DATE - INTERVAL '3 days', '16:00:00', '17:30:00', 'Regional Itapevi', 'Vargem Grande Paulista', '00000000-0000-0000-0000-000000000103', 'completed', 'Alunos demonstraram interesse', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0000-000000000305', 'Prática de Canto Coral', 'Ensaios de canto em grupo', CURRENT_DATE - INTERVAL '2 days', '15:30:00', '17:00:00', 'Regional Itapevi', 'Jandira', '00000000-0000-0000-0000-000000000102', 'completed', 'Harmonia melhorando', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0000-000000000308', 'Aula de Reforço 3', 'Aula de reforço para alunos com dificuldades', CURRENT_DATE - INTERVAL '1 day', '14:00:00', '15:30:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000101', 'completed', 'Aula de reforço', '00000000-0000-0000-0000-000000000004'),
  
  -- Aulas agendadas (próximas semanas)
  ('00000000-0000-0000-0000-000000000309', 'Teoria Musical Intermediária', 'Aprofundamento em teoria musical', CURRENT_DATE + INTERVAL '10 days', '14:30:00', '16:00:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000104', 'scheduled', 'Preparar exercícios práticos', '00000000-0000-0000-0000-000000000004'),
  ('00000000-0000-0000-0000-000000000310', 'Apresentação de Final de Mês', 'Preparação para apresentação mensal', CURRENT_DATE + INTERVAL '14 days', '18:00:00', '19:30:00', 'Regional Itapevi', 'Santana de Parnaíba', '00000000-0000-0000-0000-000000000102', 'scheduled', 'Ensaio geral para apresentação', '00000000-0000-0000-0000-000000000006'),
  ('00000000-0000-0000-0000-000000000311', 'Musicalização para Iniciantes', 'Nova turma de iniciantes', CURRENT_DATE + INTERVAL '12 days', '14:00:00', '15:30:00', 'Regional Itapevi', 'Pirapora do Bom Jesus', '00000000-0000-0000-0000-000000000101', 'scheduled', 'Primeira aula da nova turma', '00000000-0000-0000-0000-000000000007'),
  ('00000000-0000-0000-0000-000000000312', 'Workshop de Percussão', 'Workshop especial de instrumentos de percussão', CURRENT_DATE + INTERVAL '20 days', '15:00:00', '17:00:00', 'Regional Itapevi', 'Itapevi', '00000000-0000-0000-0000-000000000101', 'scheduled', 'Evento especial', '00000000-0000-0000-0000-000000000004')
  ON CONFLICT (id) DO UPDATE SET 
    status = EXCLUDED.status,
    class_date = EXCLUDED.class_date;

  -- ============================================
  -- 5. PRESENÇAS (para aulas completadas)
  -- ============================================
  -- Presenças para a primeira aula completada (301 - 7 dias atrás)
  -- NOTA: Alunos 201, 207, 210 NÃO têm presença aqui para garantir que tenham faltas consecutivas
  INSERT INTO musicalizacao_attendance (class_id, student_id, is_present, notes, recorded_by, recorded_at)
VALUES
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000202', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000203', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000204', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000205', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000206', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000208', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000209', true, NULL, admin_profile_id, NOW() - INTERVAL '7 days'),
  
  -- Presenças para a segunda aula
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000203', true, NULL, admin_profile_id, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000204', true, NULL, admin_profile_id, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000208', true, NULL, admin_profile_id, NOW() - INTERVAL '5 days'),
  
  -- Presenças para a terceira aula
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000205', true, NULL, admin_profile_id, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000206', true, NULL, admin_profile_id, NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000303', '00000000-0000-0000-0000-000000000209', false, 'Atraso de 15 minutos', admin_profile_id, NOW() - INTERVAL '3 days'),
  
  -- Presenças para a quarta aula (304 - 10 dias atrás)
  -- NOTA: Alunos 201, 207, 210 NÃO têm presença aqui para garantir que tenham faltas consecutivas
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000202', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000203', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000204', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000205', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000206', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000208', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000304', '00000000-0000-0000-0000-000000000209', true, NULL, admin_profile_id, NOW() - INTERVAL '10 days'),
  
  -- Presenças para a quinta aula (305 - 2 dias atrás)
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000203', true, NULL, admin_profile_id, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000204', true, NULL, admin_profile_id, NOW() - INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000305', '00000000-0000-0000-0000-000000000208', true, NULL, admin_profile_id, NOW() - INTERVAL '2 days'),
  -- NOTA: Alunos 201, 207, 210 NÃO têm presença na aula 305 para garantir 3 faltas consecutivas
  
  -- Alunos com 3+ faltas consecutivas nas últimas 3 aulas (308, 307, 306)
  -- Estes alunos terão faltas nas 3 aulas mais recentes (308, 307, 306)
  
  -- Aula 306 (6 dias atrás) - primeira falta
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000201', false, 'Falta', admin_profile_id, NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000202', true, NULL, admin_profile_id, NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000207', false, 'Falta', admin_profile_id, NOW() - INTERVAL '6 days'),
  ('00000000-0000-0000-0000-000000000306', '00000000-0000-0000-0000-000000000210', false, 'Falta', admin_profile_id, NOW() - INTERVAL '6 days'),
  
  -- Aula 307 (4 dias atrás) - segunda falta consecutiva
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000201', false, 'Falta', admin_profile_id, NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000202', true, NULL, admin_profile_id, NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000207', false, 'Falta', admin_profile_id, NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000307', '00000000-0000-0000-0000-000000000210', false, 'Falta', admin_profile_id, NOW() - INTERVAL '4 days'),
  
  -- Aula 308 (1 dia atrás) - terceira falta consecutiva (última aula)
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000201', false, 'Falta', admin_profile_id, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000202', true, NULL, admin_profile_id, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000207', false, 'Falta', admin_profile_id, NOW() - INTERVAL '1 day'),
  ('00000000-0000-0000-0000-000000000308', '00000000-0000-0000-0000-000000000210', false, 'Falta', admin_profile_id, NOW() - INTERVAL '1 day')
  ON CONFLICT (class_id, student_id) DO NOTHING;

  -- ============================================
  -- 6. RELATÓRIOS
  -- ============================================
  INSERT INTO musicalizacao_reports (
  id, title, report_type, parameters, regional, local, 
  start_date, end_date
)
VALUES
  ('00000000-0000-0000-0000-000000000401', 'Relatório de Presença - Janeiro 2025', 'attendance', 
   '{"period": "janeiro", "year": 2025}'::jsonb, 
   'Regional Itapevi', 'Itapevi', 
   CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '1 day'),
  
  ('00000000-0000-0000-0000-000000000402', 'Relatório Administrativo - Trimestre', 'administrative',
   '{"quarter": 1, "year": 2025}'::jsonb,
   'Regional Itapevi', NULL,
   CURRENT_DATE - INTERVAL '90 days', CURRENT_DATE),
  
  ('00000000-0000-0000-0000-000000000403', 'Progresso dos Alunos - Cotia', 'student_progress',
   '{"local": "Cotia", "period": "atual"}'::jsonb,
   'Regional Itapevi', 'Cotia',
   CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE)
  ON CONFLICT DO NOTHING;

END;
$$;

-- Executar a função para inserir os dados
SELECT seed_test_data();

-- Remover a função após uso (opcional, pode manter para reexecutar)
-- DROP FUNCTION IF EXISTS seed_test_data();

-- ============================================
-- NOTA FINAL
-- ============================================
-- Esta migration insere dados de teste que podem ser visualizados
-- em todas as páginas do sistema. Os dados incluem:
-- - 3 polos
-- - 4 instrutores
-- - 10 alunos
-- - 12 aulas (5 completadas, 7 agendadas)
-- - Presenças registradas para as aulas completadas
-- - 3 relatórios de exemplo
--
-- Para usar estes dados, certifique-se de que o usuário logado
-- tenha permissões adequadas (role: administrador, instrutor ou coordenador)

