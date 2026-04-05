import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-dark-bg-secondary p-8 sm:p-12 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Privacy Policy</h1>
          <div className="prose dark:prose-invert max-w-none text-light-text-secondary dark:text-dark-text-secondary">
            <p className="mb-4">Last updated: April 2026</p>
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">1. Introduction</h2>
            <p className="mb-4">Welcome to SmartHire. We respect your privacy and are committed to protecting your personal data. This privacy policy describes how we look after your personal data when you visit our website and tells you about your privacy rights and how the law protects you.</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">2. Data We Collect</h2>
            <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data, Contact Data, Technical Data, Usage Data, and Profile Data (including skills, resumes, and video assessments).</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">3. How We Use Your Data</h2>
            <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to register you as a new user, manage our relationship with you, and match students with appropriate career opportunities provided by recruiters on our platform.</p>
            
            <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mt-8 mb-4">4. Data Security</h2>
            <p className="mb-4">We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
