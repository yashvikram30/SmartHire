import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Card from '@components/common/Card';
import Avatar from '@components/common/Avatar';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "UX Designer",
      content: "SmartHire made my job search incredibly easy. Within a week of creating my profile, I had three interviews scheduled and landed my dream job!",
      rating: 5
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Software Engineer",
      content: "The skill assessment features really helped me stand out. Recruiters knew exactly what I could bring to the table before we even spoke.",
      rating: 5
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Marketing Director",
      content: "As a hiring manager, this platform is a game-changer. The candidate quality is consistently higher than other platforms we've used.",
      rating: 4
    }
  ];

  return (
    <section className="py-20 bg-white dark:bg-dark-bg">
      <div className="container-custom">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
            What People Say
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Join thousands of satisfied job seekers and employers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full relative overflow-visible">
                <div className="absolute -top-6 left-8 bg-primary-500 text-white p-3 rounded-xl shadow-lg">
                    <Quote className="w-5 h-5" />
                </div>
                <div className="pt-8">
                    <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < testimonial.rating ? 'text-warning-500 fill-warning-500' : 'text-gray-300'}`} 
                            />
                        ))}
                    </div>
                    <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 italic">
                        "{testimonial.content}"
                    </p>
                    <div className="flex items-center space-x-3">
                        <Avatar size="md" />
                        <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">{testimonial.role}</p>
                        </div>
                    </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
