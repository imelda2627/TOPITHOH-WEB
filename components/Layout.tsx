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
          { id: 'consultations', icon: Activity, label: 'Consults' },
        ];
      case 'laboratory':
      case UserRole.LAB:
        return [
          { id: 'requests', icon: FileText, label: 'Demandes' },
          { id: 'results', icon: Activity, label: 'Résultats' },
        ];
      case 'admin':
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
          { id: 'validations', icon: CheckSquare, label: 'Validations' },
          { id: 'users', icon: Users, label: 'Utilisateurs' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  
  // Dynamic header color based on role
  const getHeaderColor = () => {
    if (userRole === 'admin' || userRole === UserRole.ADMIN) return 'bg-purple-600';
    if (userRole === 'doctor' || userRole === UserRole.DOCTOR) return 'bg-secondary';
    if (userRole === 'laboratory' || userRole === UserRole.LAB) return 'bg-accent';
    return 'bg-primary';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-gray-200 dark:border-slate-700 transition-colors duration-300">
      {/* Mobile Header */}
      <header className={`${getHeaderColor()} text-white p-4 sticky top-0 z-50 shadow-md transition-colors duration-300`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">TOHPITOH</h1>
            <p className="text-xs text-white/80">
              {(userRole === 'admin' || userRole === UserRole.ADMIN) ? 'Administration Système' :
               (userRole === 'patient' || userRole === 'user' || userRole === UserRole.PATIENT) ? 'Mon Dossier Médical' : 'Espace Pro'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-white/20 transition"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button onClick={onLogout} className="p-2 rounded-full hover:bg-white/20 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-24 p-4 scroll-smooth bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
        {children}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 fixed bottom-0 w-full max-w-md pb-safe transition-colors duration-300">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const activeColor = (userRole === 'admin' || userRole === UserRole.ADMIN) ? 'text-purple-600 dark:text-purple-400' :
                              (userRole === 'laboratory' || userRole === UserRole.LAB) ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary dark:text-blue-400';

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? activeColor : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
