// Зеркало backend DTO

export type UserRole =
  | 'platform_admin'
  | 'ot_specialist'
  | 'director'
  | 'dept_head'
  | 'worker';

export interface User {
  id: string;
  email: string;
  phone?: string;
  telegramChatId?: string;
  role: UserRole;
  orgId: string | null;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, 'id' | 'email' | 'role' | 'orgId'>;
}

export interface Organization {
  id: string;
  name: string;
  inn: string;
  ogrn?: string;
  legalAddress?: string;
  plan: { maxWorkers: number; modules: string[] };
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  orgId: string;
  name: string;
  parentId?: string;
  headEmployeeId?: string;
}

export interface Position {
  id: string;
  orgId: string;
  deptId: string;
  name: string;
  harmfulClass?: 1 | 2 | 3 | 4;
  briefingTypes: string[];
  requiresMedical: boolean;
}

export interface Employee {
  id: string;
  orgId: string;
  deptId?: string;
  positionId?: string;
  userId?: string;
  lastName: string;
  firstName: string;
  middleName?: string;
  birthDate?: string;
  snils?: string;
  hireDate?: string;
  dismissalDate?: string;
  createdAt: string;
  fullName?: string;
}

export type BriefingStatus = 'запланирован' | 'проведён' | 'просрочен';
export type BriefingTypeName =
  | 'вводный'
  | 'первичный'
  | 'повторный'
  | 'внеплановый'
  | 'целевой';

export interface BriefingRecord {
  id: string;
  employeeId: string;
  typeId: string;
  conductedAt?: string;
  nextDueAt?: string;
  instructorId?: string;
  orgId: string;
  status: BriefingStatus;
}

export interface BriefingJournal {
  id: string;
  orgId: string;
  journalType: 'вводный' | 'рабочее_место';
  periodStart: string;
  periodEnd: string;
  fileUrl?: string;
  signedAt?: string;
}

export type ExamType = 'предварительный' | 'периодический';
export type ExamConclusion = 'годен' | 'не годен' | 'годен с ограничениями';

export interface MedExamRecord {
  id: string;
  employeeId: string;
  orgId: string;
  examType: ExamType;
  directionDate?: string;
  examDate?: string;
  nextDueAt?: string;
  clinic?: string;
  conclusion?: ExamConclusion;
  fileUrl?: string;
}

export interface TrainingProgram {
  id: string;
  orgId: string;
  name: string;
  topic?: string;
  durationHours?: number;
  validityMonths?: number;
}

export interface TrainingRecord {
  id: string;
  employeeId: string;
  programId: string;
  orgId: string;
  startDate?: string;
  endDate?: string;
  result?: 'сдал' | 'не сдал' | 'в процессе';
  score?: number;
  certNumber?: string;
  nextDueAt?: string;
  trainingCenter?: string;
}

export interface Order {
  id: string;
  orgId: string;
  templateId?: string;
  number: string;
  date: string;
  employees: Record<string, unknown>[];
  content: Record<string, unknown>;
  fileUrl?: string;
  signedAt?: string;
}

export interface Document {
  id: string;
  orgId: string;
  docType: string;
  refId?: string;
  refType?: string;
  title: string;
  fileUrl?: string;
  createdAt: string;
  createdById?: string;
  tags: string[];
}

export interface DashboardMetrics {
  totalEmployees: number;
  overduesBriefings: number;
  expiringMedical: number;
  validTraining: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type StatusType = 'ok' | 'warning' | 'danger' | 'neutral';
