import { useState } from 'react';
import { X, Plus, Calendar, Building2, GraduationCap, Award, FolderOpen, Link as LinkIcon } from 'lucide-react';
import Button from '@components/common/Button';
import Modal from '@components/common/Modal';
import SkillSearchFilter from '@components/jobs/SkillSearchFilter';

// Skills Manager
export const SkillsManager = ({ initialSkills, onSave, onCancel, saving }) => {
  const [skills, setSkills] = useState(initialSkills || []);

  const handleSave = () => {
    onSave(skills);
  };

  return (
    <div className="space-y-6">
      <SkillSearchFilter
        selectedSkills={skills}
        onChange={setSkills}
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Skills'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

// Work Experience Form
export const WorkExperienceForm = ({ experience, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(experience || {
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrentRole: false,
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Job Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Senior Software Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Company *
        </label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Google"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. San Francisco, CA"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Start Date *
          </label>
          <input
            type="month"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? `${e.target.value}-01` : '' })}
            required
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            End Date {formData.isCurrentRole && '(Current)'}
          </label>
          <input
            type="month"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? `${e.target.value}-01` : '' })}
            disabled={formData.isCurrentRole}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isCurrentRole"
          checked={formData.isCurrentRole}
          onChange={(e) => setFormData({ ...formData, isCurrentRole: e.target.checked, endDate: e.target.checked ? '' : formData.endDate })}
          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
        />
        <label htmlFor="isCurrentRole" className="ml-2 text-sm text-light-text dark:text-dark-text">
          I currently work here
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your responsibilities and achievements..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Education Form
export const EducationForm = ({ education, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(education || {
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    grade: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Institution *
        </label>
        <input
          type="text"
          value={formData.institution}
          onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Stanford University"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Degree *
        </label>
        <input
          type="text"
          value={formData.degree}
          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Bachelor's Degree"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Field of Study
        </label>
        <input
          type="text"
          value={formData.fieldOfStudy}
          onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Computer Science"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Start Date *
          </label>
          <input
            type="month"
            value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 7) : ''}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? `${e.target.value}-01` : '' })}
            required
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            End Date
          </label>
          <input
            type="month"
            value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 7) : ''}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? `${e.target.value}-01` : '' })}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Grade/GPA
        </label>
        <input
          type="text"
          value={formData.grade}
          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. 3.8/4.0"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Certification Form
export const CertificationForm = ({ certification, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(certification || {
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Certification Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. AWS Certified Solutions Architect"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Issuing Organization *
        </label>
        <input
          type="text"
          value={formData.issuingOrganization}
          onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. Amazon Web Services"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Issue Date *
          </label>
          <input
            type="month"
            value={formData.issueDate}
            onChange={(e) => setFormData({ ...formData, issueDate: e.target.value ? `${e.target.value}-01` : '' })}
            required
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Expiration Date
          </label>
          <input
            type="month"
            value={formData.expirationDate}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value ? `${e.target.value}-01` : '' })}
            className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Credential ID
        </label>
        <input
          type="text"
          value={formData.credentialId}
          onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. ABC123XYZ"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Credential URL
        </label>
        <input
          type="url"
          value={formData.credentialUrl}
          onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};

// Portfolio Form
export const PortfolioForm = ({ portfolio, onSave, onCancel, saving }) => {
  const [formData, setFormData] = useState(portfolio || {
    title: '',
    description: '',
    projectUrl: '',
    technologies: []
  });

  const [techInput, setTechInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Project Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="e.g. E-commerce Platform"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Describe your project..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Project URL
        </label>
        <input
          type="url"
          value={formData.projectUrl}
          onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          Technologies Used
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            className="flex-1 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g. React, Node.js"
          />
          <Button type="button" onClick={addTechnology} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {formData.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map((tech, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full text-sm"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="hover:text-primary-900 dark:hover:text-primary-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
};
