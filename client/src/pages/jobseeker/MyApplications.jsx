import { useState, useEffect } from 'react';
import { Loader2, FileText } from 'lucide-react';
import { jobSeekerApi } from '@api/jobSeekerApi';
import { toast } from 'react-hot-toast';
import Button from '@components/common/Button';
import { Link } from 'react-router-dom';
import ApplicationCard from '@components/jobs/ApplicationCard';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerApi.getMyApplications();
      if (response.success) {
        setApplications(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            My Applications
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Track the status of all your internship applications.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : applications.length > 0 ? (
          <div className="grid gap-4">
            {applications.map((app) => (
              <ApplicationCard key={app._id} application={app} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
              <FileText className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No applications yet
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
              You haven't applied to any internships yet. Browse available positions and jumpstart your career!
            </p>
            <div className="flex justify-center">
              <Link to="/jobs">
                <Button variant="primary">Browse Internships</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplications;
