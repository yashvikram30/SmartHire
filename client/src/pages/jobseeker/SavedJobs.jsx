import { useState, useEffect } from 'react';
import { Bookmark, Loader2 } from 'lucide-react';
import JobCard from '@components/jobs/JobCard';
import { jobSeekerApi } from '@api/jobSeekerApi';
import { toast } from 'react-hot-toast';
import Button from '@components/common/Button';
import { Link } from 'react-router-dom';

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerApi.getSavedJobs();
      if (response.success) {
        setSavedJobs(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      toast.error('Failed to load saved jobs');
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
            Saved Internships
          </h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Keep track of the opportunities you're interested in.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : savedJobs.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {savedJobs.map((savedJob) => (
              <JobCard key={savedJob._id} job={savedJob.jobId} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-dark-bg-secondary rounded-xl border border-light-border dark:border-dark-border shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
              <Bookmark className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">
              No saved internships yet
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6 max-w-md mx-auto">
              Save internships that interest you so you can easily find them later and apply when you're ready.
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

export default SavedJobs;
