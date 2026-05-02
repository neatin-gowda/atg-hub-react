import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AllApps from './pages/AllApps';
import AgentDetail from './pages/AgentDetail';
import VoiceAgent from './pages/VoiceAgent';
import TalkAtlas from './pages/TalkAtlas';
import AtMotorsLanding from './pages/AtMotorsLanding';
import Leave from './pages/Leave';
import GiveKudos from './pages/GiveKudos';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const isAuth = pathname === '/login' || pathname === '/register';
  const isAtMotors = pathname === '/at-motors';

  return (
    <>
      <Routes>
        <Route path="/at-motors" element={<AtMotorsLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/apps" element={<ProtectedRoute><AllApps /></ProtectedRoute>} />
        <Route path="/apps/:category" element={<ProtectedRoute><AllApps /></ProtectedRoute>} />
        <Route path="/atlas" element={<ProtectedRoute><TalkAtlas /></ProtectedRoute>} />
        <Route path="/app/hr-voice" element={<ProtectedRoute><VoiceAgent /></ProtectedRoute>} />
        <Route path="/app/:id" element={<ProtectedRoute><AgentDetail /></ProtectedRoute>} />
        <Route path="/leave" element={<ProtectedRoute><Leave /></ProtectedRoute>} />
        <Route path="/kudos/give" element={<ProtectedRoute><GiveKudos /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && !isAuth && !isAtMotors && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
