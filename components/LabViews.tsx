import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Beaker, FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

interface LabTest {
  id: number;
  patient_id: number;
  doctor_id?: number;
  test_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  result_file_url?: string;
  doctor_interpretation?: string;
  ordered_date: string;
  completed_date?: string;
  patient?: {
    user: {
      first_name: string;
      last_name: string;
    }
  };
  doctor?: {
    user: {
      first_name: string;
      last_name: string;
    }
  };
}

interface LabProps {
  token: string;
}

export const LabTestRequests: React.FC<LabProps> = ({ token }) => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  useEffect(() => {
    loadTests();
  }, [token]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await api.laboratory.getPendingTests(token);
      setTests(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: number) => {
    try {
      await api.laboratory.startTest(token, testId);
      await loadTests();
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Erreur lors du démarrage du test');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock, label: 'En attente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Beaker, label: 'En cours' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Terminé' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Annulé' }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const filteredTests = tests.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.patient?.user?.first_name + ' ' + test.patient?.user?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedTest) {
    return (
      <TestDetailsView
        test={selectedTest}
        token={token}
        onBack={() => {
          setSelectedTest(null);
          loadTests();
        }}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Demandes d'Examens</h2>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom de test ou patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <Beaker className="mx-auto mb-3 text-gray-300 dark:text-slate-600" size={48} />
          <p className="text-gray-500 dark:text-slate-400">Aucune demande d'examen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 dark:text-white">{test.test_name}</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Patient: {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                  </p>
                  {test.doctor && (
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      Prescrit par: Dr. {test.doctor.user.first_name} {test.doctor.user.last_name}
                    </p>
                  )}
                </div>
                <ChevronRight className="text-gray-300 dark:text-slate-600" />
              </div>
              <div className="flex items-center justify-between mt-3">
                {getStatusBadge(test.status)}
                <span className="text-xs text-gray-500 dark:text-slate-500">
                  {new Date(test.ordered_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TestDetailsProps {
  test: LabTest;
  token: string;
  onBack: () => void;
}

const TestDetailsView: React.FC<TestDetailsProps> = ({ test, token, onBack }) => {
  const [results, setResults] = useState(test.results || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResults = async () => {
    if (!results.trim()) {
      alert('Veuillez saisir les résultats');
      return;
    }

    setSubmitting(true);
    try {
      await api.laboratory.completeTest(token, test.id, { results });
      alert('Résultats enregistrés avec succès');
      onBack();
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Erreur lors de l\'enregistrement des résultats');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTest = async () => {
    try {
      await api.laboratory.startTest(token, test.id);
      alert('Test démarré avec succès');
      onBack();
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Erreur lors du démarrage du test');
    }
  };

  return (
    <div className="animate-slide-in space-y-5">
      <button onClick={onBack} className="text-sm text-gray-500 dark:text-slate-400 flex items-center mb-2 hover:text-gray-700 dark:hover:text-slate-300">
        &larr; Retour liste
      </button>

      {/* Test Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h2 className="font-bold text-lg dark:text-white">{test.test_name}</h2>
        <div className="text-sm text-gray-600 dark:text-slate-400 mt-2 space-y-1">
          <p>Patient: {test.patient?.user?.first_name} {test.patient?.user?.last_name}</p>
          {test.doctor && (
            <p>Médecin: Dr. {test.doctor.user.first_name} {test.doctor.user.last_name}</p>
          )}
          <p>Date de prescription: {new Date(test.ordered_date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Status Actions */}
      {test.status === 'pending' && (
        <button
          onClick={handleStartTest}
          className="w-full bg-emerald-500 text-white py-3 rounded-lg font-medium shadow-md hover:bg-emerald-600 transition"
        >
          Démarrer l'examen
        </button>
      )}

      {/* Results Input */}
      {(test.status === 'in_progress' || test.status === 'completed') && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-slate-700">
          <h3 className="font-semibold text-gray-700 dark:text-white mb-3 flex items-center gap-2">
            <FileText size={18} />
            Résultats de l'examen
          </h3>

          <textarea
            className="w-full border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-3 h-40 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            placeholder="Saisissez les résultats détaillés de l'examen..."
            value={results}
            onChange={(e) => setResults(e.target.value)}
            disabled={test.status === 'completed'}
          ></textarea>

          {test.status === 'in_progress' && (
            <button
              onClick={handleSubmitResults}
              disabled={submitting}
              className="w-full mt-4 bg-emerald-500 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Déposer les résultats
                </>
              )}
            </button>
          )}

          {test.status === 'completed' && test.completed_date && (
            <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <CheckCircle size={16} />
                Résultats déposés le {new Date(test.completed_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Doctor Interpretation (if available) */}
      {test.doctor_interpretation && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Interprétation du médecin</h3>
          <p className="text-sm text-blue-800 dark:text-blue-400">{test.doctor_interpretation}</p>
        </div>
      )}
    </div>
  );
};

export const LabTestResults: React.FC<LabProps> = ({ token }) => {
  const [completedTests, setCompletedTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompletedTests();
  }, [token]);

  const loadCompletedTests = async () => {
    setLoading(true);
    try {
      const response = await api.laboratory.getPendingTests(token);
      const allTests = Array.isArray(response) ? response : response.data || [];
      // Filter for completed tests only
      setCompletedTests(allTests.filter((t: LabTest) => t.status === 'completed'));
    } catch (error) {
      console.error('Error loading completed tests:', error);
      setCompletedTests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = completedTests.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.patient?.user?.first_name + ' ' + test.patient?.user?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Résultats Complétés</h2>

      <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Rechercher dans les résultats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <CheckCircle className="mx-auto mb-3 text-gray-300 dark:text-slate-600" size={48} />
          <p className="text-gray-500 dark:text-slate-400">Aucun résultat complété</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-500" size={16} />
                    <h4 className="font-bold text-gray-800 dark:text-white">{test.test_name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    Patient: {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                  </p>
                  {test.completed_date && (
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                      Complété le: {new Date(test.completed_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              {test.results && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-slate-300 line-clamp-3">{test.results}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
