import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Briefcase, MapPin, DollarSign, Calendar, List, 
  CheckCircle, AlertCircle, Save, X, Plus, Trash2,
  ChevronRight, ChevronLeft, Search, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { recruiterApi } from '@api/recruiterApi';
import { publicApi } from '@api/publicApi';
import Button from '@components/common/Button';
import Spinner from '@components/common/Spinner';

const JobManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  
  // Verification check state
  const [isVerified, setIsVerified] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    employmentType: 'full-time',
    experienceLevel: 'entry',
    experienceYears: { min: 0, max: 0 },
    education: { minDegree: 'bachelor', preferredFields: [] },
    salary: { min: 0, max: 0, currency: 'USD', isVisible: true },
    location: { 
      city: '', state: '', country: '', 
      isRemote: false, remoteType: '' 
    },
    numberOfOpenings: 1,
    applicationDeadline: '',
    qualifications: [],
    requiredSkills: [],
    screeningQuestions: []
  });

  // Helper for dynamic arrays (qualifications)
  const [newQualification, setNewQualification] = useState('');
  
  // Helper for screening questions
  const [newQuestion, setNewQuestion] = useState({ question: '', isRequired: false });

  // Initial Data Fetch
  useEffect(() => {
    const init = async () => {
      try {
        setFetching(true);
        
        // 1. Check Verification (Optional but good practice)
        const verifyStatus = await recruiterApi.getVerificationStatus();
        setIsVerified(verifyStatus.data?.isVerified || false);

        // 2. Fetch Categories & Skills
        const [cats, sks] = await Promise.all([
          publicApi.getAllCategories(),
          publicApi.getAllSkills({ limit: 100 })
        ]);
        setCategories(cats.data || []);
        setSkills(sks.data || []);

        // 3. Fetch Job Details
        if (id) {
          const jobRes = await publicApi.getJobById(id);
          const job = jobRes.data;
          
          if (job) {
            // Map job data to form state
            setFormData({
              title: job.title || '',
              description: job.description || '',
              category: job.category?._id || job.category || '',
              employmentType: job.employmentType || 'full-time',
              experienceLevel: job.experienceLevel || 'entry',
              experienceYears: { 
                min: job.experienceYears?.min || 0, 
                max: job.experienceYears?.max || 0 
              },
              education: { 
                minDegree: job.education?.minDegree || 'bachelor', 
                preferredFields: job.education?.preferredFields || [] 
              },
              salary: { 
                min: job.salary?.min || 0, 
                max: job.salary?.max || 0, 
                currency: job.salary?.currency || 'USD', 
                isVisible: job.salary?.isVisible ?? true 
              },
              location: { 
                city: job.location?.city || '', 
                state: job.location?.state || '', 
                country: job.location?.country || '', 
                isRemote: job.location?.isRemote || false, 
                remoteType: job.location?.remoteType || '' 
              },
              numberOfOpenings: job.numberOfOpenings || 1,
              // Format date key for input type="datetime-local"
              applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 16) : '',
              qualifications: job.qualifications || [],
              // Map skills to always be an array of IDs
              requiredSkills: job.requiredSkills?.map(s => typeof s === 'object' ? s._id : s) || [],
              screeningQuestions: job.screeningQuestions || []
            });
          }
        }

      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Failed to load job details");
        navigate('/recruiter/jobs');
      } finally {
        setFetching(false);
      }
    };
    init();
  }, [id, navigate]);

  // Handlers
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const addQualification = () => {
    if (!newQualification.trim()) return;
    setFormData(prev => ({
      ...prev,
      qualifications: [...prev.qualifications, newQualification.trim()]
    }));
    setNewQualification('');
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const toggleSkill = (skillId) => {
    setFormData(prev => {
      const exists = prev.requiredSkills.includes(skillId);
      if (exists) {
        return { ...prev, requiredSkills: prev.requiredSkills.filter(id => id !== skillId) };
      }
      return { ...prev, requiredSkills: [...prev.requiredSkills, skillId] };
    });
  };

  const addScreeningQuestion = () => {
    if (!newQuestion.question.trim()) return;
    setFormData(prev => ({
      ...prev,
      screeningQuestions: [...prev.screeningQuestions, { ...newQuestion }]
    }));
    setNewQuestion({ question: '', isRequired: false });
  };

  const removeScreeningQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      screeningQuestions: prev.screeningQuestions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic Validation
    if (!formData.title || !formData.description || !formData.employmentType || !formData.experienceLevel) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.location.isRemote && !formData.location.remoteType) {
      toast.error("Please specify remote type for remote jobs");
      return;
    }

    try {
      setLoading(true);
      
      // Prepare payload to prevent validation errors with empty strings
      const payload = JSON.parse(JSON.stringify(formData));
      
      // Sanitize remoteType
      if (!payload.location.isRemote) {
        delete payload.location.remoteType;
      }
      
      // Ensure date provided is valid, else delete it if empty
      if (!payload.applicationDeadline) {
         delete payload.applicationDeadline;
      }

      await recruiterApi.updateJob(id, payload);
      toast.success("Job updated successfully!");
      navigate('/recruiter/jobs');
      
    } catch (error) {
      console.error("Update job error:", error);
      const msg = error.response?.data?.message || "Failed to update job";
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        error.response.data.errors.forEach(errMs => toast.error(errMs));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8">
      <div className="container-custom max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Edit Job Details</h1>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
              Update your job listing information
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/recruiter/jobs')}>
             Back to My Jobs
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Basic Info */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center">
              <Briefcase className="w-5 h-5 mr-2" /> Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="label">Job Title *</label>
                <input 
                  type="text" 
                  className="input" 
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g. Senior Frontend Developer"
                  required
                />
              </div>
              
              <div>
                <label className="label">Category</label>
                <select 
                  className="input"
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Employment Type *</label>
                <select 
                  className="input"
                  value={formData.employmentType}
                  onChange={(e) => handleChange('employmentType', e.target.value)}
                  required
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="label">Number of Openings</label>
                <input 
                  type="number" 
                  min="1"
                  className="input"
                  value={formData.numberOfOpenings}
                  onChange={(e) => handleChange('numberOfOpenings', parseInt(e.target.value))}
                />
              </div>

              <div>
                <label className="label">Application Deadline</label>
                <input 
                  type="datetime-local" 
                  className="input"
                  value={formData.applicationDeadline}
                  onChange={(e) => handleChange('applicationDeadline', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. Job Details */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center">
              <List className="w-5 h-5 mr-2" /> Description & Qualifications
            </h2>
            
            <div className="mb-6">
              <label className="label">Job Description *</label>
              <textarea 
                className="input min-h-[150px]"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the role, responsibilities, and company information..."
                required
              />
            </div>

            <div>
              <label className="label">Qualifications / Requirements</label>
              <div className="flex space-x-2 mb-3">
                <input 
                  type="text" 
                  className="input"
                  value={newQualification}
                  onChange={(e) => setNewQualification(e.target.value)}
                  placeholder="Add a qualification (e.g. '5+ years experience')"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
                />
                <Button type="button" onClick={addQualification} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <ul className="space-y-2">
                {formData.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-dark-bg p-2 rounded">
                    <span className="text-sm text-light-text dark:text-dark-text">{q}</span>
                    <button type="button" onClick={() => removeQualification(idx)} className="text-error-500 hover:text-error-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Requirements (Experience & Education) */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center">
               Experience & Education
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="label">Experience Level *</label>
                 <select 
                  className="input"
                  value={formData.experienceLevel}
                  onChange={(e) => handleChange('experienceLevel', e.target.value)}
                  required
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead / Manager</option>
                  <option value="executive">Executive</option>
                </select>
              </div>

              <div>
                <label className="label">Min Degree</label>
                 <select 
                  className="input"
                  value={formData.education.minDegree}
                  onChange={(e) => handleNestedChange('education', 'minDegree', e.target.value)}
                >
                  <option value="high-school">High School</option>
                  <option value="associate">Associate Degree</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="doctorate">Doctorate</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Min Years Exp</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input"
                    value={formData.experienceYears.min}
                    onChange={(e) => handleNestedChange('experienceYears', 'min', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Max Years Exp</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input"
                    value={formData.experienceYears.max}
                    onChange={(e) => handleNestedChange('experienceYears', 'max', parseInt(e.target.value))}
                  />
                </div>
              </div>

            </div>
          </div>

          {/* 4. Compensation & Location */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm border border-light-border dark:border-dark-border">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center">
               <DollarSign className="w-5 h-5 mr-2" /> Compensation & Location
            </h2>
            
            {/* Salary */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3 uppercase tracking-wider">Salary Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                  <label className="label">Currency</label>
                  <select 
                    className="input"
                    value={formData.salary.currency}
                    onChange={(e) => handleNestedChange('salary', 'currency', e.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
                <div>
                  <label className="label">Minimum</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input"
                    value={formData.salary.min}
                    onChange={(e) => handleNestedChange('salary', 'min', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="label">Maximum</label>
                  <input 
                    type="number" 
                    min="0"
                    className="input"
                    value={formData.salary.max}
                    onChange={(e) => handleNestedChange('salary', 'max', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-2 flex items-center">
                <input 
                  type="checkbox"
                  id="salaryVisible"
                  checked={formData.salary.isVisible}
                  onChange={(e) => handleNestedChange('salary', 'isVisible', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="salaryVisible" className="ml-2 text-sm text-light-text dark:text-dark-text">Show salary publicly</label>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-3 uppercase tracking-wider">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input 
                  type="text" 
                  className="input" 
                  placeholder="City"
                  value={formData.location.city}
                  onChange={(e) => handleNestedChange('location', 'city', e.target.value)}
                />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="State"
                  value={formData.location.state}
                  onChange={(e) => handleNestedChange('location', 'state', e.target.value)}
                />
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Country"
                  value={formData.location.country}
                  onChange={(e) => handleNestedChange('location', 'country', e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-3">
                 <div className="flex items-center">
                    <input 
                      type="checkbox"
                      id="isRemote"
                      checked={formData.location.isRemote}
                      onChange={(e) => handleNestedChange('location', 'isRemote', e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="isRemote" className="ml-2 text-sm text-light-text dark:text-dark-text">This is a remote job</label>
                 </div>
                 
                 {formData.location.isRemote && (
                   <div className="ml-6">
                     <label className="label">Remote Type *</label>
                     <select 
                        className="input"
                        value={formData.location.remoteType}
                        onChange={(e) => handleNestedChange('location', 'remoteType', e.target.value)}
                        required={formData.location.isRemote}
                      >
                        <option value="">Select Remote Type</option>
                        <option value="fully-remote">Fully Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite (Temporary Remote)</option>
                      </select>
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* 5. Skills & Screening */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm border border-light-border dark:border-dark-border">
             <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-dark-text flex items-center">
               <CheckCircle className="w-5 h-5 mr-2" /> Skills & Screening
            </h2>

            {/* Skills */}
            <div className="mb-8">
              <label className="label">Required Skills</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  className="input pl-10"
                  placeholder="Search skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border border-light-border dark:border-dark-border rounded-lg">
                {skills
                  .filter(s => s.name.toLowerCase().includes(skillSearch.toLowerCase()))
                  .map(skill => (
                    <button
                      key={skill._id}
                      type="button"
                      onClick={() => toggleSkill(skill._id)}
                      className={`px-3 py-1 rounded-full text-sm transaction-colors ${
                        formData.requiredSkills.includes(skill._id)
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))
                }
              </div>
            </div>

            {/* Screening Questions */}
            <div>
              <label className="label">Screening Questions</label>
              <div className="flex gap-3 mb-3">
                 <input 
                    type="text"
                    className="input flex-1"
                    placeholder="Ask a question..."
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                 />
                 <div className="flex items-center">
                    <input 
                      type="checkbox"
                      id="reqQ"
                      checked={newQuestion.isRequired}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, isRequired: e.target.checked }))}
                      className="mr-2"
                    />
                    <label htmlFor="reqQ" className="text-sm whitespace-nowrap">Required</label>
                 </div>
                 <Button type="button" onClick={addScreeningQuestion} size="sm">
                   <Plus className="w-4 h-4" />
                 </Button>
              </div>
              
              <div className="space-y-3">
                {formData.screeningQuestions.map((sq, idx) => (
                  <div key={idx} className="flex items-start justify-between bg-gray-50 dark:bg-dark-bg p-3 rounded border border-light-border dark:border-dark-border">
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">{sq.question}</p>
                      <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {sq.isRequired ? 'Required answer' : 'Optional answer'}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeScreeningQuestion(idx)} className="text-error-500 hover:text-error-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4">
             <Button 
               variant="outline" 
               type="button" 
               onClick={() => navigate('/recruiter/jobs')}
             >
               Cancel
             </Button>
             <Button 
               type="submit" 
               disabled={loading}
               className="w-40"
             >
               {loading ? <Spinner size="sm" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
             </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default JobManagement;
