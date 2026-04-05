import { motion } from 'framer-motion';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 dark:bg-dark-bg p-8 flex items-center justify-center">
        <div className="container-custom max-w-4xl bg-white dark:bg-dark-bg-secondary p-10 rounded-2xl shadow-lg mt-8 mb-8 border border-light-border dark:border-dark-border">
          <h1 className="text-4xl font-bold mb-8 text-light-text dark:text-dark-text text-center">About SmartHire</h1>
          
          <div className="space-y-6 text-light-text-secondary dark:text-dark-text-secondary text-lg leading-relaxed">
            <p>
              SmartHire is a revolutionary dual-sided platform designed to bridge the gap between talented individuals and top-tier companies. Our vision is to elevate the hiring experience by moving beyond traditional resumes to verifiable skills, dynamic assessments, and unified communication.
            </p>
            <p>
              Born out of the frustration of recruitment "ghosting" and inefficient evaluation processes, SmartHire brings together an ecosystem where students can demonstrate their true potential and recruiters can find their perfect match seamlessly. Our built-in application tracker, real-time code editors, and video interview features provide a comprehensive, end-to-end recruitment solution.
            </p>
            <p>
              Whether you are an aspiring candidate looking to land your dream role, or an employer striving to build an exceptional team, SmartHire is committed to making the journey as transparent, efficient, and rewarding as possible.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
