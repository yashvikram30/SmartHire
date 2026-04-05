import { motion } from 'framer-motion';
import { Users, Briefcase, Building2, TrendingUp } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const Statistics = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const stats = [
    {
      icon: Users,
      value: '50K+',
      label: 'Active Candidates',
      color: 'from-primary-500 to-primary-600',
    },
    {
      icon: Building2,
      value: '5K+',
      label: 'Companies Hiring',
      color: 'from-accent-500 to-accent-600',
    },
    {
      icon: Briefcase,
      value: '15K+',
      label: 'Active Internship Listings',
      color: 'from-success-500 to-success-600',
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Success Rate',
      color: 'from-warning-500 to-warning-600',
    },
  ];
  
  return (
    <section ref={ref} className="py-16 bg-white dark:bg-dark-bg">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-4xl font-bold text-light-text dark:text-dark-text mb-2">
                  {stat.value}
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Statistics;
