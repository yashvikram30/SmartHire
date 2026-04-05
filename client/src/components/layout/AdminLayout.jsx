import DashboardLayout from '@components/layout/DashboardLayout';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Tag, 
  BarChart3, 
  Settings as SettingsIcon,
  Award,
  ShieldCheck
} from 'lucide-react';

const AdminLayout = () => {
  const sidebarLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/recruiters', label: 'Recruiter Verification', icon: ShieldCheck },
    { to: '/admin/jobs/moderate', label: 'Internship Moderation', icon: Briefcase },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/skills', label: 'Skills', icon: Award },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];

  return <DashboardLayout sidebarLinks={sidebarLinks} />;
};

export default AdminLayout;
