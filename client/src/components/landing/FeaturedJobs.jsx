import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicApi } from '@api/publicApi';
import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import Card from '@components/common/Card';
import Badge from '@components/common/Badge';
import Button from '@components/common/Button';

const FeaturedJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedJobs = async () => {
            try {
                // Fetch featured jobs or just latest jobs if no featured ones
                const response = await publicApi.getAllJobs({ limit: 4, sortBy: 'createdAt' });
                if (response.success) {
                    setJobs(response.data.jobs);
                }
            } catch (error) {
                console.error("Error fetching featured jobs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedJobs();
    }, []);

    if (loading) return null; // Or a spinner/skeleton

    return (
        <section className="py-20 bg-gray-50 dark:bg-dark-bg-secondary">
            <div className="container-custom">
                <div className="flex items-end justify-between mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-light-text dark:text-dark-text mb-4">
                            Featured <span className="gradient-text">Internships</span>
                        </h2>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                            Discover top opportunities hand-picked for you.
                        </p>
                    </div>
                    <Link to="/jobs" className="hidden md:block">
                        <Button variant="outline">View All Internships</Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {jobs && jobs.map((job, index) => (
                        <motion.div
                            key={job._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Link to={`/jobs/${job._id}`}>
                                <Card hover className="h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-bold text-xl text-primary-600">
                                                {job.company?.name?.charAt(0) || 'C'}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg hover:text-primary-600 transition-colors cursor-pointer">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                                                    {job.company?.name || 'Confidential'}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge>{job.employmentType}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-light-text-muted dark:text-dark-text-muted mb-6">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            {job.location?.city || 'Remote'}
                                        </div>
                                        <div className="flex items-center">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            {job.salary ? `${job.salary.min/1000}k - ${job.salary.max/1000}k` : 'Competitive'}
                                        </div>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Button size="sm" variant="outline" className="w-full mr-2">Details</Button>
                                        <Button size="sm" className="w-full ml-2">Apply Now</Button>
                                    </div>
                                </Card>
                            </Link>
                        </motion.div>
                    ))}
                </div>
                
                <div className="text-center md:hidden">
                    <Link to="/jobs">
                        <Button variant="outline" className="w-full">View All Internships</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedJobs;
