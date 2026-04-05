import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import { jobSeekerApi } from '@api/jobSeekerApi';
import useApplicationStore from '@store/applicationStore';

const ApplyJobModal = ({ isOpen, onClose, job }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [screeningAnswers, setScreeningAnswers] = useState({});
  const addAppliedJobId = useApplicationStore(state => state.addAppliedJobId);

  // Reset state when modal is closed
  const handleClose = () => {
    setCoverLetter('');
    setScreeningAnswers({});
    onClose();
  };

  const handleAnswerChange = (question, answer) => {
    setScreeningAnswers((prev) => ({
      ...prev,
      [question]: answer,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required screening questions
    if (job?.screeningQuestions?.length > 0) {
      for (const sq of job.screeningQuestions) {
        if (sq.isRequired && !screeningAnswers[sq.question]?.trim()) {
          toast.error(`Please answer all required questions.`);
          return;
        }
      }
    }

    try {
      setLoading(true);

      const formattedAnswers = Object.entries(screeningAnswers).map(([question, answer]) => ({
        question,
        answer,
      }));

      await jobSeekerApi.applyToJob({
        jobId: job._id,
        coverLetter: coverLetter.trim(),
        screeningAnswers: formattedAnswers,
      });

      addAppliedJobId(job._id);
      toast.success('Successfully applied for the internship!');
      handleClose();
      // Optionally could trigger a re-fetch of job status here or redirect
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply. Please try again.');
      
      // If profile is incomplete, you could redirect to profile
      if (error.response?.data?.message?.toLowerCase().includes('profile')) {
        navigate('/jobseeker/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!job) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Apply for ${job.title}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Cover Letter
          </label>
          <textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={6}
            placeholder="Introduce yourself and explain why you're a great fit for this internship..."
            required
            maxLength={3000}
          />
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 text-right">
            {coverLetter.length} / 3000
          </p>
        </div>

        {job.screeningQuestions && job.screeningQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text border-b border-light-border dark:border-dark-border pb-2">
              Screening Questions
            </h3>
            {job.screeningQuestions.map((sq, idx) => (
              <div key={idx}>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                  {sq.question} {sq.isRequired && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={screeningAnswers[sq.question] || ''}
                  onChange={(e) => handleAnswerChange(sq.question, e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg-tertiary text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  required={sq.isRequired}
                  maxLength={1000}
                  placeholder="Your answer..."
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-light-border dark:border-dark-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplyJobModal;
