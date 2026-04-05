import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import useAuthStore from '@store/authStore';

// Layout Components
import AdminLayout from '@components/layout/AdminLayout';
import JobSeekerLayout from '@components/layout/JobSeekerLayout';
import RecruiterLayout from '@components/layout/RecruiterLayout';

// Public Pages
import LandingPage from '@pages/public/LandingPage';
import Login from '@pages/public/Login';
import Register from '@pages/public/Register';
import ForgotPassword from '@pages/public/ForgotPassword';
import ResetPassword from '@pages/public/ResetPassword';
import VerifyEmail from '@pages/public/VerifyEmail';
import About from '@pages/public/About';
import Contact from '@pages/public/Contact';
import PrivacyPolicy from '@pages/public/PrivacyPage';
import TermsOfService from '@pages/public/TermsOfService';

// Job Pages
import JobListings from '@pages/jobs/JobListings';


// Job Seeker Pages
import JobSeekerDashboard from '@pages/jobseeker/Dashboard';
import JobSeekerProfile from '@pages/jobseeker/Profile';
import MyApplications from '@pages/jobseeker/MyApplications';
import ApplicationDetail from '@pages/jobseeker/ApplicationDetail';
import SavedJobs from '@pages/jobseeker/SavedJobs';
import JobSeekerSettings from '@pages/jobseeker/Settings';

// Recruiter Pages
import RecruiterDashboard from '@pages/recruiter/Dashboard';
import RecruiterProfile from '@pages/recruiter/Profile';
import PostJob from '@pages/recruiter/PostJob';
import MyJobs from '@pages/recruiter/MyJobs';
import JobManagement from '@pages/recruiter/JobManagement';
import Applications from '@pages/recruiter/Applications';
import CandidateSearch from '@pages/recruiter/CandidateSearch';
import CandidateProfile from '@pages/recruiter/CandidateProfile';
import RecruiterAnalytics from '@pages/recruiter/Analytics';
import RecruiterSettings from '@pages/recruiter/Settings';

// Admin Pages
import AdminDashboard from '@pages/admin/Dashboard';
import UserManagement from '@pages/admin/UserManagement';
import RecruiterVerification from '@pages/admin/RecruiterVerification';
import JobModeration from '@pages/admin/JobModeration';
import CategoryManagement from '@pages/admin/CategoryManagement';
import SkillManagement from '@pages/admin/SkillManagement';
import AdminAnalytics from '@pages/admin/Analytics';
import SystemSettings from '@pages/admin/Settings';

// Error Pages
import NotFound from '@pages/errors/NotFound';
import Unauthorized from '@pages/errors/Unauthorized';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();
  
  // Redirect authenticated users from landing page to their dashboard
  const getDashboardRoute = () => {
    if (!isAuthenticated) return '/';
    
    switch (user?.role) {
      case 'jobseeker':
        return '/jobseeker/dashboard';
      case 'recruiter':
        return '/recruiter/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to={getDashboardRoute()} replace /> : <LandingPage />} 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />
      <Route path="/verify-email" element={<VerifyEmail />} /> {/* Query parameter support */}
      
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      
      {/* Job Browsing Routes (Public + Authenticated) */}
      <Route path="/jobs" element={<JobListings />} />

      
      {/* Job Seeker Protected Routes - Nested with Layout */}
      <Route element={<ProtectedRoute allowedRoles={['jobseeker']} />}>
        <Route element={<JobSeekerLayout />}>
          <Route path="/jobseeker/dashboard" element={<JobSeekerDashboard />} />
          <Route path="/jobseeker/profile" element={<JobSeekerProfile />} />
          <Route path="/jobseeker/applications" element={<MyApplications />} />
          <Route path="/jobseeker/applications/:id" element={<ApplicationDetail />} />
          <Route path="/jobseeker/saved-jobs" element={<SavedJobs />} />
          <Route path="/jobseeker/settings" element={<JobSeekerSettings />} />
        </Route>
      </Route>
      
      {/* Recruiter Protected Routes - Nested with Layout */}
      <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
        <Route element={<RecruiterLayout />}>
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/profile" element={<RecruiterProfile />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/recruiter/jobs" element={<MyJobs />} />
          <Route path="/recruiter/jobs/:id" element={<JobManagement />} />
          <Route path="/recruiter/applications" element={<Applications />} />
          <Route path="/recruiter/candidates" element={<CandidateSearch />} />
          <Route path="/recruiter/candidates/:id" element={<CandidateProfile />} />
          <Route path="/recruiter/analytics" element={<RecruiterAnalytics />} />
          <Route path="/recruiter/settings" element={<RecruiterSettings />} />
        </Route>
      </Route>
      
      {/* Admin Protected Routes - Nested with Layout */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/recruiters" element={<RecruiterVerification />} />
          <Route path="/admin/jobs/moderate" element={<JobModeration />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/skills" element={<SkillManagement />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>
      </Route>
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
