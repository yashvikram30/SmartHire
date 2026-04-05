import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Navbar from '@components/layout/Navbar';
import Footer from '@components/layout/Footer';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-lg border border-light-border dark:border-dark-border overflow-hidden">
            
            {/* Contact Info Sidebar */}
            <div className="lg:col-span-2 p-10 bg-gradient-to-br from-primary-600 to-accent-600 text-white flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-4 text-white">Get in Touch</h2>
                <p className="mb-10 text-primary-100 leading-relaxed">
                  Have questions about our platform? We'd love to hear from you. Fill out the form and our team will be in touch shortly.
                </p>
                
                <div className="space-y-8">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Mail className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Email</span>
                    </div>
                    <span className="text-primary-100 pl-12">support@smarthire.com</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Phone className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Phone</span>
                    </div>
                    <span className="text-primary-100 pl-12">+1 (555) 123-4567</span>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3 text-white">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-medium">Office</span>
                    </div>
                    <span className="text-primary-100 pl-12">123 Innovation Drive,<br />Tech City, CA 94043</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-3 p-10">
              <h3 className="text-2xl font-bold mb-6 text-light-text dark:text-dark-text">Send us a Message</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <Input
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="How can we help?"
                  required
                />
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">Message</label>
                  <textarea
                    className="w-full px-4 py-3 bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-light-text dark:text-dark-text transition-all duration-200"
                    rows="5"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>
                <div className="pt-2">
                  <Button type="submit" size="lg" className="w-full md:w-auto px-8" isLoading={isLoading}>
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
