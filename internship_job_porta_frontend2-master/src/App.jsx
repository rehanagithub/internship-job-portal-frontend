import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';

// Auth Pages
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';
import VerifyOtp from './pages/auth/VerifyOtp.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';

// Shared Pages
import Home from './pages/Home.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import NotFound from './pages/NotFound.jsx';

// Candidate Pages
import CandidateDashboard from './pages/candidate/Dashboard.jsx';
import CandidateProfile from './pages/candidate/Profile.jsx';
import CandidateApplications from './pages/candidate/Applications.jsx';
import ApplicationDetail from './pages/candidate/ApplicationDetail.jsx';
import SavedJobs from './pages/candidate/SavedJobs.jsx';
import ApplyJob from './pages/candidate/ApplyJob.jsx';
import CandidateMessages from './pages/candidate/Messages.jsx';
import CandidateNotifications from './pages/candidate/Notifications.jsx';

// Employer Pages
import EmployerDashboard from './pages/employer/Dashboard.jsx';
import EmployerProfile from './pages/employer/Profile.jsx';
import PostJob from './pages/employer/PostJob.jsx';
import EditJob from './pages/employer/EditJob.jsx';
import MyJobs from './pages/employer/MyJobs.jsx';
import EmployerApplications from './pages/employer/Applications.jsx';
import EmployerApplicationDetail from './pages/employer/ApplicationDetail.jsx';
import Analytics from './pages/employer/Analytics.jsx';
import TalentPool from './pages/employer/TalentPool.jsx';
import EmployerNotifications from './pages/employer/Notifications.jsx';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to={user.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard'} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />

          {/* Auth */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Candidate */}
          <Route path="/candidate/dashboard" element={<ProtectedRoute role="candidate"><CandidateDashboard /></ProtectedRoute>} />
          <Route path="/candidate/profile" element={<ProtectedRoute role="candidate"><CandidateProfile /></ProtectedRoute>} />
          <Route path="/candidate/applications" element={<ProtectedRoute role="candidate"><CandidateApplications /></ProtectedRoute>} />
          <Route path="/candidate/applications/:id" element={<ProtectedRoute role="candidate"><ApplicationDetail /></ProtectedRoute>} />
          <Route path="/candidate/saved" element={<ProtectedRoute role="candidate"><SavedJobs /></ProtectedRoute>} />
          <Route path="/candidate/apply/:jobId" element={<ProtectedRoute role="candidate"><ApplyJob /></ProtectedRoute>} />
          <Route path="/candidate/messages" element={<ProtectedRoute role="candidate"><CandidateMessages /></ProtectedRoute>} />
          <Route path="/candidate/notifications" element={<ProtectedRoute role="candidate"><CandidateNotifications /></ProtectedRoute>} />

          {/* Employer */}
          <Route path="/employer/dashboard" element={<ProtectedRoute role="employer"><EmployerDashboard /></ProtectedRoute>} />
          <Route path="/employer/profile" element={<ProtectedRoute role="employer"><EmployerProfile /></ProtectedRoute>} />
          <Route path="/employer/post-job" element={<ProtectedRoute role="employer"><PostJob /></ProtectedRoute>} />
          <Route path="/employer/jobs/:id/edit" element={<ProtectedRoute role="employer"><EditJob /></ProtectedRoute>} />
          <Route path="/employer/jobs" element={<ProtectedRoute role="employer"><MyJobs /></ProtectedRoute>} />
          <Route path="/employer/applications" element={<ProtectedRoute role="employer"><EmployerApplications /></ProtectedRoute>} />
          <Route path="/employer/applications/:id" element={<ProtectedRoute role="employer"><EmployerApplicationDetail /></ProtectedRoute>} />
          <Route path="/employer/analytics" element={<ProtectedRoute role="employer"><Analytics /></ProtectedRoute>} />
          <Route path="/employer/talent-pool" element={<ProtectedRoute role="employer"><TalentPool /></ProtectedRoute>} />
          <Route path="/employer/notifications" element={<ProtectedRoute role="employer"><EmployerNotifications /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
