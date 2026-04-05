import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, User, GraduationCap } from 'lucide-react';
import Button from '@components/common/Button';
import Badge from '@components/common/Badge';

const CandidateCard = ({ candidate }) => {
  const navigate = useNavigate();
  
  // Destructure candidate data safely
  const { _id, firstName, lastName, photo, email, profile } = candidate;
  const { 
    title, 
    location, 
    experienceYears, 
    skills = [], 
    bio,
    education = []
  } = profile || {};

  const handleViewProfile = () => {
    navigate(`/recruiter/candidates/${_id}`);
  };

  return (
    <div className="card card-hover p-6 flex flex-col md:flex-row gap-6 transition-all duration-300">
      {/* Avatar Section */}
      <div className="flex-shrink-0">
        {photo ? (
          <img 
            src={photo} 
            alt={`${firstName} ${lastName}`} 
            className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center border-2 border-white dark:border-dark-bg transition-colors">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {firstName?.[0]}{lastName?.[0]}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-light-text dark:text-dark-text hover:text-primary-600 dark:hover:text-primary-400 transition-colors cursor-pointer" onClick={handleViewProfile}>
              {firstName} {lastName}
            </h3>
            <div className="flex items-center mt-1 text-primary-600 dark:text-primary-400 font-medium">
              <Briefcase className="w-4 h-4 mr-1.5" />
              {title || 'Open to Work'}
            </div>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              {location && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                  {location}
                </div>
              )}
              {experienceYears !== undefined && (
                <div className="flex items-center">
                  <span className="font-medium mr-1">{experienceYears}</span> years experience
                </div>
              )}
              {education.length > 0 && (
                <div className="flex items-center">
                  <GraduationCap className="w-4 h-4 mr-1.5 text-gray-400" />
                  {education[0].degree}
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewProfile}
              className="w-full md:w-auto"
            >
              View Profile
            </Button>
          </div>
        </div>

        {/* Bio */}
        <p className="mt-4 text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
          {bio || 'No professional bio available.'}
        </p>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.slice(0, 6).map((skill, index) => (
              <Badge 
                key={skill._id || index} 
                variant="secondary" 
                size="sm"
                className="bg-gray-100 dark:bg-dark-bg-tertiary text-gray-700 dark:text-gray-300"
              >
                {typeof skill === 'string' ? skill : skill.name}
              </Badge>
            ))}
            {skills.length > 6 && (
              <span className="text-xs text-gray-500 self-center font-medium px-2">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateCard;
