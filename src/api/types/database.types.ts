/**
 * Tipos gerados do Supabase
 * 
 * Para gerar os tipos atualizados, execute:
 * npx supabase gen types typescript --project-id your-project-id > src/api/types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'administrador' | 'instrutor' | 'coordenador' | 'usuario';
export type Gender = 'male' | 'female';
export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';
export type ReportType = 'attendance' | 'administrative' | 'student_progress' | 'custom';

export interface Database {
  public: {
    Tables: {
      musicalizacao_profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          photo_url: string | null;
          regional: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role: UserRole;
          phone?: string | null;
          photo_url?: string | null;
          regional?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          phone?: string | null;
          photo_url?: string | null;
          regional?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      musicalizacao_students: {
        Row: {
          id: string;
          full_name: string;
          birth_date: string;
          gender: Gender;
          responsible_name: string;
          responsible_phone: string;
          responsible_email: string | null;
          address: string | null;
          regional: string;
          local: string;
          photo_url: string | null;
          medical_notes: string | null;
          is_active: boolean;
          enrollment_date: string;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          birth_date: string;
          gender: Gender;
          responsible_name: string;
          responsible_phone: string;
          responsible_email?: string | null;
          address?: string | null;
          regional: string;
          local: string;
          photo_url?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          enrollment_date?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          birth_date?: string;
          gender?: Gender;
          responsible_name?: string;
          responsible_phone?: string;
          responsible_email?: string | null;
          address?: string | null;
          regional?: string;
          local?: string;
          photo_url?: string | null;
          medical_notes?: string | null;
          is_active?: boolean;
          enrollment_date?: string;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      musicalizacao_instructors: {
        Row: {
          id: string;
          profile_id: string | null;
          full_name: string;
          specialty: string | null;
          regional: string;
          locals: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id?: string | null;
          full_name: string;
          specialty?: string | null;
          regional: string;
          locals?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string | null;
          full_name?: string;
          specialty?: string | null;
          regional?: string;
          locals?: string[] | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      musicalizacao_classes: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          class_date: string;
          start_time: string;
          end_time: string;
          regional: string;
          local: string;
          instructor_id: string | null;
          observations: string | null;
          status: ClassStatus;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          class_date: string;
          start_time: string;
          end_time: string;
          regional: string;
          local: string;
          instructor_id?: string | null;
          observations?: string | null;
          status?: ClassStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          class_date?: string;
          start_time?: string;
          end_time?: string;
          regional?: string;
          local?: string;
          instructor_id?: string | null;
          observations?: string | null;
          status?: ClassStatus;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      musicalizacao_attendance: {
        Row: {
          id: string;
          class_id: string;
          student_id: string;
          is_present: boolean;
          notes: string | null;
          recorded_by: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          student_id: string;
          is_present: boolean;
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          student_id?: string;
          is_present?: boolean;
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
        };
      };
      musicalizacao_instructor_attendance: {
        Row: {
          id: string;
          class_id: string;
          instructor_id: string;
          is_present: boolean;
          role: string | null;
          notes: string | null;
          recorded_by: string | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          instructor_id: string;
          is_present: boolean;
          role?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          instructor_id?: string;
          is_present?: boolean;
          role?: string | null;
          notes?: string | null;
          recorded_by?: string | null;
          recorded_at?: string;
        };
      };
      musicalizacao_class_files: {
        Row: {
          id: string;
          class_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by: string | null;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          class_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          storage_path: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          class_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          storage_path?: string;
          uploaded_by?: string | null;
          uploaded_at?: string;
        };
      };
      musicalizacao_reports: {
        Row: {
          id: string;
          title: string;
          report_type: ReportType;
          parameters: Json | null;
          regional: string | null;
          local: string | null;
          start_date: string | null;
          end_date: string | null;
          generated_by: string | null;
          file_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          report_type: ReportType;
          parameters?: Json | null;
          regional?: string | null;
          local?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          generated_by?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          report_type?: ReportType;
          parameters?: Json | null;
          regional?: string | null;
          local?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          generated_by?: string | null;
          file_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

