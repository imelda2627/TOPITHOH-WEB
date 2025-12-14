import React, { useState, useEffect } from 'react';
import { BackendRecordType, MedicalRecord, User, Patient } from '../types';
import { AlertCircle, FileText, Plus, Search, UserCheck, X, Lock } from 'lucide-react';
import { api } from '../services/api';

// --- SUMMARY VIEW ---
interface SummaryProps {
  user: User;
  patient?: Patient;
  medicalRecords: MedicalRecord[];
}

export const PatientSummary: React.FC<SummaryProps> = ({ user, patient, medicalRecords }) => {
  const records = medicalRecords;

  // Derive allergies/blood type safely
  const bloodType = patient?.blood_type || 'Inconnu';
  const allergies = patient?.known_allergies ? patient.known_allergies.split(',') : ['Aucune connue'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Emergency Card */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-danger mt-1" size={24} />
          <div>
            <h3 className="font-bold text-danger text-lg">Mode Urgence</h3>
            <p className="text-sm text-red-700 mt-1">
              ID Patient: <strong>{user.id}</strong>
            </p>
            {patient?.emergency_access_code && (
                 <p className="text-xs text-red-600 mt-1">Code Urgence: {patient.emergency_access_code}</p>
            )}
            <div className="mt-3 text-sm font-semibold text-red-800">
              Groupe Sanguin: {bloodType}
            </div>
            <div className="mt-1 text-sm text-red-800">
              Allergies: {allergies.join(', ')}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Records */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Activités Récentes</h3>
        {records.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Aucun dossier médical trouvé.</p>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700`}>
                    {record.record_type}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(record.date).toLocaleDateString()}</span>
                </div>
                <h4 className="font-semibold text-gray-800">{record.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">{record.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- HISTORY VIEW ---
interface HistoryProps {
  records: MedicalRecord[];
}

export const PatientHistory: React.FC<HistoryProps> = ({ records }) => {
  const [filter, setFilter] = useState<string>('All');

  // Ensure records is always an array
  const safeRecords = records || [];

  const filteredRecords = filter === 'All'
    ? safeRecords
    : safeRecords.filter(r => r.record_type === filter);

  // Get unique types from records for filter
  const uniqueTypes = Array.from(new Set(safeRecords.map(r => r.record_type)));
  const filters = ['All', ...uniqueTypes];

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800">Dossier Médical</h2>
      
      {/* Filters */}
      <div className="flex overflow-x-auto no-scrollbar space-x-2 pb-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {f === 'All' ? 'Tout' : f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-6">
        {filteredRecords.map((record) => (
          <div key={record.id} className="mb-8 ml-6 relative">
            <span className="absolute -left-[31px] bg-white border-2 border-primary rounded-full w-4 h-4 mt-1.5"></span>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-400">{new Date(record.date).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{record.title}</h3>
              <p className="text-gray-600 text-sm mt-1 mb-3">{record.description}</p>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                 <span className="text-xs text-gray-400">Type: {record.record_type}</span>
                {record.attachment_url && (
                   <button className="text-primary hover:text-blue-700 text-sm font-medium flex items-center">
                     <FileText size={14} className="mr-1" /> Document
                   </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ACCESS CONTROL VIEW ---
interface AccessProps {
  token: string;
}

interface AccessPermission {
  id: number;
  patient_id: number;
  granted_to_id: number;
  granted_by_id: number;
  access_type: 'view' | 'edit';
  expires_at: string | null;
  purpose: string;
  is_active: boolean;
  granted_to?: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

interface Doctor {
  id: number;
  user_id: number;
  specialization: string;
  license_number: string;
  hospital_affiliation: string;
  is_approved: boolean;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const PatientAccess: React.FC<AccessProps> = ({ token }) => {
  const [accessList, setAccessList] = useState<AccessPermission[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [accessType, setAccessType] = useState<'view' | 'edit'>('view');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permissions, doctorList] = await Promise.all([
        api.patient.getAccessPermissions(token),
        api.patient.getAllDoctors(token)
      ]);
      setAccessList(permissions);
      setDoctors(doctorList.filter((d: Doctor) => d.is_approved)); // Only approved doctors
    } catch (error) {
      console.error('Error loading access data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedDoctor || !purpose.trim()) {
      alert('Veuillez sélectionner un médecin et saisir l\'objectif');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      await api.patient.grantPermission(token, {
        granted_to_id: selectedDoctor,
        access_type: accessType,
        expires_at: expiresAt.toISOString(),
        purpose
      });

      alert('Accès accordé avec succès');
      setShowAddModal(false);
      setSelectedDoctor(null);
      setPurpose('');
      await loadData();
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Erreur lors de l\'accord de l\'accès');
    }
  };

  const handleRevokeAccess = async (permissionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cet accès?')) return;

    try {
      await api.patient.revokePermission(token, permissionId);
      alert('Accès révoqué avec succès');
      await loadData();
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Erreur lors de la révocation de l\'accès');
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestion des Accès</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
        >
          <Plus size={24} />
        </button>
      </div>
      <p className="text-sm text-gray-500 dark:text-slate-400">Gérez qui peut accéder à votre dossier médical</p>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : accessList.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <Lock className="mx-auto mb-3 text-gray-300 dark:text-slate-600" size={48} />
          <p className="text-gray-500 dark:text-slate-400">Aucun accès accordé</p>
        </div>
      ) : (
        <div className="space-y-3">
          {accessList.map((access) => {
            const expired = isExpired(access.expires_at);
            return (
              <div
                key={access.id}
                className={`bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border ${
                  expired ? 'border-gray-300 dark:border-slate-600 opacity-60' : 'border-gray-100 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 dark:text-white">
                      Dr. {access.granted_to?.user.first_name} {access.granted_to?.user.last_name}
                    </h4>
                    <p className={`text-xs mt-1 ${expired ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {expired ? 'Expiré' : access.is_active ? 'Autorisé' : 'Inactif'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                      {access.purpose}
                    </p>
                    {access.expires_at && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
                        Expire le: {new Date(access.expires_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      access.access_type === 'edit'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}>
                      {access.access_type === 'edit' ? 'Édition' : 'Lecture'}
                    </span>
                    {access.is_active && !expired && (
                      <button
                        onClick={() => handleRevokeAccess(access.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        Révoquer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Accorder un Accès</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Sélectionner un médecin
                </label>
                <select
                  value={selectedDoctor || ''}
                  onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                  className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
                >
                  <option value="">-- Choisir --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.user_id}>
                      Dr. {doctor.user.first_name} {doctor.user.last_name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Type d'accès
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAccessType('view')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      accessType === 'view'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    Lecture seule
                  </button>
                  <button
                    onClick={() => setAccessType('edit')}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      accessType === 'edit'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    Édition
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Durée (jours)
                </label>
                <input
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(Number(e.target.value))}
                  min="1"
                  max="365"
                  className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Objectif de l'accès
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ex: Consultation de suivi, traitement en cours..."
                  className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2 text-sm h-20"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGrantAccess}
                  className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-600"
                >
                  Accorder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PROFILE VIEW ---
interface ProfileViewProps {
  user: User;
  patient?: Patient;
}

export const PatientProfileView: React.FC<ProfileViewProps> = ({ user, patient }) => {

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <img 
          src={user.avatar || 'https://ui-avatars.com/api/?name=' + user.first_name + '+' + user.last_name} 
          alt="Profile" 
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover bg-gray-200"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Informations Personnelles</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Date de Naissance</label>
              <p className="font-medium text-gray-800">{patient?.date_of_birth || 'Non renseigné'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-400 uppercase tracking-wider">Groupe Sanguin</label>
              <p className="font-medium text-gray-800">{patient?.blood_type || '?'}</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider">Téléphone</label>
            <p className="font-medium text-gray-800">{user.phone}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-800">Conditions Médicales</h3>
        </div>
        <div className="p-4">
          <div className="mb-4">
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Allergies</label>
            <div className="flex flex-wrap gap-2">
              {patient?.known_allergies ? patient.known_allergies.split(',').map(alg => (
                <span key={alg} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-100">
                  {alg}
                </span>
              )) : <span className="text-sm text-gray-500">Aucune</span>}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Maladies Chroniques</label>
            <p className="text-gray-700 text-sm">{patient?.known_diseases || 'Aucune'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
