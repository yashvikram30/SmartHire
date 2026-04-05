import { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, Phone, Mail, Briefcase, GraduationCap, 
  Award, FolderOpen, FileText, Video, Edit, Save, X, 
  Check, Plus, Trash2, ExternalLink, Camera, AlertCircle,
  Linkedin, Github, Globe, Calendar, Building2, Upload,
  Download, Eye, CheckCircle, Clock, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { jobSeekerApi } from '@api/jobSeekerApi';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import CreateProfileModal from '@components/jobseeker/CreateProfileModal';
import SkillSearchFilter from '@components/jobs/SkillSearchFilter';
import { WorkExperienceForm, EducationForm, CertificationForm, PortfolioForm, SkillsManager } from '@components/jobseeker/ProfileForms';
import toast from 'react-hot-toast';

// Helper function to get full file URL
const getFileUrl = (path) => {
  if (!path) return null;
  const filePath = path.startsWith('/') ? path : `/${path}`;
  return filePath;
};

const JobSeekerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Edit states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showSocialLinksModal, setShowSocialLinksModal] = useState(false);
  const [showWorkExpModal, setShowWorkExpModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  
  // File upload states
  const [uploadingFile, setUploadingFile] = useState(null);
  const resumeInputRef = useRef(null);
  const videoResumeInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jobSeekerApi.getMyProfile();
      setProfile(response.data);
      setHasProfile(true);
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      if (err.response?.status === 404) {
        setHasProfile(false);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile');
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create profile
  const handleCreateProfile = async (formData) => {
    try {
      setSaving(true);
      const response = await jobSeekerApi.createProfile(formData);
      setProfile(response.data);
      setHasProfile(true);
      setShowCreateModal(false);
      toast.success('Profile created successfully!');
      fetchProfile();
    } catch (err) {
      console.error('Error creating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setSaving(false);
    }
  };

  // Start editing field
  const startEdit = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || '');
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Save field edit
  const saveEdit = async () => {
    try {
      setSaving(true);
      
      let updateData = {};
      
      if (editingField === 'location') {
        updateData.location = editValue;
      } else if (editingField === 'name') {
        updateData.firstName = editValue.firstName;
        updateData.lastName = editValue.lastName;
      } else {
        updateData[editingField] = editValue;
      }

      const response = await jobSeekerApi.updateProfile(updateData);
      setProfile(response.data);
      setEditingField(null);
      setEditValue('');
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Update skills
  const handleUpdateSkills = async (skills) => {
    try {
      setSaving(true);
      const response = await jobSeekerApi.updateProfile({ 
        skills: skills.map(s => s._id) 
      });
      // Fetch full profile to get populated skill objects
      fetchProfile();
      setShowSkillsModal(false);
      toast.success('Skills updated successfully!');
    } catch (err) {
      console.error('Error updating skills:', err);
      toast.error(err.response?.data?.message || 'Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  // Update social links
  const handleUpdateSocialLinks = async (socialLinks) => {
    try {
      setSaving(true);
      const response = await jobSeekerApi.updateProfile({ socialLinks });
      setProfile(response.data);
      setShowSocialLinksModal(false);
      toast.success('Social links updated successfully!');
    } catch (err) {
      console.error('Error updating social links:', err);
      toast.error(err.response?.data?.message || 'Failed to update social links');
    } finally {
      setSaving(false);
    }
  };

  // Add Work Experience
  const handleAddWorkExperience = async (experience) => {
    try {
      setSaving(true);
      const updatedExperience = [...(profile.workExperience || []), experience];
      const response = await jobSeekerApi.updateProfile({ workExperience: updatedExperience });
      setProfile(response.data);
      setShowWorkExpModal(false);
      toast.success('Work experience added successfully!');
    } catch (err) {
      console.error('Error adding work experience:', err);
      toast.error(err.response?.data?.message || 'Failed to add work experience');
    } finally {
      setSaving(false);
    }
  };

  // Add Education
  const handleAddEducation = async (education) => {
    try {
      setSaving(true);
      const updatedEducation = [...(profile.education || []), education];
      const response = await jobSeekerApi.updateProfile({ education: updatedEducation });
      setProfile(response.data);
      setShowEducationModal(false);
      toast.success('Education added successfully!');
    } catch (err) {
      console.error('Error adding education:', err);
      toast.error(err.response?.data?.message || 'Failed to add education');
    } finally {
      setSaving(false);
    }
  };

  // Add Certification
  const handleAddCertification = async (certification) => {
    try {
      setSaving(true);
      const updatedCertifications = [...(profile.certifications || []), certification];
      const response = await jobSeekerApi.updateProfile({ certifications: updatedCertifications });
      setProfile(response.data);
      setShowCertificationModal(false);
      toast.success('Certification added successfully!');
    } catch (err) {
      console.error('Error adding certification:', err);
      toast.error(err.response?.data?.message || 'Failed to add certification');
    } finally {
      setSaving(false);
    }
  };

  // Add Portfolio Item
  const handleAddPortfolio = async (item) => {
    try {
      setSaving(true);
      // Use specific endpoint for portfolio
      const response = await jobSeekerApi.addPortfolioItem(item);
      // The response.data should contain the new item. We might need to refresh profile or append it.
      // Based on API docs, response.data has the item. 
      // But verify if response.data is the item or the wrapping object.
      // Docs say: data: { _id, title... }. 
      // safer to fetch profile again or append if we trust the return.
      // Let's refetch profile to be safe and consistent with other complex updates
      fetchProfile();
      
      setShowPortfolioModal(false);
      toast.success('Portfolio item added successfully!');
    } catch (err) {
      console.error('Error adding portfolio item:', err);
      toast.error(err.response?.data?.message || 'Failed to add portfolio item');
    } finally {
      setSaving(false);
    }
  };

  // Delete Portfolio Item
  const handleDeletePortfolio = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      setSaving(true);
      await jobSeekerApi.deletePortfolioItem(itemId);
      fetchProfile();
      toast.success('Portfolio item deleted successfully!');
    } catch (err) {
      console.error('Error deleting portfolio item:', err);
      toast.error(err.response?.data?.message || 'Failed to delete portfolio item');
    } finally {
      setSaving(false);
    }
  };

  // Delete Work Experience
  const handleDeleteWorkExperience = async (index) => {
    if (!window.confirm('Are you sure you want to delete this experience?')) return;
    try {
      setSaving(true);
      const updatedExperience = [...profile.workExperience];
      updatedExperience.splice(index, 1);
      const response = await jobSeekerApi.updateProfile({ workExperience: updatedExperience });
      setProfile(response.data);
      toast.success('Work experience deleted successfully!');
    } catch (err) {
      console.error('Error deleting work experience:', err);
      toast.error(err.response?.data?.message || 'Failed to delete work experience');
    } finally {
      setSaving(false);
    }
  };

  // Delete Education
  const handleDeleteEducation = async (index) => {
    if (!window.confirm('Are you sure you want to delete this education?')) return;
    try {
      setSaving(true);
      const updatedEducation = [...profile.education];
      updatedEducation.splice(index, 1);
      const response = await jobSeekerApi.updateProfile({ education: updatedEducation });
      setProfile(response.data);
      toast.success('Education deleted successfully!');
    } catch (err) {
      console.error('Error deleting education:', err);
      toast.error(err.response?.data?.message || 'Failed to delete education');
    } finally {
      setSaving(false);
    }
  };

  // Delete Certification
  const handleDeleteCertification = async (index) => {
    if (!window.confirm('Are you sure you want to delete this certification?')) return;
    try {
      setSaving(true);
      const updatedCertifications = [...profile.certifications];
      updatedCertifications.splice(index, 1);
      const response = await jobSeekerApi.updateProfile({ certifications: updatedCertifications });
      setProfile(response.data);
      toast.success('Certification deleted successfully!');
    } catch (err) {
      console.error('Error deleting certification:', err);
      toast.error(err.response?.data?.message || 'Failed to delete certification');
    } finally {
      setSaving(false);
    }
  };

  // Upload resume
  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume size should be less than 5MB');
      return;
    }

    try {
      setUploadingFile('resume');
      const response = await jobSeekerApi.uploadResume(file);
      setProfile(prev => ({ ...prev, resume: response.data }));
      toast.success('Resume uploaded successfully!');
    } catch (err) {
      console.error('Error uploading resume:', err);
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploadingFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = '';
    }
  };

  const handleResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      setUploadingFile('resume');
      await jobSeekerApi.deleteResume();
      setProfile(prev => ({ ...prev, resume: null }));
      toast.success('Resume deleted successfully!');
    } catch (err) {
      console.error('Error deleting resume:', err);
      toast.error(err.response?.data?.message || 'Failed to delete resume');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleVideoResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an MP4, AVI, or MOV file');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video size should be less than 50MB');
      return;
    }

    try {
      setUploadingFile('video');
      const response = await jobSeekerApi.uploadVideoResume(file);
      setProfile(prev => ({ ...prev, videoResume: response.data }));
      toast.success('Video resume uploaded successfully!');
    } catch (err) {
      console.error('Error uploading video resume:', err);
      toast.error(err.response?.data?.message || 'Failed to upload video resume');
    } finally {
      setUploadingFile(null);
      if (videoResumeInputRef.current) videoResumeInputRef.current.value = '';
    }
  };

  const handleVideoResumeDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your video resume?')) return;

    try {
      setUploadingFile('video');
      await jobSeekerApi.deleteVideoResume();
      setProfile(prev => ({ ...prev, videoResume: null }));
      toast.success('Video resume deleted successfully!');
    } catch (err) {
      console.error('Error deleting video resume:', err);
      toast.error(err.response?.data?.message || 'Failed to delete video resume');
    } finally {
      setUploadingFile(null);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      setUploadingFile('profilePicture');
      const response = await jobSeekerApi.uploadProfilePicture(file);
      setProfile(prev => ({ ...prev, profilePicture: response.data.profilePicture }));
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      toast.error(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingFile(null);
      if (profilePictureInputRef.current) profilePictureInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasProfile && !error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-lg p-8 text-center shadow-lg"
        >
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-2">
            Welcome to SmartHire!
          </h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
            Create your professional profile to start applying for jobs and get discovered by recruiters.
          </p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            size="lg"
            className="w-full"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Profile
          </Button>
        </motion.div>

        <CreateProfileModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProfile}
          saving={saving}
        />
      </div>
    );
  }

  if (error && !hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-dark-bg-secondary rounded-lg p-8 text-center">
          <AlertCircle className="w-12 h-12 text-error-600 dark:text-error-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-2">Error Loading Profile</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">{error}</p>
          <Button onClick={fetchProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg pb-12">
      <div className="container-custom py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header Card */}
          <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative group flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-dark-border shadow-lg overflow-hidden">
                  {profile?.profilePicture ? (
                    <img 
                      src={getFileUrl(profile.profilePicture)} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/20">
                      <User className="w-16 h-16 text-primary-600 dark:text-primary-400" />
                    </div>
                  )}
                </div>
                
                <input
                  ref={profilePictureInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                />
                <button
                  onClick={() => profilePictureInputRef.current?.click()}
                  disabled={uploadingFile === 'profilePicture'}
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 text-white flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingFile === 'profilePicture' ? (
                    <Spinner size="sm" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Name and Info */}
              <div className="flex-1">
                {/* Name */}
                {editingField === 'name' ? (
                  <div className="mb-4">
                    <div className="flex gap-3 mb-2">
                      <input
                        type="text"
                        value={editValue.firstName || ''}
                        onChange={(e) => setEditValue({ ...editValue, firstName: e.target.value })}
                        placeholder="First Name"
                        className="flex-1 px-3 py-2 text-xl font-bold bg-white dark:bg-dark-bg border-2 border-primary-500 rounded-lg focus:outline-none text-light-text dark:text-dark-text"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={editValue.lastName || ''}
                        onChange={(e) => setEditValue({ ...editValue, lastName: e.target.value })}
                        placeholder="Last Name"
                        className="flex-1 px-3 py-2 text-xl font-bold bg-white dark:bg-dark-bg border-2 border-primary-500 rounded-lg focus:outline-none text-light-text dark:text-dark-text"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Check className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <button
                      onClick={() => startEdit('name', { firstName: profile?.firstName, lastName: profile?.lastName })}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* Headline */}
                {editingField === 'headline' ? (
                  <div className="mb-4">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      maxLength={120}
                      className="w-full px-3 py-2 rounded-lg border-2 border-primary-500 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
                      placeholder="Your professional headline..."
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} disabled={saving}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                      <span className="text-xs text-gray-400">{editValue?.length || 0}/120</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mb-4">
                    <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
                      {profile?.headline || 'Add your professional headline'}
                    </p>
                    <button
                      onClick={() => startEdit('headline', profile?.headline)}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  {profile?.location?.city && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[profile.location.city, profile.location.state, profile.location.country]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  )}
                  {profile?.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* Profile Completeness */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
                        Profile Completeness
                      </span>
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                        {profile?.profileCompleteness || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 transition-all duration-300 rounded-full"
                        style={{ width: `${profile?.profileCompleteness || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <SectionCard
                title="About"
                icon={<User className="w-5 h-5" />}
                onEdit={() => startEdit('summary', profile?.summary)}
                isEditing={editingField === 'summary'}
              >
                {editingField === 'summary' ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={6}
                      maxLength={2000}
                      className="w-full px-4 py-3 rounded-lg border-2 border-primary-500 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:outline-none"
                      placeholder="Tell us about yourself..."
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveEdit} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </div>
                      <span className="text-xs text-gray-400">{editValue?.length || 0}/2000</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed whitespace-pre-wrap">
                    {profile?.summary || 'No summary provided yet. Click edit to add your professional summary.'}
                  </p>
                )}
              </SectionCard>

              {/* Work Experience */}
              <SectionCard
                title="Work Experience"
                icon={<Briefcase className="w-5 h-5" />}
                onAdd={() => setShowWorkExpModal(true)}
              >
                {profile?.workExperience?.length > 0 ? (
                  <div className="space-y-4">
                    {profile.workExperience.map((exp, index) => (
                      <div key={index} className="border-l-2 border-primary-500 pl-4 group relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-light-text dark:text-dark-text">{exp.title}</h4>
                            <p className="text-sm text-primary-600 dark:text-primary-400">{exp.company}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteWorkExperience(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-error-600 rounded-full hover:bg-error-50 dark:hover:bg-error-900/20 transition-all"
                            title="Delete experience"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                          {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrentRole ? 'Present' : new Date(exp.endDate).toLocaleDateString()}
                        </p>
                        {exp.description && (
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-2">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Briefcase className="w-12 h-12" />}
                    message="No work experience added yet"
                    actionLabel="Add Experience"
                    onAction={() => setShowWorkExpModal(true)}
                  />
                )}
              </SectionCard>

              {/* Education */}
              <SectionCard
                title="Education"
                icon={<GraduationCap className="w-5 h-5" />}
                onAdd={() => setShowEducationModal(true)}
              >
                {profile?.education?.length > 0 ? (
                  <div className="space-y-4">
                    {profile.education.map((edu, index) => (
                      <div key={index} className="border-l-2 border-primary-500 pl-4 group relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-light-text dark:text-dark-text">{edu.degree}</h4>
                            <p className="text-sm text-primary-600 dark:text-primary-400">{edu.institution}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteEducation(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-error-600 rounded-full hover:bg-error-50 dark:hover:bg-error-900/20 transition-all"
                            title="Delete education"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                          {edu.fieldOfStudy && `${edu.fieldOfStudy} • `}
                          {new Date(edu.startDate).getFullYear()} - {edu.endDate ? new Date(edu.endDate).getFullYear() : 'Present'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<GraduationCap className="w-12 h-12" />}
                    message="No education added yet"
                    actionLabel="Add Education"
                    onAction={() => setShowEducationModal(true)}
                  />
                )}
              </SectionCard>

              {/* Skills */}
              <SectionCard
                title="Skills"
                icon={<Award className="w-5 h-5" />}
                onAdd={() => setShowSkillsModal(true)}
              >
                {profile?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => {
                      const skillName = typeof skill === 'string' ? 'Loading...' : (skill.name || skill.displayName || 'Unknown Skill');
                      const skillId = typeof skill === 'string' ? index : (skill._id || index);
                      
                      return (
                        <span 
                          key={skillId} 
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 transition-colors"
                        >
                          {skillName}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Award className="w-12 h-12" />}
                    message="No skills added yet"
                    actionLabel="Add Skills"
                    onAction={() => setShowSkillsModal(true)}
                  />
                )}
              </SectionCard>

              {/* Certifications */}
              <SectionCard
                title="Certifications"
                icon={<Award className="w-5 h-5" />}
                onAdd={() => setShowCertificationModal(true)}
              >
                {profile?.certifications?.length > 0 ? (
                  <div className="space-y-3">
                    {profile.certifications.map((cert, index) => (
                      <div key={index} className="border-l-2 border-primary-500 pl-4 group relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-light-text dark:text-dark-text">{cert.name}</h4>
                            <p className="text-sm text-primary-600 dark:text-primary-400">{cert.issuingOrganization}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCertification(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-error-600 rounded-full hover:bg-error-50 dark:hover:bg-error-900/20 transition-all"
                            title="Delete certification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                          Issued {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Award className="w-12 h-12" />}
                    message="No certifications added yet"
                    actionLabel="Add Certification"
                    onAction={() => setShowCertificationModal(true)}
                  />
                )}
              </SectionCard>

              {/* Portfolio */}
              <SectionCard
                title="Portfolio"
                icon={<FolderOpen className="w-5 h-5" />}
                onAdd={() => setShowPortfolioModal(true)}
              >
                {profile?.portfolio?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolio.map((item, index) => (
                      <div key={item._id || index} className="relative border border-light-border dark:border-dark-border rounded-lg p-4 hover:shadow-md transition-shadow group">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeletePortfolio(item._id);
                            }}
                            className="p-1 text-gray-400 hover:text-error-600 rounded-full hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
                            title="Delete project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-semibold text-light-text dark:text-dark-text mb-2 pr-8">{item.title}</h4>
                        {item.description && (
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-2 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                        {item.projectUrl && (
                          <a 
                            href={item.projectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 w-fit"
                          >
                            View Project <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FolderOpen className="w-12 h-12" />}
                    message="No portfolio items added yet"
                    actionLabel="Add Portfolio Item"
                    onAction={() => setShowPortfolioModal(true)}
                  />
                )}
              </SectionCard>
            </div>

            {/* Right Column - Resume, Video, Social */}
            <div className="space-y-6">
              {/* Resume */}
              <SectionCard
                title="Resume"
                icon={<FileText className="w-5 h-5" />}
              >
                {profile?.resume?.fileUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-dark-bg-tertiary rounded-lg">
                      <p className="text-sm font-medium text-light-text dark:text-dark-text truncate mb-1">
                        {profile.resume.fileName}
                      </p>
                      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Uploaded {new Date(profile.resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={getFileUrl(profile.resume.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </a>
                      <a
                        href={getFileUrl(profile.resume.fileUrl)}
                        download
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResumeDelete}
                      disabled={uploadingFile === 'resume'}
                      className="w-full text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingFile === 'resume'}
                      className="w-full"
                    >
                      {uploadingFile === 'resume' ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                      PDF, DOC, DOCX (Max 5MB)
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* Video Resume */}
              <SectionCard
                title="Video Resume"
                icon={<Video className="w-5 h-5" />}
              >
                {profile?.videoResume?.fileUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        src={getFileUrl(profile.videoResume.fileUrl)}
                        controls
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                      Uploaded {new Date(profile.videoResume.uploadedAt).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVideoResumeDelete}
                      disabled={uploadingFile === 'video'}
                      className="w-full text-error-600 hover:text-error-700 hover:bg-error-50 dark:hover:bg-error-900/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Video
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      ref={videoResumeInputRef}
                      type="file"
                      accept="video/mp4,video/avi,video/quicktime"
                      onChange={handleVideoResumeUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => videoResumeInputRef.current?.click()}
                      disabled={uploadingFile === 'video'}
                      className="w-full"
                    >
                      {uploadingFile === 'video' ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Video
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 text-center">
                      MP4, AVI, MOV (Max 50MB)
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* Social Links */}
              <SectionCard
                title="Social Links"
                icon={<Globe className="w-5 h-5" />}
                onEdit={() => setShowSocialLinksModal(true)}
              >
                {profile?.socialLinks && (Object.values(profile.socialLinks).some(link => link)) ? (
                  <div className="space-y-2">
                    {profile.socialLinks.linkedin && (
                      <a 
                        href={profile.socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a 
                        href={profile.socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Github className="w-4 h-4" />
                        GitHub
                      </a>
                    )}
                    {profile.socialLinks.portfolio && (
                      <a 
                        href={profile.socialLinks.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700"
                      >
                        <Globe className="w-4 h-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Globe className="w-12 h-12" />}
                    message="No social links added"
                    actionLabel="Add Links"
                    onAction={() => setShowSocialLinksModal(true)}
                    compact
                  />
                )}
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Modal */}
      {/* Skills Modal */}
      <Modal
        isOpen={showSkillsModal}
        onClose={() => setShowSkillsModal(false)}
        title="Manage Skills"
      >
        <div className="p-6">
          <SkillsManager
            initialSkills={profile?.skills}
            onSave={handleUpdateSkills}
            onCancel={() => setShowSkillsModal(false)}
            saving={saving}
          />
        </div>
      </Modal>

      {/* Social Links Modal */}
      <Modal
        isOpen={showSocialLinksModal}
        onClose={() => setShowSocialLinksModal(false)}
        title="Social Links"
      >
        <div className="p-6">
          <SocialLinksForm
            socialLinks={profile?.socialLinks || {}}
            onSave={handleUpdateSocialLinks}
            onCancel={() => setShowSocialLinksModal(false)}
            saving={saving}
          />
        </div>
      </Modal>

      {/* Work Experience Modal */}
      <Modal
        isOpen={showWorkExpModal}
        onClose={() => setShowWorkExpModal(false)}
        title="Add Work Experience"
      >
        <div className="p-6">
          <WorkExperienceForm
            onSave={handleAddWorkExperience}
            onCancel={() => setShowWorkExpModal(false)}
            saving={saving}
          />
        </div>
      </Modal>

      {/* Education Modal */}
      <Modal
        isOpen={showEducationModal}
        onClose={() => setShowEducationModal(false)}
        title="Add Education"
      >
        <div className="p-6">
          <EducationForm
            onSave={handleAddEducation}
            onCancel={() => setShowEducationModal(false)}
            saving={saving}
          />
        </div>
      </Modal>

      {/* Certification Modal */}
      <Modal
        isOpen={showCertificationModal}
        onClose={() => setShowCertificationModal(false)}
        title="Add Certification"
      >
        <div className="p-6">
          <CertificationForm
            onSave={handleAddCertification}
            onCancel={() => setShowCertificationModal(false)}
            saving={saving}
          />
        </div>
      </Modal>

      {/* Portfolio Modal */}
      <Modal
        isOpen={showPortfolioModal}
        onClose={() => setShowPortfolioModal(false)}
        title="Add Portfolio Item"
      >
        <div className="p-6">
          <PortfolioForm
            onSave={handleAddPortfolio}
            onCancel={() => setShowPortfolioModal(false)}
            saving={saving}
          />
        </div>
      </Modal>
    </div>
  );
};

// Section Card Component
const SectionCard = ({ title, icon, children, onEdit, isEditing, onAdd }) => {
  return (
    <div className="bg-white dark:bg-dark-bg-secondary rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {onAdd && (
            <button
              onClick={onAdd}
              className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title={`Add to ${title}`}
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
          {onEdit && !isEditing && (
            <button
              onClick={onEdit}
              className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title={`Edit ${title}`}
            >
              <Edit2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon, message, actionLabel, onAction, compact = false }) => {
  return (
    <div className={`text-center ${compact ? 'py-4' : 'py-8'}`}>
      <div className="text-gray-300 dark:text-gray-600 mx-auto mb-3 flex justify-center">
        {icon}
      </div>
      <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4 text-sm">
        {message}
      </p>
      {actionLabel && (
        <Button size="sm" onClick={onAction}>
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Social Links Form Component
const SocialLinksForm = ({ socialLinks, onSave, onCancel, saving }) => {
  const [links, setLinks] = useState(socialLinks);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          <Linkedin className="w-4 h-4 inline mr-2" />
          LinkedIn
        </label>
        <input
          type="url"
          value={links.linkedin || ''}
          onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          <Github className="w-4 h-4 inline mr-2" />
          GitHub
        </label>
        <input
          type="url"
          value={links.github || ''}
          onChange={(e) => setLinks({ ...links, github: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://github.com/yourusername"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Portfolio Website
        </label>
        <input
          type="url"
          value={links.portfolio || ''}
          onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="https://yourportfolio.com"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onSave(links)} disabled={saving} className="flex-1">
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default JobSeekerProfile;