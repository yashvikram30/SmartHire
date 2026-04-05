import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import Modal from '@components/common/Modal';
import Button from '@components/common/Button';
import SkillSearchFilter from '@components/jobs/SkillSearchFilter';

const CreateProfileModal = ({ isOpen, onClose, onSubmit, saving }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    headline: '',
    summary: '',
    skills: [],
    preferences: {
      jobType: [],
      remoteWorkPreference: '',
      desiredSalaryMin: '',
      desiredSalaryMax: '',
      willingToRelocate: false
    },
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    }
  });

  const [errors, setErrors] = useState({});

  const totalSteps = 4;

  const validateStep = (currentStep) => {
    const newErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.location.city.trim()) newErrors.city = 'City is required';
      if (!formData.location.country.trim()) newErrors.country = 'Country is required';
    }

    if (currentStep === 2) {
      if (!formData.headline.trim()) newErrors.headline = 'Headline is required';
      if (formData.headline.length > 120) newErrors.headline = 'Headline must be less than 120 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      // Clean up data before submitting - match backend schema exactly
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim() || undefined,
        location: {
          city: formData.location.city.trim(),
          state: formData.location.state.trim() || undefined,
          country: formData.location.country.trim(),
          zipCode: formData.location.zipCode.trim() || undefined,
        },
        headline: formData.headline.trim(),
        summary: formData.summary.trim() || undefined,
        skills: formData.skills.map(skill => skill._id), // Send only skill IDs
        preferences: {
          jobType: formData.preferences.jobType.map(type => type.toLowerCase().replace(/ /g, '-')), // Convert to lowercase with hyphens
          remoteWorkPreference: formData.preferences.remoteWorkPreference ? formData.preferences.remoteWorkPreference.toLowerCase() : undefined,
          desiredSalaryMin: formData.preferences.desiredSalaryMin ? parseInt(formData.preferences.desiredSalaryMin) : undefined,
          desiredSalaryMax: formData.preferences.desiredSalaryMax ? parseInt(formData.preferences.desiredSalaryMax) : undefined,
          willingToRelocate: formData.preferences.willingToRelocate,
        },
        socialLinks: {
          linkedin: formData.socialLinks.linkedin.trim() || undefined,
          github: formData.socialLinks.github.trim() || undefined,
          portfolio: formData.socialLinks.portfolio.trim() || undefined,
        }
      };
      
      // Remove undefined values from nested objects
      Object.keys(submitData).forEach(key => {
        if (submitData[key] && typeof submitData[key] === 'object' && !Array.isArray(submitData[key])) {
          Object.keys(submitData[key]).forEach(nestedKey => {
            if (submitData[key][nestedKey] === undefined) {
              delete submitData[key][nestedKey];
            }
          });
        }
        if (submitData[key] === undefined) {
          delete submitData[key];
        }
      });
      
      onSubmit(submitData);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateNestedFormData = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  First Name <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.firstName 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-light-border dark:border-dark-border focus:ring-primary-500'
                  } bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:border-transparent`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-error-600 mt-1">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Last Name <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.lastName 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-light-border dark:border-dark-border focus:ring-primary-500'
                  } bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:border-transparent`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-error-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  City <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => updateNestedFormData('location', 'city', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.city 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-light-border dark:border-dark-border focus:ring-primary-500'
                  } bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:border-transparent`}
                  placeholder="San Francisco"
                />
                {errors.city && (
                  <p className="text-xs text-error-600 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => updateNestedFormData('location', 'state', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Country <span className="text-error-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) => updateNestedFormData('location', 'country', e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    errors.country 
                      ? 'border-error-500 focus:ring-error-500' 
                      : 'border-light-border dark:border-dark-border focus:ring-primary-500'
                  } bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:border-transparent`}
                  placeholder="USA"
                />
                {errors.country && (
                  <p className="text-xs text-error-600 mt-1">{errors.country}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) => updateNestedFormData('location', 'zipCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="94105"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Professional Details
            </h3>

            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Professional Headline <span className="text-error-600">*</span>
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => updateFormData('headline', e.target.value)}
                maxLength={120}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.headline 
                    ? 'border-error-500 focus:ring-error-500' 
                    : 'border-light-border dark:border-dark-border focus:ring-primary-500'
                } bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:border-transparent`}
                placeholder="e.g., Full Stack Developer | React & Node.js Expert"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.headline && (
                  <p className="text-xs text-error-600">{errors.headline}</p>
                )}
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary ml-auto">
                  {formData.headline.length}/120
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                Professional Summary
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => updateFormData('summary', e.target.value)}
                rows={6}
                maxLength={2000}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Tell us about your professional background, skills, and career goals..."
              />
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 text-right">
                {formData.summary.length}/2000
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Skills
            </h3>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Add your professional skills to help recruiters find you
            </p>

            <SkillSearchFilter
              selectedSkills={formData.skills}
              onChange={(skills) => updateFormData('skills', skills)}
              maxSelections={20}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">
              Job Preferences
            </h3>

            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Preferred Job Types
              </label>
              <div className="space-y-2">
                {[
                  { value: 'full-time', label: 'Full-Time' },
                  { value: 'part-time', label: 'Part-Time' },
                  { value: 'contract', label: 'Contract' },
                  { value: 'freelance', label: 'Freelance' },
                  { value: 'internship', label: 'Internship' }
                ].map(type => (
                  <label key={type.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.preferences.jobType.includes(type.value)}
                      onChange={(e) => {
                        const newJobTypes = e.target.checked
                          ? [...formData.preferences.jobType, type.value]
                          : formData.preferences.jobType.filter(t => t !== type.value);
                        updateNestedFormData('preferences', 'jobType', newJobTypes);
                      }}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-light-text dark:text-dark-text">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
                Remote Work Preference
              </label>
              <select
                value={formData.preferences.remoteWorkPreference}
                onChange={(e) => updateNestedFormData('preferences', 'remoteWorkPreference', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select preference</option>
                <option value="remote">Remote Only</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site Only</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Desired Salary (Min)
                </label>
                <input
                  type="number"
                  value={formData.preferences.desiredSalaryMin}
                  onChange={(e) => updateNestedFormData('preferences', 'desiredSalaryMin', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
                  Desired Salary (Max)
                </label>
                <input
                  type="number"
                  value={formData.preferences.desiredSalaryMax}
                  onChange={(e) => updateNestedFormData('preferences', 'desiredSalaryMax', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100000"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.preferences.willingToRelocate}
                  onChange={(e) => updateNestedFormData('preferences', 'willingToRelocate', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-light-text dark:text-dark-text">
                  Willing to relocate
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-light-border dark:border-dark-border">
              <h4 className="text-sm font-medium text-light-text dark:text-dark-text mb-3">
                Social Links (Optional)
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => updateNestedFormData('socialLinks', 'linkedin', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.github}
                    onChange={(e) => updateNestedFormData('socialLinks', 'github', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://github.com/yourusername"
                  />
                </div>

                <div>
                  <label className="block text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.portfolio}
                    onChange={(e) => updateNestedFormData('socialLinks', 'portfolio', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Your Profile" size="lg">
      <div className="p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  stepNumber < step 
                    ? 'bg-primary-600 text-white' 
                    : stepNumber === step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  {stepNumber < step ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-sm font-medium">{stepNumber}</span>
                  )}
                </div>
                {stepNumber < totalSteps && (
                  <div className={`flex-1 h-1 mx-2 ${
                    stepNumber < step 
                      ? 'bg-primary-600' 
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-light-text-secondary dark:text-dark-text-secondary px-1">
            <span>Basic Info</span>
            <span>Professional</span>
            <span>Skills</span>
            <span>Preferences</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-light-border dark:border-dark-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1 || saving}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? 'Creating...' : 'Create Profile'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default CreateProfileModal;
