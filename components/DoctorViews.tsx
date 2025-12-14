import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Lock, Loader2, FileText, Pill, Beaker } from 'lucide-react';
import { RecordType, MedicalRecord } from '../types';
import { api } from '../services/api';

interface Patient {
  id: number;
  user_id: number;
  gender: string;
  date_of_birth: string;
  blood_type: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DoctorProps {
  token: string;
}

export const DoctorPatientList: React.FC<DoctorProps> = ({ token }) => {
  const [viewState, setViewState] = useState<'list' | 'consultation'>('list');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, [token]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await api.doctor.getMyPatients(token);
      setPatients(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.user.first_name} ${patient.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewState === 'consultation' && selectedPatient) {
    return (
      <DoctorConsultation
        token={token}
        patient={selectedPatient}
        onBack={() => {
          setViewState('list');
          setSelectedPatient(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Mes Patients</h2>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher (Nom, email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <Activity className="mx-auto mb-3 text-gray-300 dark:text-slate-600" size={48} />
          <p className="text-gray-500 dark:text-slate-400">Aucun patient trouvé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient) => {
            const initials = `${patient.user.first_name.charAt(0)}${patient.user.last_name.charAt(0)}`;
            return (
              <div
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setViewState('consultation');
                }}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center justify-between active:scale-95 transition-transform cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold">
                    {initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-white">
                      {patient.user.first_name} {patient.user.last_name}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {patient.blood_type && `Groupe: ${patient.blood_type}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-gray-300 dark:text-slate-600" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ConsultationProps {
  token: string;
  patient: Patient;
  onBack?: () => void;
}

export const DoctorConsultation: React.FC<ConsultationProps> = ({ token, patient, onBack }) => {
  const [activeAction, setActiveAction] = useState<'note' | 'prescription' | 'lab'>('note');
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // Medical Record Form
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [recordType, setRecordType] = useState<string>('consultation');
  const [vitals, setVitals] = useState({ bloodPressure: '', weight: '', temperature: '' });

  // Prescription Form
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  // Lab Test Form
  const [testName, setTestName] = useState('');

  useEffect(() => {
    loadPatientRecords();
  }, [patient.id]);

  const loadPatientRecords = async () => {
    try {
      // Note: Need to implement GET /doctors/patients/:patientId/medical-records in API
      const response = await fetch(`https://tohpitoh-api.onrender.com/api/v1/doctors/patients/${patient.id}/medical-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicalRecords(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error loading patient records:', error);
    }
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveMedicalRecord = async () => {
    if (!recordTitle.trim() || !recordDescription.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patient_id: patient.id,
        record_type: recordType,
        title: recordTitle,
        description: recordDescription,
        date: new Date().toISOString()
      };

      await fetch(`https://tohpitoh-api.onrender.com/api/v1/doctors/patients/${patient.id}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      alert('Note clinique enregistrée avec succès');
      setRecordTitle('');
      setRecordDescription('');
      setVitals({ bloodPressure: '', weight: '', temperature: '' });
      await loadPatientRecords();
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!medication.trim() || !dosage.trim()) {
      alert('Veuillez remplir au moins le médicament et la posologie');
      return;
    }

    setLoading(true);
    try {
      await api.doctor.createPrescription(token, {
        patient_id: patient.id,
        medication_name: medication,
        dosage,
        frequency,
        duration,
        instructions,
        prescribed_date: new Date().toISOString()
      });

      alert('Ordonnance créée avec succès');
      setMedication('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setInstructions('');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Erreur lors de la création de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderLabTest = async () => {
    if (!testName.trim()) {
      alert('Veuillez saisir le nom de l\'examen');
      return;
    }

    setLoading(true);
    try {
      await api.doctor.orderLabTest(token, {
        patient_id: patient.id,
        test_name: testName,
        ordered_date: new Date().toISOString()
      });

      alert('Examen de laboratoire prescrit avec succès');
      setTestName('');
    } catch (error) {
      console.error('Error ordering lab test:', error);
      alert('Erreur lors de la prescription de l\'examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-in space-y-5">
      {onBack && (
        <button onClick={onBack} className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-2 hover:text-gray-700 dark:hover:text-slate-300">
          &larr; Retour liste
        </button>
      )}

      {/* Patient Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-indigo-500 flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg dark:text-white">
            {patient.user.first_name} {patient.user.last_name}
          </h2>
          <div className="text-sm text-gray-500 dark:text-slate-400 flex space-x-2">
            <span>{getAge(patient.date_of_birth)} ans</span>
            {patient.blood_type && (
              <>
                <span>•</span>
                <span>{patient.blood_type}</span>
              </>
            )}
          </div>
        </div>
        <button className="text-indigo-600 dark:text-indigo-400 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
          <Activity size={20} />
        </button>
      </div>

      {/* Action Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveAction('note')}
          className={`py-3 rounded-lg font-medium shadow-sm transition flex items-center justify-center gap-1 ${
            activeAction === 'note'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
          }`}
        >
          <FileText size={16} />
          <span className="text-sm">Note</span>
        </button>
        <button
          onClick={() => setActiveAction('prescription')}
          className={`py-3 rounded-lg font-medium shadow-sm transition flex items-center justify-center gap-1 ${
            activeAction === 'prescription'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
          }`}
        >
          <Pill size={16} />
          <span className="text-sm">Rx</span>
        </button>
        <button
          onClick={() => setActiveAction('lab')}
          className={`py-3 rounded-lg font-medium shadow-sm transition flex items-center justify-center gap-1 ${
            activeAction === 'lab'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700'
          }`}
        >
          <Beaker size={16} />
          <span className="text-sm">Labo</span>
        </button>
      </div>

      {/* Medical Record Form */}
      {activeAction === 'note' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Note Clinique</h3>

          <div className="space-y-3">
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
            >
              <option value="consultation">Consultation</option>
              <option value="diagonosis">Diagnostic</option>
              <option value="vaccination">Vaccination</option>
              <option value="other">Autre</option>
            </select>

            <input
              type="text"
              placeholder="Titre de la note"
              value={recordTitle}
              onChange={(e) => setRecordTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Tension"
                value={vitals.bloodPressure}
                onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Poids (kg)"
                value={vitals.weight}
                onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Temp. (°C)"
                value={vitals.temperature}
                onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
              />
            </div>

            <textarea
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 h-32 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              placeholder="Observations, diagnostic, traitement..."
              value={recordDescription}
              onChange={(e) => setRecordDescription(e.target.value)}
            ></textarea>

            <button
              onClick={handleSaveMedicalRecord}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer au DEP'}
            </button>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      {activeAction === 'prescription' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Nouvelle Ordonnance</h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom du médicament"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
            />

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Posologie (ex: 500mg)"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
              />
              <input
                type="text"
                placeholder="Fréquence (ex: 2x/jour)"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white p-2 rounded text-sm"
              />
            </div>

            <input
              type="text"
              placeholder="Durée (ex: 7 jours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
            />

            <textarea
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 h-24 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
              placeholder="Instructions particulières..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            ></textarea>

            <button
              onClick={handleSavePrescription}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer l\'ordonnance'}
            </button>
          </div>
        </div>
      )}

      {/* Lab Test Form */}
      {activeAction === 'lab' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3">Prescrire un Examen</h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom de l'examen (ex: Hémogramme complet)"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
            />

            <button
              onClick={handleOrderLabTest}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Prescription...' : 'Prescrire l\'examen'}
            </button>
          </div>
        </div>
      )}

      {/* Recent History */}
      <div>
        <h3 className="font-bold text-gray-600 dark:text-slate-300 mb-2">Historique Récent</h3>
        {medicalRecords.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">Aucun historique disponible</p>
        ) : (
          <div className="space-y-2">
            {medicalRecords.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg border border-gray-200 dark:border-slate-600 text-sm">
                <span className="font-semibold block dark:text-white">{record.title}</span>
                <span className="text-gray-500 dark:text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};