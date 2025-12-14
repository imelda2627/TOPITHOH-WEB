import { MedicalRecord, PatientProfile, AccessGrant, RecordType, Doctor } from './types';

export const MOCK_PATIENT: PatientProfile = {
  id: 'P001',
  firstName: 'Jean',
  lastName: 'Dupont',
  birthDate: '1985-04-12',
  bloodType: 'O+',
  allergies: ['Pénicilline', 'Arachides'],
  chronicConditions: ['Hypertension', 'Asthme léger'],
  emergencyContact: '+33 6 12 34 56 78',
  profileImage: 'https://picsum.photos/150/150'
};

export const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 1,
    patient_id: 1,
    date: '2023-10-25',
    record_type: RecordType.CONSULTATION,
    title: 'Consultation Générale',
    description: 'Patient se plaint de maux de tête persistants. Tension 14/9.',
    is_shared: true
  },
  {
    id: 2,
    patient_id: 1,
    date: '2023-10-25',
    record_type: RecordType.PRESCRIPTION,
    title: 'Traitement Hypertension',
    description: 'Prescription de Bisoprolol 2.5mg, 1 comprimé le matin.',
    attachment_url: '#',
    is_shared: true
  },
  {
    id: 3,
    patient_id: 1,
    date: '2023-11-02',
    record_type: RecordType.LAB_RESULT,
    title: 'Analyse Sanguine Complète',
    description: 'Cholestérol légèrement élevé. Glycémie normale.',
    is_shared: false
  },
  {
    id: 4,
    patient_id: 1,
    date: '2023-01-15',
    record_type: RecordType.VACCINE,
    title: 'Rappel Tétanos',
    description: 'Vaccination effectuée sans effets secondaires.',
    is_shared: true
  }
];

export const MOCK_DOCTORS: Doctor[] = [
  { id: 'D001', name: 'Dr. Sophie Martin', specialty: 'Cardiologue', hospital: 'CHU Central' },
  { id: 'D002', name: 'Dr. Lucas Bernard', specialty: 'Généraliste', hospital: 'Cabinet Privé' },
  { id: 'D003', name: 'Dr. Julie Thomas', specialty: 'Dermatologue', hospital: 'Clinique des Lilas' },
];

export const INITIAL_ACCESS: AccessGrant[] = [
  { 
    id: 1, 
    granted_to_name: 'Dr. Sophie Martin', 
    granted_to_role: 'doctor', 
    status: 'active', 
    expires_at: '2024-12-31' 
  },
  { 
    id: 2, 
    granted_to_name: 'Dr. Lucas Bernard', 
    granted_to_role: 'doctor', 
    status: 'expired', 
    expires_at: '2023-09-01' 
  }
];