/**
 * Tipos de modelos de domínio do aplicativo
 */
import type { UserRole, Gender, ClassStatus, ReportType } from '@/api/types/database.types';

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  phone: string | null;
  photoUrl: string | null;
  regional: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  fullName: string;
  birthDate: string;
  gender: Gender;
  responsibleName: string;
  responsiblePhone: string;
  responsibleEmail: string | null;
  address: string | null;
  regional: string;
  local: string;
  photoUrl: string | null;
  medicalNotes: string | null;
  isActive: boolean;
  enrollmentDate: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  profileId: string | null;
  fullName: string;
  specialty: string | null;
  regional: string;
  locals: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Class {
  id: string;
  title: string;
  description: string | null;
  classDate: string;
  startTime: string;
  endTime: string;
  regional: string;
  local: string;
  instructorId: string | null;
  observations: string | null;
  status: ClassStatus;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClassDetails extends Class {
  instructor?: Instructor;
  attendanceCount?: number;
  filesCount?: number;
}

export interface AttendanceRecord {
  id: string;
  classId: string;
  studentId: string;
  isPresent: boolean;
  notes: string | null;
  recordedBy: string | null;
  recordedAt: string;
  student?: Student;
}

export interface InstructorAttendanceRecord {
  id: string;
  classId: string;
  instructorId: string;
  isPresent: boolean;
  role: string | null;
  notes: string | null;
  recordedBy: string | null;
  recordedAt: string;
  instructor?: Instructor;
}

export interface ClassFile {
  id: string;
  classId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  uploadedBy: string | null;
  uploadedAt: string;
}

export interface Report {
  id: string;
  title: string;
  reportType: ReportType;
  parameters: Record<string, unknown> | null;
  regional: string | null;
  local: string | null;
  startDate: string | null;
  endDate: string | null;
  generatedBy: string | null;
  fileUrl: string | null;
  createdAt: string;
}

export interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendanceRate: number;
}

