import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-dark-bg-secondary p-8 sm:p-12 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Terms of Service</h1>
          <div className="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary">
            <p className="mb-4">Last updated: April 2026</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">By accessing and using SmartHire, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">2. Description of Service</h2>
            <p className="mb-4">SmartHire provides a platform connecting students with recruiters. We offer tools including real-time code editors, application tracking, and video interview platforms.</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">3. User Conduct</h2>
            <p className="mb-4">You agree not to use the platform for any unlawful purpose. Students must provide accurate information regarding their skills and experience. Recruiters must post genuine opportunities.</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">4. Account Termination</h2>
            <p className="mb-4">We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
