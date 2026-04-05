import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Calendar, MapPin, Building, Briefcase } from 'lucide-react';
import { jobSeekerApi } from '@api/jobSeekerApi';
import { toast } from 'react-hot-toast';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await jobSeekerApi.getApplicationDetails(id);
      if (response.success) {
        setApplication(response.data);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
      navigate('/jobseeker/applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return 'warning';
      case 'reviewed': return 'primary';
      case 'shortlisted':
      case 'interviewing': return 'success';
      case 'rejected':
      case 'withdrawn': return 'error';
      case 'offered':
      case 'hired': return 'success';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString, includeTime = false) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!application) return null;

  const job = application.jobId || {};
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-20">
      <div className="container-custom py-8">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-6 rounded-full border-none shadow-none text-light-text-secondary hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border dark:border-dark-border p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center text-light-text-secondary dark:text-dark-text-secondary mb-4">
                    <Building className="w-4 h-4 mr-2" />
                    <span>Applied to {job.companyId?.companyName || 'Unknown Company'}</span>
                  </div>
                </div>
                <Badge variant={getStatusColor(application.status)} className="capitalize text-sm px-3 py-1">
                  {application.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-light-border dark:border-dark-border mb-6">
                <div className="flex items-center text-sm text-light-text dark:text-dark-text">
                  <Calendar className="w-5 h-5 mr-3 text-primary-500" />
                  <div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Date Applied</p>
                    <p className="font-medium">{formatDate(application.appliedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-light-text dark:text-dark-text">
                  <Briefcase className="w-5 h-5 mr-3 text-primary-500" />
                  <div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Type</p>
                    <p className="font-medium capitalize">{job.employmentType}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 dark:bg-dark-bg p-5 rounded-xl border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                    {application.coverLetter || 'No cover letter provided.'}
                  </div>
                </div>

                {application.screeningAnswers && application.screeningAnswers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                      Screening Questions
                    </h3>
                    <div className="space-y-4">
                      {application.screeningAnswers.map((answerObj, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-dark-bg p-5 rounded-xl border border-light-border dark:border-dark-border">
                          <p className="font-medium text-light-text dark:text-dark-text mb-2">
                            Q: {answerObj.question}
                          </p>
                          <p className="text-light-text-secondary dark:text-dark-text-secondary whitespace-pre-wrap">
                            {answerObj.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border dark:border-dark-border p-6">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
                Application Timeline
              </h3>
              
              <div className="relative border-l-2 border-primary-100 dark:border-primary-900 ml-3 space-y-6 pb-2">
                {application.statusHistory && application.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-dark-bg border-2 border-primary-500"></div>
                    <div>
                      <p className="font-medium text-light-text dark:text-dark-text capitalize">
                        {history.status}
                      </p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {formatDate(history.changedAt, true)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl shadow-sm border border-light-border dark:border-dark-border p-6">
              <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
                Need Help?
              </h3>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                You can withdraw your application if it is still in the submitted stage.
              </p>
              
              <Button 
                variant="outline" 
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => toast.error('Withdrawal action is functional on backend but needs user confirmation dialogue here.')}
                disabled={!['submitted', 'reviewed'].includes(application.status)}
              >
                Withdraw Application
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
