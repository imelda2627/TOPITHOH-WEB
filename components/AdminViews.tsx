import React, { useEffect, useState } from 'react';
import { AdminStats, User } from '../types';
import { api } from '../services/api';
import { Users, UserCheck, Activity, Search, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface ViewProps {
  token: string;
}

// --- ADMIN DASHBOARD ---
export const AdminDashboard: React.FC<ViewProps> = ({ token }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getStats(token);
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-600 dark:text-purple-400" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Vue d'ensemble</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
          <div className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
            <Users size={20} />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-xs uppercase font-bold">Utilisateurs</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalUsers || 0}</p>
        </div>

        {/* Validations Pending Card */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -mr-4 -mt-4 z-0"></div>
          <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3 relative z-10">
            <AlertTriangle size={20} />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-xs uppercase font-bold relative z-10">En Attente</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white relative z-10">{stats?.pendingValidations || 0}</p>
        </div>

        {/* Doctors Stats */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
           <div className="bg-blue-100 dark:bg-blue-900/30 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <UserCheck size={20} />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-xs uppercase font-bold">Médecins</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalDoctors || 0}</p>
        </div>

         {/* Patients Stats */}
         <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
           <div className="bg-green-100 dark:bg-green-900/30 w-10 h-10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-3">
            <Activity size={20} />
          </div>
          <p className="text-gray-500 dark:text-slate-400 text-xs uppercase font-bold">Patients</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats?.totalPatients || 0}</p>
        </div>
      </div>
    </div>
  );
};

// --- VALIDATION INTERFACE ---
export const AdminValidations: React.FC<ViewProps> = ({ token }) => {
  const [pending, setPending] = useState<any[]>([]); // Using any for flexible backend response mapping
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getPendingValidations(token);
      setPending(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleValidation = async (id: number, type: 'doctor' | 'laboratory', action: 'approve' | 'reject') => {
    if(!window.confirm(`Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'rejeter'} ce professionnel ?`)) return;
    
    try {
      await api.admin.validateProfessional(token, id, type, action);
      // Refresh list
      fetchPending();
    } catch (e) {
      alert("Erreur lors de l'action");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-600 dark:text-purple-400" /></div>;

  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Validations en attente</h2>

      {pending.length === 0 ? (
        <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-gray-300 dark:border-slate-600">
            <CheckCircle className="mx-auto text-green-500 dark:text-green-400 mb-2" size={32}/>
            <p className="text-gray-500 dark:text-slate-400">Aucune demande en attente.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
               <div className="flex justify-between items-start mb-2">
                 <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${item.type === 'doctor' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        {item.type === 'doctor' ? 'Médecin' : 'Laboratoire'}
                    </span>
                 </div>
                 <span className="text-xs text-gray-400 dark:text-slate-500">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
               </div>

               <h3 className="font-bold text-gray-800 dark:text-white text-lg">{item.name || 'Nom Inconnu'}</h3>
               <p className="text-sm text-gray-600 dark:text-slate-300 mb-1">{item.email}</p>
               <p className="text-xs text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-900/50 inline-block px-2 py-1 rounded">Licence: {item.license_number || 'N/A'}</p>

               <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => handleValidation(item.id, item.type, 'reject')}
                    className="flex items-center justify-center py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <XCircle size={16} className="mr-2" /> Rejeter
                  </button>
                  <button
                    onClick={() => handleValidation(item.id, item.type, 'approve')}
                    className="flex items-center justify-center py-2 bg-purple-600 dark:bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 dark:hover:bg-purple-700 shadow-sm"
                  >
                    <CheckCircle size={16} className="mr-2" /> Approuver
                  </button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- USER LIST INTERFACE ---
export const AdminUsersList: React.FC<ViewProps> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.admin.getAllUsers(token);
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(u => 
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fade-in">
       <div className="flex justify-between items-center mb-2">
         <h2 className="text-xl font-bold text-gray-800 dark:text-white">Utilisateurs</h2>
         <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full text-xs font-bold">{users.length}</span>
       </div>

       {/* Search Bar */}
       <div className="relative">
        <Search className="absolute left-3 top-3 text-gray-400 dark:text-slate-500" size={18} />
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-600 dark:text-purple-400" /></div>
      ) : (
        <div className="space-y-2">
            {filteredUsers.map(user => (
                <div key={user.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
                            ${user.role === 'admin' ? 'bg-purple-500 dark:bg-purple-600' :
                              user.role === 'doctor' ? 'bg-blue-500 dark:bg-blue-600' :
                              user.role === 'patient' ? 'bg-sky-500 dark:bg-sky-600' : 'bg-gray-400 dark:bg-gray-600'}`}>
                            {user.first_name ? user.first_name[0] : 'U'}
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{user.first_name} {user.last_name}</h4>
                            <p className="text-xs text-gray-500 dark:text-slate-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] uppercase font-semibold text-gray-400 dark:text-slate-500">{user.role}</span>
                        {user.is_active ?
                            <span className="text-[10px] text-green-600 dark:text-green-400">Actif</span> :
                            <span className="text-[10px] text-red-500 dark:text-red-400">Inactif</span>
                        }
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};
