/**
 * Tipos relacionados a chamadas de API
 */
import type { Student, Class, AttendanceRecord } from './models';

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentFilters {
  regional?: string;
  local?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ClassFilters {
  regional?: string;
  local?: string;
  status?: string;
  instructorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export interface BulkAttendanceData {
  studentId: string;
  isPresent: boolean;
  notes?: string;
}

export interface AttendanceReportParams {
  regional?: string;
  local?: string;
  studentId?: string;
  startDate: string;
  endDate: string;
}

export interface AdminReportParams {
  regional?: string;
  local?: string;
  startDate: string;
  endDate: string;
}

export interface ReportData {
  title: string;
  headers: string[];
  rows: (string | number)[][];
  summary?: Record<string, unknown>;
}

