import { motion } from 'framer-motion';
import { Target, Shield, Clock, Award } from 'lucide-react';
import Card from '@components/common/Card';

const Features = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Matching",
      description: "Our AI-powered algorithm connects you with jobs that perfectly match your skills and experience.",
      color: "text-primary-600",
      bg: "bg-primary-50 dark:bg-primary-900/20"
    },
    {
      icon: Shield,
      title: "Verified Employers",
      description: "We verify every employer to ensure legitimate opportunities and a safe job search experience.",
      color: "text-accent-600",
      bg: "bg-accent-50 dark:bg-accent-900/20"
    },
    {
      icon: Clock,
      title: "Fast Application",
      description: "Apply to multiple jobs with a single click using your stored profile and resume.",
      color: "text-success-600",
      bg: "bg-success-50 dark:bg-success-900/20"
    },
    {
      icon: Award,
      title: "Skill Assessment",
      description: "Showcase your expertise with our skill verification tests and stand out to recruiters.",
      color: "text-warning-600",
      bg: "bg-warning-50 dark:bg-warning-900/20"
    }
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-dark-bg-secondary">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            Why Choose SmartHire?
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            We provide the tools you need to find your dream job or the perfect candidate faster and easier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card hover className="h-full text-center p-8">
                  <div className={`inline-flex p-3 rounded-xl ${feature.bg} ${feature.color} mb-6`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
