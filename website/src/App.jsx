import React, { useContext } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './AppContext';
import Navigation from './components/Navigation';

// Screens imports
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import DashboardScreen from './screens/DashboardScreen';
import SleepScreen from './screens/SleepScreen';
import CaffeineScreen from './screens/CaffeineScreen';
import NutritionScreen from './screens/NutritionScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShiftScreen from './screens/ShiftScreen';
import FatigueScreen from './screens/FatigueScreen';
import SafeToDriveScreen from './screens/SafeToDriveScreen';
import BurnoutScreen from './screens/BurnoutScreen';
import SleepAnalyzerScreen from './screens/SleepAnalyzerScreen';
import RecoveryScreen from './screens/RecoveryScreen';
import AIChatScreen from './screens/AIChatScreen';
import WeeklyReportScreen from './screens/WeeklyReportScreen';
import WellnessGoalsScreen from './screens/WellnessGoalsScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';

import TopBar from './components/TopBar';

// Protected Layout wrapper
const ProtectedLayout = ({ children }) => {
  const { token } = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="app-layout-body">
        {sidebarOpen && <Navigation />}
        <main className="main-content" style={{ marginLeft: sidebarOpen ? '270px' : '0' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

// Public Route Guard (redirect to Dashboard if logged in)
const PublicRoute = ({ children }) => {
  const { token } = useContext(AppContext);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/onboarding" element={<PublicRoute><OnboardingScreen /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterScreen /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordScreen /></PublicRoute>} />

      {/* Optional Profile Completion Route */}
      <Route path="/create-profile" element={<ProtectedLayout><CreateProfileScreen /></ProtectedLayout>} />

      {/* Protected Pages wrapped in layout */}
      <Route path="/" element={<ProtectedLayout><DashboardScreen /></ProtectedLayout>} />
      <Route path="/sleep" element={<ProtectedLayout><SleepScreen /></ProtectedLayout>} />
      <Route path="/caffeine" element={<ProtectedLayout><CaffeineScreen /></ProtectedLayout>} />
      <Route path="/nutrition" element={<ProtectedLayout><NutritionScreen /></ProtectedLayout>} />
      <Route path="/shifts" element={<ProtectedLayout><ShiftScreen /></ProtectedLayout>} />
      <Route path="/profile" element={<ProtectedLayout><ProfileScreen /></ProtectedLayout>} />
      
      {/* Analytics & Intelligence */}
      <Route path="/fatigue" element={<ProtectedLayout><FatigueScreen /></ProtectedLayout>} />
      <Route path="/drive-safety" element={<ProtectedLayout><SafeToDriveScreen /></ProtectedLayout>} />
      <Route path="/burnout" element={<ProtectedLayout><BurnoutScreen /></ProtectedLayout>} />
      <Route path="/sleep-analyzer" element={<ProtectedLayout><SleepAnalyzerScreen /></ProtectedLayout>} />
      <Route path="/recovery" element={<ProtectedLayout><RecoveryScreen /></ProtectedLayout>} />
      
      {/* AI & Reporting */}
      <Route path="/ai-chat" element={<ProtectedLayout><AIChatScreen /></ProtectedLayout>} />
      <Route path="/reports" element={<ProtectedLayout><WeeklyReportScreen /></ProtectedLayout>} />
      <Route path="/goals" element={<ProtectedLayout><WellnessGoalsScreen /></ProtectedLayout>} />
      
      {/* System configs */}
      <Route path="/settings" element={<ProtectedLayout><SettingsScreen /></ProtectedLayout>} />
      <Route path="/notifications" element={<ProtectedLayout><NotificationsScreen /></ProtectedLayout>} />

      {/* Catch All redirect to Dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}
