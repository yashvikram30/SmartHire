import { useState, useEffect, useRef } from 'react';
import { 
  Building2, Globe, MapPin, Users, Briefcase, 
  Edit, Upload, Check, X, Camera, AlertCircle, CheckCircle, 
  Clock, Linkedin, Twitter, ExternalLink, Save, Calendar, 
  Facebook, User, Mail, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { recruiterApi } from '@api/recruiterApi';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import Spinner from '@components/common/Spinner';
import Modal from '@components/common/Modal';
import toast from 'react-hot-toast';

// Helper function to get full image URL
// Images will be loaded through the Vite proxy to avoid CORS issues
const getImageUrl = (path) => {
  if (!path) return null;
  
  // Ensure path starts with / for proxy to work
  const imagePath = path.startsWith('/') ? path : `/${path}`;
  
  // Vite proxy will forward it to backend automatically
  return imagePath;
};

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  // Edit states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(null);
  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Industry options
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Retail',
    'Manufacturing', 'Consulting', 'Real Estate', 'Marketing', 'Other'
  ];

  // Company size options
  const companySizes = [
    '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'
  ];

  // Fetch profile on mount
  useEffect(() => {
    fetchProfile();
    fetchVerificationStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await recruiterApi.getMyProfile();
      setProfile(response.data);
      setHasProfile(true);
    } catch (err) {
      console.error('Error fetching profile:', err);
      
      if (err.response?.status === 404) {
        setHasProfile(false);
        setShowCreateModal(true);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile');
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchVerificationStatus = async () => {
    try {
      const response = await recruiterApi.getVerificationStatus();
      setVerificationStatus(response.data);
    } catch (err) {
      console.error('Error fetching verification status:', err);
    }
  };

  // Create profile
  const handleCreateProfile = async (formData) => {
    try {
      setSaving(true);
      const response = await recruiterApi.createProfile(formData);
      setProfile(response.data);
      setHasProfile(true);
      setShowCreateModal(false);
      toast.success('Profile created successfully!');
      fetchVerificationStatus();
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
      } else if (editingField === 'socialLinks') {
        updateData.socialLinks = editValue;
      } else {
        updateData[editingField] = editValue;
      }

      const response = await recruiterApi.updateProfile(updateData);
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

  // Upload logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage('logo');
      const response = await recruiterApi.uploadLogo(file);
      setProfile(prev => ({ ...prev, companyLogo: response.data.companyLogo }));
      toast.success('Logo uploaded successfully!');
    } catch (err) {
      console.error('Error uploading logo:', err);
      toast.error(err.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingImage(null);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  // Upload banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setUploadingImage('banner');
      const response = await recruiterApi.uploadBanner(file);
      setProfile(prev => ({ ...prev, companyBanner: response.data.companyBanner }));
      toast.success('Banner uploaded successfully!');
    } catch (err) {
      console.error('Error uploading banner:', err);
      toast.error(err.response?.data?.message || 'Failed to upload banner');
    } finally {
      setUploadingImage(null);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Get verification badge - properly handles all verification states
  const getVerificationBadge = () => {
    // If no verification data, show pending
    if (!verificationStatus) {
      return (
        <Badge className="bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200">
          <Clock className="w-4 h-4 mr-1" />
          Verification Pending
        </Badge>
      );
    }

    // Check if verified first
    if (verificationStatus.isVerified === true) {
      return (
        <Badge className="bg-success-100 dark:bg-success-900/20 text-success-800 dark:text-success-200">
          <CheckCircle className="w-4 h-4 mr-1" />
          Verified
        </Badge>
      );
    }

    // Check verification status field
    const status = verificationStatus.verificationStatus;
    
    if (status === 'rejected') {
      return (
        <Badge className="bg-error-100 dark:bg-error-900/20 text-error-800 dark:text-error-200">
          <X className="w-4 h-4 mr-1" />
          Verification Rejected
        </Badge>
      );
    }

    // Default to pending for 'pending' status or any other case
    return (
      <Badge className="bg-warning-100 dark:bg-warning-900/20 text-warning-800 dark:text-warning-200">
        <Clock className="w-4 h-4 mr-1" />
        Verification Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <Spinner size="lg" />
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
      {/* Banner Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary-400 to-primary-600 dark:from-primary-700 dark:to-primary-900">
        {profile?.companyBanner ? (
          <img 
            src={getImageUrl(profile.companyBanner)} 
            alt="Company Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary-400 to-primary-600">
            <p className="text-white text-lg font-medium">Company Banner</p>
          </div>
        )}
        
        {/* Banner Edit Button */}
        <div className="absolute top-4 right-4">
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            onChange={handleBannerUpload}
            className="hidden"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingImage === 'banner'}
            className="bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800"
          >
            {uploadingImage === 'banner' ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Camera className="w-4 h-4 mr-2" />
            )}
            {uploadingImage === 'banner' ? 'Uploading...' : 'Edit Banner'}
          </Button>
        </div>
      </div>

      {/* Content Container */}
      <div className="container-custom -mt-20 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Logo and Header */}
          <div className="flex flex-col md:flex-row md:items-end md:space-x-6 mb-8">
            {/* Logo */}
            <div className="relative group mb-4 md:mb-0">
              <div className="w-40 h-40 rounded-lg bg-white dark:bg-dark-bg-secondary border-4 border-white dark:border-dark-border shadow-lg overflow-hidden">
                {profile?.companyLogo ? (
                  <img 
                    src={getImageUrl(profile.companyLogo)} 
                    alt="Company Logo" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <Building2 className="w-16 h-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}
              </div>
              
              {/* Logo Edit Button */}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                onClick={() => logoInputRef.current?.click()}
                disabled={uploadingImage === 'logo'}
                className="absolute inset-0 w-40 h-40 rounded-lg bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                {uploadingImage === 'logo' ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <div className="text-white text-center">
                    <Camera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-sm font-medium">Edit Logo</span>
                  </div>
                )}
              </button>
            </div>

            {/* Company Name and Verification */}
            <div className="flex-1 bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {editingField === 'companyName' ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="text-3xl font-bold bg-transparent border-b-2 border-primary-500 focus:outline-none text-light-text dark:text-dark-text"
                        autoFocus
                      />
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">
                        {profile?.companyName || 'Company Name'}
                      </h1>
                      <button
                        onClick={() => startEdit('companyName', profile?.companyName)}
                        className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
                {getVerificationBadge()}
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  {profile?.industry || 'Industry'}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {profile?.companySize || 'Company Size'} employees
                </div>
              </div>
            </div>
          </div>

          {/* Verification Rejection Notes */}
          {verificationStatus?.verificationStatus === 'rejected' && verificationStatus.verificationNotes && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-error-900 dark:text-error-100 mb-1">
                    Verification Rejected
                  </p>
                  <p className="text-sm text-error-700 dark:text-error-300">
                    {verificationStatus.verificationNotes}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-light-text dark:text-dark-text">About</h2>
                  {editingField !== 'companyDescription' && (
                    <button
                      onClick={() => startEdit('companyDescription', profile?.companyDescription)}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {editingField === 'companyDescription' ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Tell us about your company..."
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {profile?.companyDescription || 'No description provided yet.'}
                  </p>
                )}
              </div>

              {/* Company Culture Section */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Company Culture</h2>
                  {editingField !== 'companyCulture' && (
                    <button
                      onClick={() => startEdit('companyCulture', profile?.companyCulture)}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {editingField === 'companyCulture' ? (
                  <div>
                    <textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      rows={4}
                      maxLength={1000}
                      className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Describe your company culture..."
                      autoFocus
                    />
                    <div className="flex items-center space-x-2 mt-3">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    {profile?.companyCulture || 'No company culture information provided yet.'}
                  </p>
                )}
              </div>

              {/* Company Details */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">
                  Company Details
                </h2>
                
                <div className="space-y-4">
                  {/* Industry */}
                  <DetailRow
                    label="Industry"
                    value={profile?.industry}
                    icon={<Briefcase className="w-5 h-5" />}
                    isEditing={editingField === 'industry'}
                    editValue={editValue}
                    onEdit={() => startEdit('industry', profile?.industry)}
                    onCancel={cancelEdit}
                    onSave={saveEdit}
                    onChange={setEditValue}
                    type="select"
                    options={industries}
                    saving={saving}
                  />

                  {/* Company Size */}
                  <DetailRow
                    label="Company Size"
                    value={profile?.companySize ? `${profile.companySize} employees` : null}
                    icon={<Users className="w-5 h-5" />}
                    isEditing={editingField === 'companySize'}
                    editValue={editValue}
                    onEdit={() => startEdit('companySize', profile?.companySize)}
                    onCancel={cancelEdit}
                    onSave={saveEdit}
                    onChange={setEditValue}
                    type="select"
                    options={companySizes}
                    saving={saving}
                  />

                  {/* Founded Year */}
                  <DetailRow
                    label="Founded Year"
                    value={profile?.foundedYear}
                    icon={<Calendar className="w-5 h-5" />}
                    isEditing={editingField === 'foundedYear'}
                    editValue={editValue}
                    onEdit={() => startEdit('foundedYear', profile?.foundedYear)}
                    onCancel={cancelEdit}
                    onSave={saveEdit}
                    onChange={setEditValue}
                    type="number"
                    saving={saving}
                  />

                  {/* Website */}
                  <DetailRow
                    label="Website"
                    value={profile?.website}
                    icon={<Globe className="w-5 h-5" />}
                    isEditing={editingField === 'website'}
                    editValue={editValue}
                    onEdit={() => startEdit('website', profile?.website)}
                    onCancel={cancelEdit}
                    onSave={saveEdit}
                    onChange={setEditValue}
                    type="url"
                    saving={saving}
                    isLink
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Social */}
            <div className="space-y-6">
              {/* Location */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Location</h2>
                  {editingField !== 'location' && (
                    <button
                      onClick={() => startEdit('location', profile?.location || {})}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {editingField === 'location' ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={editValue.city || ''}
                      onChange={(e) => setEditValue({ ...editValue, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editValue.state || ''}
                      onChange={(e) => setEditValue({ ...editValue, state: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={editValue.country || ''}
                      onChange={(e) => setEditValue({ ...editValue, country: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Zip Code"
                      value={editValue.zipCode || ''}
                      onChange={(e) => setEditValue({ ...editValue, zipCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Full Address"
                      maxLength={300}
                      value={editValue.address || ''}
                      onChange={(e) => setEditValue({ ...editValue, address: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {profile?.location?.city && (
                      <div className="flex items-start space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                          {[profile.location.city, profile.location.state, profile.location.country]
                            .filter(Boolean)
                            .join(', ')}
                          {profile.location.zipCode && ` ${profile.location.zipCode}`}
                        </p>
                      </div>
                    )}
                    {profile?.location?.address && (
                      <div className="flex items-start space-x-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{profile.location.address}</p>
                      </div>
                    )}
                    {!profile?.location?.city && !profile?.location?.address && (
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        No location added
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Contact Person */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Contact Person</h2>
                  {editingField !== 'contactPerson' && (
                    <button
                      onClick={() => startEdit('contactPerson', profile?.contactPerson || {})}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {editingField === 'contactPerson' ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={editValue.firstName || ''}
                      onChange={(e) => setEditValue({ ...editValue, firstName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={editValue.lastName || ''}
                      onChange={(e) => setEditValue({ ...editValue, lastName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Designation"
                      value={editValue.designation || ''}
                      onChange={(e) => setEditValue({ ...editValue, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={editValue.email || ''}
                      onChange={(e) => setEditValue({ ...editValue, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={editValue.phone || ''}
                      onChange={(e) => setEditValue({ ...editValue, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                    />
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.contactPerson?.firstName && (
                      <div className="flex items-start space-x-2 text-sm">
                        <User className="w-4 h-4 mt-0.5 text-gray-400" />
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">
                          {[profile.contactPerson.firstName, profile.contactPerson.lastName].filter(Boolean).join(' ')}
                          {profile.contactPerson.designation && ` - ${profile.contactPerson.designation}`}
                        </p>
                      </div>
                    )}
                    {profile?.contactPerson?.email && (
                      <div className="flex items-start space-x-2 text-sm">
                        <Mail className="w-4 h-4 mt-0.5 text-gray-400" />
                        <a href={`mailto:${profile.contactPerson.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {profile.contactPerson.email}
                        </a>
                      </div>
                    )}
                    {profile?.contactPerson?.phone && (
                      <div className="flex items-start space-x-2 text-sm">
                        <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                        <a href={`tel:${profile.contactPerson.phone}`} className="text-primary-600 dark:text-primary-400 hover:underline">
                          {profile.contactPerson.phone}
                        </a>
                      </div>
                    )}
                    {!profile?.contactPerson?.firstName && !profile?.contactPerson?.email && !profile?.contactPerson?.phone && (
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        No contact person added
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-dark-bg-secondary rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-light-text dark:text-dark-text">Social Links</h2>
                  {editingField !== 'socialLinks' && (
                    <button
                      onClick={() => startEdit('socialLinks', profile?.socialLinks || {})}
                      className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {editingField === 'socialLinks' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/company/..."
                        value={editValue.linkedin || ''}
                        onChange={(e) => setEditValue({ ...editValue, linkedin: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                        Twitter
                      </label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/..."
                        value={editValue.twitter || ''}
                        onChange={(e) => setEditValue({ ...editValue, twitter: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-light-text-secondary dark:text-dark-text-secondary mb-1 block">
                        Facebook
                      </label>
                      <input
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={editValue.facebook || ''}
                        onChange={(e) => setEditValue({ ...editValue, facebook: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" onClick={saveEdit} disabled={saving}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile?.socialLinks?.linkedin && (
                      <a
                        href={profile.socialLinks.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <Linkedin className="w-5 h-5" />
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile?.socialLinks?.twitter && (
                      <a
                        href={profile.socialLinks.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <Twitter className="w-5 h-5" />
                        <span>Twitter</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {profile?.socialLinks?.facebook && (
                      <a
                        href={profile.socialLinks.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <Facebook className="w-5 h-5" />
                        <span>Facebook</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {!profile?.socialLinks?.linkedin && !profile?.socialLinks?.twitter && !profile?.socialLinks?.facebook && (
                      <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        No social links added
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Profile Modal */}
      <CreateProfileModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateProfile}
        saving={saving}
        industries={industries}
        companySizes={companySizes}
      />
    </div>
  );
};

// Detail Row Component
const DetailRow = ({ 
  label, value, icon, isEditing, editValue, onEdit, onCancel, onSave, 
  onChange, type = 'text', options = [], saving, isLink 
}) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-light-border dark:border-dark-border last:border-0">
      <div className="flex items-center space-x-3 flex-1">
        <div className="text-gray-400 dark:text-gray-600">{icon}</div>
        <div className="flex-1">
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mb-1">
            {label}
          </p>
          {isEditing ? (
            <div className="flex items-center space-x-2">
              {type === 'select' ? (
                <select
                  value={editValue}
                  onChange={(e) => onChange(e.target.value)}
                  className="px-3 py-1 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                  autoFocus
                >
                  <option value="">Select {label}</option>
                  {options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={editValue}
                  onChange={(e) => onChange(e.target.value)}
                  className="px-3 py-1 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text text-sm"
                  autoFocus
                />
              )}
              <Button size="sm" onClick={onSave} disabled={saving}>
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <p className="text-sm font-medium text-light-text dark:text-dark-text">
              {isLink && value ? (
                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
                  {value}
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              ) : (
                value || <span className="text-gray-400">Not provided</span>
              )}
            </p>
          )}
        </div>
      </div>
      {!isEditing && (
        <button
          onClick={onEdit}
          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors ml-2"
        >
          <Edit className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// Create Profile Modal Component
const CreateProfileModal = ({ isOpen, onClose, onCreate, saving, industries, companySizes }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    companyDescription: '',
    companyCulture: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    location: {
      city: '',
      state: '',
      country: '',
      zipCode: '',
      address: ''
    },
    contactPerson: {
      firstName: '',
      lastName: '',
      designation: '',
      email: '',
      phone: ''
    },
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  const updateLocation = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: { ...prev.location, [field]: value }
    }));
  };

  const updateSocialLinks = (field, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [field]: value }
    }));
  };

  const updateContactPerson = (field, value) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: { ...prev.contactPerson, [field]: value }
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Company Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Company Name <span className="text-error-600">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            placeholder="Tech Corp"
          />

        </div>

        {/* Company Description */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Company Description <span className="text-error-600">*</span>
          </label>
          <textarea
            required
            rows={4}
            maxLength={2000}
            value={formData.companyDescription}
            onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            placeholder="Tell us about your company..."
          />
        </div>

        {/* Company Culture */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Company Culture
          </label>
          <textarea
            rows={3}
            maxLength={1000}
            value={formData.companyCulture}
            onChange={(e) => setFormData({ ...formData, companyCulture: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            placeholder="Describe your company culture..."
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Industry <span className="text-error-600">*</span>
          </label>
          <select
            required
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
          >
            <option value="">Select Industry</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Company Size
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
          >
            <option value="">Select Company Size</option>
            {companySizes.map(size => (
              <option key={size} value={size}>{size} employees</option>
            ))}
          </select>
        </div>

        {/* Founded Year */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Founded Year
          </label>
          <input
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={formData.foundedYear}
            onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            placeholder="2015"
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            placeholder="https://yourcompany.com"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={formData.location.city}
              onChange={(e) => updateLocation('city', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="text"
              placeholder="State"
              value={formData.location.state}
              onChange={(e) => updateLocation('state', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.location.country}
              onChange={(e) => updateLocation('country', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={formData.location.zipCode}
              onChange={(e) => updateLocation('zipCode', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
          </div>
          <input
            type="text"
            maxLength={300}
            placeholder="Full Address"
            value={formData.location.address}
            onChange={(e) => updateLocation('address', e.target.value)}
            className="w-full mt-3 px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
          />
        </div>

        {/* Contact Person */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Contact Person
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="First Name"
              value={formData.contactPerson.firstName}
              onChange={(e) => updateContactPerson('firstName', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={formData.contactPerson.lastName}
              onChange={(e) => updateContactPerson('lastName', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="text"
              placeholder="Designation"
              value={formData.contactPerson.designation}
              onChange={(e) => updateContactPerson('designation', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.contactPerson.email}
              onChange={(e) => updateContactPerson('email', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.contactPerson.phone}
              onChange={(e) => updateContactPerson('phone', e.target.value)}
              className="px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text col-span-2"
            />
          </div>
        </div>

        {/* Social Links */}
        <div>
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-2">
            Social Links
          </label>
          <div className="space-y-3">
            <input
              type="url"
              placeholder="LinkedIn URL"
              value={formData.socialLinks.linkedin}
              onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="url"
              placeholder="Twitter URL"
              value={formData.socialLinks.twitter}
              onChange={(e) => updateSocialLinks('twitter', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
            <input
              type="url"
              placeholder="Facebook URL"
              value={formData.socialLinks.facebook}
              onChange={(e) => updateSocialLinks('facebook', e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-text dark:text-dark-text"
            />
          </div>
        </div>


        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Profile'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecruiterProfile;
