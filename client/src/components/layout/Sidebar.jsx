import { NavLink } from 'react-router-dom';
import { ChevronLeft, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '@store/authStore';
import Button from '@components/common/Button';

const Sidebar = ({ links = [], isMobile = false, onClose, isCollapsed = false, onToggleCollapse }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
    logout();
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'jobseeker':
        return 'Student';
      case 'recruiter':
        return 'Recruiter';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg-secondary border-r border-light-border dark:border-dark-border">
      {/* Sidebar Header - Collapse/Close Button */}
      <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-end">
        {!isMobile && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft
              className={`w-5 h-5 transition-transform ${
                isCollapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        )}
        {isMobile && onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={index}
                to={link.to}
                onClick={() => isMobile && onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary text-light-text dark:text-dark-text'
                  }`
                }
              >
                {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                {(!isCollapsed || isMobile) && (
                  <span className="font-medium">{link.label}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-light-border dark:border-dark-border space-y-2">
        <div
          className={`px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-bg-tertiary ${
            isCollapsed && !isMobile ? 'text-center' : ''
          }`}
        >
          {(!isCollapsed || isMobile) ? (
            <>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Logged in as
              </p>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 capitalize">
                {getRoleName()}
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">
              {user?.role?.charAt(0).toUpperCase()}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {(!isCollapsed || isMobile) && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
