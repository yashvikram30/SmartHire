import DashboardLayout from '@components/layout/DashboardLayout';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  BookmarkCheck, 
  User, 
  Settings as SettingsIcon 
} from 'lucide-react';

const JobSeekerLayout = () => {
  const sidebarLinks = [
    { to: '/jobseeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/jobseeker/jobs', label: 'Browse Internships', icon: Briefcase },
    { to: '/jobseeker/applications', label: 'My Applications', icon: FileText },
    { to: '/jobseeker/saved-jobs', label: 'Saved Internships', icon: BookmarkCheck },
    { to: '/jobseeker/profile', label: 'Profile', icon: User },
    { to: '/jobseeker/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return <DashboardLayout sidebarLinks={sidebarLinks} />;
};

export default JobSeekerLayout;
