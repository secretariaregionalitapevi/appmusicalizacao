/**
 * Tipos de navegação do aplicativo
 */
import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Profile, Student, Class, Report } from './models';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Classes: undefined;
  Students: undefined;
  Reports: undefined;
  Profile: undefined;
};

export type ClassesStackParamList = {
  ClassList: undefined;
  ClassDetails: { classId: string };
  CreateClass: undefined;
  EditClass: { classId: string };
  Attendance: { classId: string };
};

export type StudentsStackParamList = {
  StudentList: undefined;
  StudentDetails: { studentId: string };
  CreateStudent: undefined;
  EditStudent: { studentId: string };
  StudentAttendanceHistory: { studentId: string };
};

export type ReportsStackParamList = {
  ReportList: undefined;
  ReportDetails: { reportId: string };
  GenerateReport: { reportType?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

