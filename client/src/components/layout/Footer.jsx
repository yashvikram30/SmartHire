import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    'For Job Seekers': [
      { label: 'Browse Jobs', to: '/jobs' },
      { label: 'Career Advice', to: '#' },
      { label: 'Resume Tips', to: '#' },
      { label: 'Interview Prep', to: '#' },
    ],
    'For Employers': [
      { label: 'Post a Job', to: '/recruiter/post-job' },
      { label: 'Pricing', to: '#' },
      { label: 'Recruiter Resources', to: '#' },
      { label: 'Hiring Guide', to: '#' },
    ],
    'Company': [
      { label: 'About Us', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Careers', to: '#' },
      { label: 'Press', to: '#' },
    ],
    'Legal': [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Cookie Policy', to: '#' },
      { label: 'Accessibility', to: '#' },
    ],
  };
  
  const socialLinks = [
    { icon: Facebook, to: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, to: 'https://twitter.com', label: 'Twitter' },
    { icon: Linkedin, to: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Instagram, to: 'https://instagram.com', label: 'Instagram' },
  ];
  
  return (
    <footer className="bg-gray-50 dark:bg-dark-bg-secondary border-t border-light-border dark:border-dark-border">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-xl font-bold text-light-text dark:text-dark-text">
                SmartHire
              </span>
            </Link>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Connecting students with opportunity. Find your dream internship or hire excellent interns.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
          
          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-light-border dark:border-dark-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              © {new Date().getFullYear()} SmartHire. All rights reserved.
            </p>
            
            {/* Newsletter */}
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-light-text-secondary dark:text-dark-text-secondary" />
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Subscribe to our newsletter
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
