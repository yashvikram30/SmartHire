import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@components/common/Button';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="py-20 bg-white dark:bg-dark-bg">
            <div className="container-custom">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl bg-primary-600 px-6 py-16 sm:px-12 sm:py-24 text-center shadow-2xl"
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                        </svg>
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg text-primary-100 mb-10">
                            Whether you're looking for your next career move or searching for top talent, SmartHire connects you with the right opportunities.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button 
                                size="lg" 
                                className="bg-white text-primary-600 hover:bg-gray-100 w-full sm:w-auto"
                                onClick={() => navigate('/register?role=jobseeker')}
                            >
                                Get Started Now
                            </Button>
                        <Button 
                            size="lg" 
                            variant="outline" 
                            className="border-white text-white hover:bg-primary-700 w-full sm:w-auto"
                            as="a"
                            href="#"
                        >
                            Contact Sales
                        </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CTASection;
