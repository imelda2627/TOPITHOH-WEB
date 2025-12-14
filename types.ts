// Enums matching Backend
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  LAB = 'laboratory',
  ADMIN = 'admin',
  USER = 'user'
}

export enum BackendRecordType {
  VACCINATION = 'vaccination',
  PRESCRIPTION = 'prescription',
  DIAGNOSIS = 'diagonosis', // Note: spelling as per backend model provided
  CONSULTATION = 'consultation',
  OTHER = 'other',
  // Frontend/Mock specific types
  LAB_RESULT = 'lab_result',
  VACCINE = 'vaccine'
}

export const RecordType = BackendRecordType;

// Registration Payload
export interface RegistrationPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  // Patient specific
  gender?: string;
  date_of_birth?: string;
  blood_type?: string;
  // Professional specific
  license_number?: string;
  specialty?: string; // Doctor
  hospital?: string; // Doctor
  lab_name?: string; // Mapped to Last Name or specific field for Lab
}

// User Model (from Users table)
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  is_active: boolean;
  is_verified?: boolean;
}

// Admin Specific Types
export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  pendingValidations: number;
}

export interface PendingProfessional {
  id: number;
  type: 'doctor' | 'laboratory';
  name: string; // first_name + last_name or lab_name
  email: string;
  license_number: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
}

// Patient Model (from Patients table)
export interface Patient {
  id: number;
  user_id: number;
  gender: string;
  date_of_birth: string;
  blood_type: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  genotype: string;
  known_allergies: string; // Comma separated
  known_diseases: string; // Comma separated
  emergency_access_enabled: boolean;
  emergency_access_code?: string;
}

// Medical Record Model (from medical_records table)
export interface MedicalRecord {
  id: number;
  patient_id: number;
  doctor_id?: number;
  laboratory_id?: number;
  record_type: BackendRecordType | string;
  title: string;
  description: string;
  date: string;
  attachment_url?: string;
  is_shared: boolean;
  createdAt?: string;
}

// Combined Profile for Frontend use
export interface FullProfile {
  user: User;
  patient?: Patient;
}

export interface AccessGrant {
  id: number;
  granted_to_name: string;
  granted_to_role: string;
  status: 'active' | 'expired' | 'revoked';
  expires_at: string;
}

// Frontend specific interfaces used in Mock/UI
export interface PatientProfile {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: string;
  profileImage: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
}