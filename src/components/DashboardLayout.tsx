import { useState } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  User,
  UserCircle,
  Wrench,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function DashboardLayout({ children, currentView, onNavigate, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const mainMenuItems = [
    { id: 'overview', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'missions', label: 'Missions', icon: MapPin },
    { id: 'vehicles', label: 'Véhicules', icon: Truck },
    { id: 'assignments', label: 'Affectations', icon: Users },
    { id: 'reports', label: 'Rapports', icon: FileText },
  ];

  const userMenuItems = [
    { id: 'admins', label: 'Administrateurs', icon: Shield },
    { id: 'agents', label: 'Agents', icon: User },
    { id: 'chauffeurs', label: 'Chauffeurs', icon: UserCircle },
    { id: 'chefgarages', label: 'Chefs de Garage', icon: Wrench },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="flex items-center gap-2">
                <Truck className="w-8 h-8 text-slate-700" />
                <span className="text-xl font-bold text-slate-900">TransGestion</span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out z-40 mt-16 lg:mt-0 overflow-y-auto`}
        >
          <nav className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Principal
              </h3>
              <div className="space-y-1">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Management Section */}
            <div>
              <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Gestion des Utilisateurs
              </h3>
              <div className="space-y-1">
                {userMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-medium'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}