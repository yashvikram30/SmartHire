import { motion } from 'framer-motion';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import Hero from '@components/landing/Hero';
import Features from '@components/landing/Features';
import HowItWorks from '@components/landing/HowItWorks';
import Statistics from '@components/landing/Statistics';
import FeaturedJobs from '@components/landing/FeaturedJobs';
import Testimonials from '@components/landing/Testimonials';
import CTASection from '@components/landing/CTASection';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        <Statistics />
        <Features />
        <HowItWorks />
        <FeaturedJobs />
        <Testimonials />
        <CTASection />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
