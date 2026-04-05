import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Bell, User, LogOut, Settings } from 'lucide-react';
import useAuthStore from '@store/authStore';
import useThemeStore from '@store/themeStore';
import Button from '@components/common/Button';
import Avatar from '@components/common/Avatar';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const { isAuthenticated, user, logout } = useAuthStore();
  const { displayMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/');
    logout();
  };
  
const navLinks = [
        { to: '/jobs', label: 'Browse Internships' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
      ];


const recuiterNavLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard' },
  { to: '/contact', label: 'Contact' },
];

const jobseekerNavLinks = [
  { to: '/jobseeker/dashboard', label: 'Dashboard' },
  { to: '/contact', label: 'Contact' },
];

const adminNavLinks = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/contact', label: 'Contact' },
];
  
  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-light-text dark:text-dark-text">
              SmartHire
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(() => {
              const links = (() => {
                switch(user?.role) {
                  case 'jobseeker':
                    return jobseekerNavLinks;
                  case 'recruiter':
                    return recuiterNavLinks;
                  case 'admin':
                    return adminNavLinks;
                  default:
                    return navLinks;
                }
              })();
              
              return links.map((link, index) => (
                <NavLink
                  key={index}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400'
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ));
            })()}
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            >
              {displayMode === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            
            {isAuthenticated ? (
              <>
                
                
                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                  >
                    <Avatar src={user?.profilePicture} size="sm" />
                    <span className="hidden lg:block text-sm font-medium">
                      {user?.name || user?.email}
                    </span>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-bg-secondary rounded-lg shadow-large border border-light-border dark:border-dark-border">
                      <Link
                        to={`#`}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        to={`#`}
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors text-error-600 border-t border-light-border dark:border-dark-border"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-light-border dark:border-dark-border">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            
            {!isAuthenticated && (
              <div className="pt-4 space-y-2">
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Login
                </Button>
                <Button
                  className="w-full"
                  onClick={() => {
                    navigate('/register');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
