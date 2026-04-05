import DashboardLayout from '@components/layout/DashboardLayout';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  User, 
  Settings as SettingsIcon,
  Search
} from 'lucide-react';

const RecruiterLayout = () => {
  const sidebarLinks = [
    { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recruiter/post-job', label: 'Post an Internship', icon: PlusCircle },
    { to: '/recruiter/jobs', label: 'My Internships', icon: Briefcase },
    { to: '/recruiter/applications', label: 'Applications', icon: FileText },
    { to: '/recruiter/candidates', label: 'Candidate Search', icon: Search },
    { to: '/recruiter/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/recruiter/profile', label: 'Profile', icon: User },
    { to: '/recruiter/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return <DashboardLayout sidebarLinks={sidebarLinks} />;
};

export default RecruiterLayout;
