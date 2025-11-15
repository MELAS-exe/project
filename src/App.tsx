import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/Overview';
import { MissionsView } from './components/MissionsView';
import { VehiclesView } from './components/VehiclesView';
import { AssignmentsView } from './components/AssignmentsView';
import { ReportsView } from './components/ReportsView';
import { AdminsView } from './components/AdminsViews';
import { AgentsView } from './components/AgentsViews';
import { ChauffeursView } from './components/ChauffeurViews';
import { ChefGaragesView } from './components/ChefGaragesViews';


type AppState = 'landing' | 'login' | 'dashboard';

function App() {
  const [appState, setAppState] = useState<AppState>('landing');
  const [currentView, setCurrentView] = useState('overview');

  const handleLoginSuccess = () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAppState('landing');
    setCurrentView('overview');
  };

  const renderDashboardContent = () => {
    switch (currentView) {
      case 'overview':
        return <Overview />;
      case 'missions':
        return <MissionsView />;
      case 'vehicles':
        return <VehiclesView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'reports':
        return <ReportsView />;
      case 'admins':
        return <AdminsView />;
      case 'agents':
        return <AgentsView />;
      case 'chauffeurs':
        return <ChauffeursView />;
      case 'chefgarages':
        return <ChefGaragesView />;
      default:
        return <Overview />;
    }
  };

  if (appState === 'landing') {
    return <LandingPage onGetStarted={() => setAppState('login')} />;
  }

  if (appState === 'login') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onBack={() => setAppState('landing')}
      />
    );
  }

  return (
    <DashboardLayout
      currentView={currentView}
      onNavigate={setCurrentView}
      onLogout={handleLogout}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
}

export default App;