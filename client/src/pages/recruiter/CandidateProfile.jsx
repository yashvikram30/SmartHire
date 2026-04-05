import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Briefcase, Mail, Phone, Calendar, Download, Building, GraduationCap, ExternalLink, Linkedin, Github, Globe } from 'lucide-react';
import { recruiterApi } from '@api/recruiterApi';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';
import toast from 'react-hot-toast';

const CandidateProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await recruiterApi.viewJobSeekerProfile(id);
        setCandidate(response.data || response); // Handle potential response structures
      } catch (error) {
        console.error('Error fetching candidate profile:', error);
        toast.error('Failed to load candidate profile');
        navigate('/recruiter/candidates');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!candidate) return null;

  const { firstName, lastName, email, phoneNumber, photo, profile } = candidate;
  const { title, bio, location, skills = [], experience = [], education = [], resume, socialLinks } = profile || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 transition-colors duration-300">
      <div className="container-custom">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/recruiter/candidates')}
          className="flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Search
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-sm border border-light-border dark:border-dark-border">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {photo ? (
                    <img 
                      src={photo} 
                      alt={`${firstName} ${lastName}`} 
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-50 dark:border-dark-bg shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-3xl font-bold text-primary-600 dark:text-primary-400 border-4 border-gray-50 dark:border-dark-bg">
                      {firstName?.[0]}{lastName?.[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-xl text-primary-600 dark:text-primary-400 font-medium mb-3">
                    {title || 'Open to Work'}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-light-text-secondary dark:text-dark-text-secondary">
                    {location && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        {location}
                      </div>
                    )}
                    {email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1.5" />
                        {email}
                      </div>
                    )}
                    {phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-1.5" />
                        {phoneNumber}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-8 pt-8 border-t border-light-border dark:border-dark-border">
                <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">About</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {bio || 'No bio provided.'}
                </p>
              </div>
            </div>

            {/* Experience */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-sm border border-light-border dark:border-dark-border">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                Experience
              </h2>
              
              <div className="space-y-8">
                {experience.length > 0 ? (
                  experience.map((exp, index) => (
                    <div key={index} className="relative pl-8 border-l-2 border-gray-100 dark:border-dark-bg-tertiary">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-100 dark:bg-primary-900 border-2 border-white dark:border-dark-bg-secondary"></div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                        <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">
                          {exp.title}
                        </h3>
                        <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary whitespace-nowrap">
                          {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - 
                          {exp.current ? ' Present' : ` ${new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}`}
                        </span>
                      </div>
                      <div className="text-primary-600 dark:text-primary-400 font-medium mb-2 flex items-center">
                        <Building className="w-4 h-4 mr-1.5" />
                        {exp.company}
                      </div>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {exp.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary italic">No experience listed.</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-8 shadow-sm border border-light-border dark:border-dark-border">
              <h2 className="text-xl font-bold text-light-text dark:text-dark-text mb-6 flex items-center">
                <GraduationCap className="w-5 h-5 mr-2 text-primary-600" />
                Education
              </h2>
              
              <div className="space-y-6">
                {education.length > 0 ? (
                  education.map((edu, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-dark-bg-tertiary flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-light-text dark:text-dark-text">{edu.school}</h3>
                        <p className="text-light-text-secondary dark:text-dark-text-secondary">{edu.degree} in {edu.fieldOfStudy}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {new Date(edu.startDate).getFullYear()} - {edu.current ? 'Present' : new Date(edu.endDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary italic">No education listed.</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Actions */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-light-border dark:border-dark-border sticky top-24">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Contact</h3>
              <Button className="w-full mb-3">
                <Mail className="w-4 h-4 mr-2" />
                Message Candidate
              </Button>
              {resume && (
                <a 
                  href={resume} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Resume
                  </Button>
                </a>
              )}
            </div>

            {/* Skills */}
            <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-light-border dark:border-dark-border">
              <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Skills</h3>
              {skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                       {typeof skill === 'string' ? skill : skill.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-light-text-secondary dark:text-dark-text-secondary italic">No skills listed.</p>
              )}
            </div>

            {/* Social Links */}
            {(socialLinks?.linkedin || socialLinks?.github || socialLinks?.portfolio) && (
              <div className="bg-white dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-sm border border-light-border dark:border-dark-border">
                <h3 className="font-semibold text-light-text dark:text-dark-text mb-4">Social Links</h3>
                <div className="space-y-3">
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-colors">
                      <Linkedin className="w-5 h-5 mr-3" />
                      LinkedIn
                    </a>
                  )}
                  {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-colors">
                      <Github className="w-5 h-5 mr-3" />
                      GitHub
                    </a>
                  )}
                  {socialLinks.portfolio && (
                    <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 transition-colors">
                      <Globe className="w-5 h-5 mr-3" />
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
