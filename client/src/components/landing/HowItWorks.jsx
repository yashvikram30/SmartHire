import { motion } from 'framer-motion';
import { UserPlus, Search, Send, Briefcase } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: "Create Account",
      description: "Sign up and build your professional profile in minutes."
    },
    {
      icon: Search,
      title: "Search Internships",
      description: "Filter through thousands of internships to find your perfect match."
    },
    {
      icon: Send,
      title: "Apply",
      description: "Submit applications with a single click and track their status."
    },
    {
      icon: Briefcase,
      title: "Get Hired",
      description: "Schedule interviews and accept offers from top companies."
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-bg">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            How It Works
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Your journey to a new career in four simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[2.5rem] left-1/2 -translate-x-1/2 w-[85%] h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-6 relative">
                    <div className="w-20 h-20 bg-white dark:bg-dark-bg-secondary rounded-full border-4 border-primary-50 dark:border-primary-900/30 flex items-center justify-center shadow-soft">
                      <Icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="absolute top-0 right-1/2 -mr-10 -mt-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm border-2 border-white dark:border-dark-bg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary px-4">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
