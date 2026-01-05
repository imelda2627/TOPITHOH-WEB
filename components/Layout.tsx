import React from 'react';
import { UserRole } from '../types';
import { LogOut, User, Activity, FileText, Shield, Home, Users, CheckSquare, BarChart3 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout, activeTab, setActiveTab, darkMode, toggleDarkMode }) => {
  
  if (!userRole) return <>{children}</>;

  const getNavItems = () => {
    switch (userRole) {
      case 'patient':
      case 'user':
      case UserRole.PATIENT:
        return [
          { id: 'summary', icon: Home, label: 'Accueil' },
          { id: 'history', icon: FileText, label: 'Dossier' },
          { id: 'access', icon: Shield, label: 'Accès' },
          { id: 'profile', icon: User, label: 'Profil' },
        ];
      case 'doctor':
      case UserRole.DOCTOR:
        return [
          { id: 'patients', icon: User, label: 'Patients' },
          { id: 'consultations', icon: Activity, label: 'Soins' },
        ];
      case 'laboratory':
      case UserRole.LAB:
        return [
          { id: 'requests', icon: FileText, label: 'Demandes' },
          { id: 'results', icon: Activity, label: 'Analyses' },
        ];
      case 'admin':
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', icon: BarChart3, label: 'Stats' },
          { id: 'validations', icon: CheckSquare, label: 'Approbations' },
          { id: 'users', icon: Users, label: 'Utilisateurs' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  
  // Dynamic header color - Updated for Purple Theme
  const getHeaderColor = () => {
    return 'gradient-brand'; // Utilise le dégradé violet défini dans index.css
  };

  return (
    <div className="min-h-screen bg-app dark:bg-[#0a0118] flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Header Mis à jour */}
      <header className={`${getHeaderColor()} text-white p-5 sticky top-0 z-50 shadow-xl`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tighter">TOHPITOH</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
              Imelda Digital Health
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={toggleDarkMode} className="p-2 glass rounded-xl">
              {darkMode ? <Activity className="text-yellow-300" size={18} /> : <Activity className="text-white" size={18} />}
            </button>
            <button onClick={onLogout} className="p-2 glass rounded-xl hover:bg-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 p-5 bg-app dark:bg-[#0a0118]">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="glass dark:bg-[#1a1025] border-t border-slate-200 dark:border-slate-800 fixed bottom-0 w-full max-w-md pb-safe">
        <div className="flex justify-around items-center h-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
                  isActive ? 'text-[#8b5cf6]' : 'text-slate-400 opacity-60 hover:opacity-100'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-[#8b5cf6]/10 shadow-inner' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-tighter ${isActive ? 'visible' : 'hidden'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};