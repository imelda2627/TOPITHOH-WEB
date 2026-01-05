import React, { useState, useEffect } from 'react';
import { UserRole, FullProfile, MedicalRecord, RegistrationPayload } from './types';
import { Layout } from './components/Layout';
import { PatientSummary, PatientHistory, PatientAccess, PatientProfileView } from './components/PatientViews';
import { DoctorPatientList, DoctorConsultation } from './components/DoctorViews';
import { AdminDashboard, AdminUsersList, AdminValidations } from './components/AdminViews';
import { LabTestRequests, LabTestResults } from './components/LabViews';
import { 
  Activity, ShieldCheck, User as UserIcon, Lock, Loader2, 
  Stethoscope, ChevronLeft, ArrowRight, ShieldAlert, 
  Mail, Phone, Calendar, Hash, Building, FlaskConical 
} from 'lucide-react';
import { api } from './services/api';

const App: React.FC = () => {
  // --- AUTHENTICATION STATE ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<FullProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // --- UI FLOW STATE ---
  const [authStep, setAuthStep] = useState<'role-selection' | 'login' | 'register'>('role-selection');
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState('summary');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? saved === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // --- FORM STATES ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regData, setRegData] = useState({
    firstName: '', lastName: '', phone: '', dob: '', gender: 'M',
    licenseNumber: '', specialty: '', hospital: '',
  });

  // --- EFFECTS ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    if (token) loadUserData(token);
  }, [token]);

  // --- LOGIC HANDLERS ---
  const loadUserData = async (authToken: string) => {
    setLoading(true);
    try {
      const profile = await api.getProfile(authToken);
      setUserProfile(profile);
      const role = profile.user.role;
      if (role === 'patient' || role === 'user') {
         const records = await api.getMedicalRecords(authToken);
         setMedicalRecords(records);
         setActiveTab('summary');
      } else if (role === 'admin') setActiveTab('dashboard');
      else if (role === 'doctor') setActiveTab('patients');
      else if (role === 'laboratory') setActiveTab('requests');
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const selectRole = (role: UserRole) => {
    setTargetRole(role);
    setAuthStep('login');
    setError('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await api.login(email, password);
      const authToken = data.token || data.accessToken || data.access || data.key;
      if (authToken) {
        const profile = await api.getProfile(authToken);
        const userRole = profile.user.role;
        let roleValid = false;
        if (userRole === 'admin' && targetRole === UserRole.ADMIN) roleValid = true;
        else if (targetRole === UserRole.PATIENT && (userRole === 'patient' || userRole === 'user')) roleValid = true;
        else if (targetRole === UserRole.DOCTOR && userRole === 'doctor') roleValid = true;
        else if (targetRole === UserRole.LAB && userRole === 'laboratory') roleValid = true;

        if (!roleValid) throw new Error(`Accès refusé.`);

        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUserProfile(profile);
      }
    } catch (err: any) {
      setError(err.message || "Identifiants incorrects");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload: RegistrationPayload = {
        email, password,
        first_name: regData.firstName, last_name: regData.lastName,
        phone: regData.phone,
        role: targetRole === UserRole.LAB ? 'laboratory' : targetRole === UserRole.DOCTOR ? 'doctor' : 'patient',
      };
      if (targetRole === UserRole.PATIENT) {
        payload.date_of_birth = regData.dob;
        payload.gender = regData.gender;
      } else if (targetRole === UserRole.DOCTOR) {
        payload.license_number = regData.licenseNumber;
        payload.specialty = regData.specialty;
        payload.hospital = regData.hospital;
      } else if (targetRole === UserRole.LAB) {
        payload.license_number = regData.licenseNumber;
      }
      await api.register(payload);
      setSuccessMsg("Compte créé !");
      setAuthStep('login');
    } catch (err: any) {
      setError(err.message || "Erreur.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserProfile(null);
    setAuthStep('role-selection');
  };

  // --- RENDER UNAUTHENTICATED ---
  if (!token || !userProfile) {
    return (
      <div className="min-h-screen bg-app dark:bg-[#0a0118] flex flex-col items-center justify-center p-6 transition-colors duration-500 overflow-y-auto">
        
        {/* Toggle Dark Mode */}
        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-6 right-6 p-3 glass rounded-2xl shadow-xl z-20">
          {darkMode ? <Activity className="text-yellow-400" size={20} /> : <Activity className="text-[#8b5cf6]" size={20} />}
        </button>

        <div className="w-full max-w-lg">
          {/* LOGO AREA */}
          <div className="text-center mb-10 animate-fade-in-up">
            <div className="w-20 h-20 gradient-brand rounded-[2rem] shadow-2xl flex items-center justify-center mx-auto mb-6 animate-float">
              <Activity className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-gradient tracking-tighter">TOHPITOH</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 text-center">Digital Health Platform</p>
          </div>

          {/* STEP 1: BENTO SELECTION */}
          {authStep === 'role-selection' && (
            <div className="animate-fade-in-up space-y-6">
               <p className="text-center text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Choisissez votre espace</p>
               <div className="bento-grid">
                  <button onClick={() => selectRole(UserRole.PATIENT)} className="bento-item">
                    <div className="bento-icon"><UserIcon size={24} /></div>
                    <span className="font-bold">Patient</span>
                    <span className="text-[10px] opacity-40">Mon dossier</span>
                  </button>
                  <button onClick={() => selectRole(UserRole.DOCTOR)} className="bento-item">
                    <div className="bento-icon"><Stethoscope size={24} /></div>
                    <span className="font-bold">Médecin</span>
                    <span className="text-[10px] opacity-40">Soins & Suivi</span>
                  </button>
                  <button onClick={() => selectRole(UserRole.LAB)} className="bento-item">
                    <div className="bento-icon"><FlaskConical size={24} /></div>
                    <span className="font-bold">Labo</span>
                    <span className="text-[10px] opacity-40">Analyses</span>
                  </button>
                  <button onClick={() => selectRole(UserRole.ADMIN)} className="bento-item">
                    <div className="bento-icon"><ShieldAlert size={24} /></div>
                    <span className="font-bold">Admin</span>
                    <span className="text-[10px] opacity-40">Système</span>
                  </button>
               </div>
            </div>
          )}

          {/* STEP 2: LOGIN / REGISTER */}
          {(authStep === 'login' || authStep === 'register') && targetRole && (
            <div className="glass rounded-[2.5rem] p-8 shadow-2xl relative animate-fade-in">
              <button onClick={() => setAuthStep('role-selection')} className="absolute top-6 left-6 text-slate-400 hover:text-[#8b5cf6]">
                <ChevronLeft size={24} />
              </button>

              <div className="text-center mb-8 pt-4">
                <h2 className="text-2xl font-black uppercase tracking-tight dark:text-white">Portail {targetRole}</h2>
              </div>

              {authStep === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" className="w-full glass border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#8b5cf6] outline-none" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Mot de passe" className="w-full glass border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-[#8b5cf6] outline-none" />
                  <button type="submit" disabled={loading} className="w-full gradient-brand text-white font-bold py-4 rounded-2xl shadow-xl active:scale-95 transition">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "Accéder à l'espace"}
                  </button>
                  <button type="button" onClick={() => setAuthStep('register')} className="w-full text-center text-xs font-bold text-slate-400 py-2">Créer un compte</button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 max-h-[50vh] overflow-y-auto px-1 pr-2 no-scrollbar">
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Prénom" required className="w-full glass border-none rounded-2xl px-4 py-3 text-sm" onChange={(e) => setRegData({...regData, firstName: e.target.value})} />
                    <input type="text" placeholder="Nom" required className="w-full glass border-none rounded-2xl px-4 py-3 text-sm" onChange={(e) => setRegData({...regData, lastName: e.target.value})} />
                  </div>
                  <input type="email" placeholder="Email" required className="w-full glass border-none rounded-2xl px-4 py-3 text-sm" onChange={(e) => setEmail(e.target.value)} />
                  <input type="password" placeholder="Mot de passe" required className="w-full glass border-none rounded-2xl px-4 py-3 text-sm" onChange={(e) => setPassword(e.target.value)} />
                  
                  <button type="submit" disabled={loading} className="w-full gradient-brand text-white font-bold py-4 rounded-2xl shadow-xl">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : "S'inscrire"}
                  </button>
                </form>
              )}
            </div>
          )}

          <footer className="mt-12 text-center opacity-40">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              © 2025 TOHPITOH • Conçu par Imelda
            </p>
          </footer>
        </div>
      </div>
    );
  }

  // --- RENDER AUTHENTICATED ---
  return (
    <Layout 
      userRole={userProfile.user.role as UserRole} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      darkMode={darkMode} 
      toggleDarkMode={() => setDarkMode(!darkMode)}
    >
      {userProfile.user.role === 'patient' || userProfile.user.role === 'user' ? (
        <>
          {activeTab === 'summary' && <PatientSummary user={userProfile.user} patient={userProfile.patient} medicalRecords={medicalRecords} />}
          {activeTab === 'history' && <PatientHistory records={medicalRecords} />}
          {activeTab === 'access' && <PatientAccess token={token || ''} />}
          {activeTab === 'profile' && <PatientProfileView user={userProfile.user} patient={userProfile.patient} />}
        </>
      ) : userProfile.user.role === 'doctor' ? (
        <>
          {activeTab === 'patients' && <DoctorPatientList token={token || ''} />}
          {activeTab === 'consultations' && <DoctorConsultation token={token || ''} />}
        </>
      ) : userProfile.user.role === 'laboratory' ? (
        <>
          {activeTab === 'requests' && <LabTestRequests token={token || ''} />}
          {activeTab === 'results' && <LabTestResults token={token || ''} />}
        </>
      ) : (
        <>
          {activeTab === 'dashboard' && <AdminDashboard token={token || ''} />}
          {activeTab === 'validations' && <AdminValidations token={token || ''} />}
          {activeTab === 'users' && <AdminUsersList token={token || ''} />}
        </>
      )}
    </Layout>
  );
};

export default App;