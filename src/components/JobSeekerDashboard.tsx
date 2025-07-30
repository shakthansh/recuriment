import React, { useState } from 'react';
import AIResumeBuilder from './AIResumeBuilder';
import { supabase, Job as SupabaseJob } from '../lib/supabase';
import { 
  User, 
  FileText, 
  Briefcase, 
  Settings, 
  Home,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  ChevronLeft,
  Star,
  Send,
  Sparkles
} from 'lucide-react';

interface JobSeekerDashboardProps {
  onBack: () => void;
}

// Use the Job interface from supabase.ts and extend it for display
interface Job extends SupabaseJob {
  posted?: string; // For display purposes
}

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
}

const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAIBuilder, setShowAIBuilder] = useState(false);
  const [savedResume, setSavedResume] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to include the 'posted' field for display
      const transformedJobs = (data || []).map(job => ({
        ...job,
        posted: getTimeAgo(job.created_at)
      }));
      
      setJobs(transformedJobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return diffInHours === 0 ? 'Just now' : `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      } else {
        const diffInWeeks = Math.floor(diffInDays / 7);
        return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
      }
    }
  };

  const handleSaveResume = (resumeData: ResumeData) => {
    setSavedResume(resumeData);
    setShowAIBuilder(false);
  };

  const renderSidebar = () => (
    <div className="w-full md:w-64 bg-white shadow-lg h-full">
      <div className="p-4 md:p-6 border-b">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-2 md:mb-4 min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </button>
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Job Seeker</h2>
      </div>
      
      <nav className="p-2 md:p-4">
        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:space-y-2 md:block">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'jobs' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-sm md:text-base">Browse Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-sm md:text-base">Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'resume' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="text-sm md:text-base">Resume</span>
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'applications' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="text-sm md:text-base">Applications</span>
          </button>
        </div>
      </nav>
    </div>
  );

  const renderJobSearch = () => (
    <div className="flex-1 p-4 md:p-6">
      {/* Search Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-3 md:mb-4">Find Your Next Opportunity</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors min-h-[48px]">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No jobs available</h3>
              <p className="text-sm md:text-base text-gray-500">Check back later for new opportunities</p>
            </div>
          ) : (
            jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className={`p-4 md:p-6 border rounded-xl cursor-pointer transition-all hover:shadow-md ${
                selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800 pr-2">{job.title}</h3>
                <div className="flex items-center space-x-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm text-gray-600">4.8</span>
                </div>
              </div>
              
              <p className="text-blue-600 font-medium mb-3">{job.company}</p>
              
              <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4" />
                  <span>{job.salary}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
              
              <p className="text-sm text-gray-500">{job.posted}</p>
            </div>
          ))
          )}
        </div>

        {/* Job Details */}
        <div className="lg:sticky lg:top-6 order-first lg:order-last">
          {selectedJob ? (
            <div className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">{selectedJob.title}</h2>
                <p className="text-blue-600 font-medium text-base md:text-lg mb-4">{selectedJob.company}</p>
                
                <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm text-gray-600 mb-6">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{selectedJob.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{selectedJob.salary}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">Job Description</h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">Requirements</h3>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm md:text-base text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 text-base min-h-[56px]">
                Apply Now
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 md:p-12 text-center hidden lg:block">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">Select a job to view details</h3>
              <p className="text-sm md:text-base text-gray-500">Click on any job listing to see more information and apply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Profile Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mb-6 md:mb-8">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">John Doe</h2>
            <p className="text-base md:text-lg text-gray-600">Frontend Developer</p>
            <p className="text-sm md:text-base text-gray-500">San Francisco, CA</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Full Name</label>
            <input 
              type="text" 
              defaultValue="John Doe" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Email</label>
            <input 
              type="email" 
              defaultValue="john@example.com" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Phone</label>
            <input 
              type="tel" 
              defaultValue="+1 (555) 123-4567" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Location</label>
            <input 
              type="text" 
              defaultValue="San Francisco, CA" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
        </div>
        
        <div className="mt-4 md:mt-6">
          <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Bio</label>
          <textarea 
            rows={4}
            defaultValue="Passionate frontend developer with 5+ years of experience building responsive web applications..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        
        <div className="mt-6 md:mt-8">
          <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const renderResume = () => (
    <div className="flex-1 p-4 md:p-6">
      {showAIBuilder ? (
        <AIResumeBuilder 
          onSave={handleSaveResume}
          onBack={() => setShowAIBuilder(false)}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-gray-800">Resume Builder</h1>
            <button
              onClick={() => setShowAIBuilder(true)}
              className="px-4 md:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base min-h-[48px]"
            >
              <Sparkles className="w-5 h-5" />
              <span className="hidden sm:inline">AI Resume Builder</span>
              <span className="sm:hidden">AI Builder</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            {savedResume ? (
              <>
                {/* AI Generated Resume Display */}
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <div className="flex items-center space-x-2 text-purple-700">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium text-sm md:text-base">AI-Generated Resume</span>
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{savedResume.personalInfo.name}</h1>
                  <div className="flex flex-wrap justify-center gap-2 md:gap-4 text-sm md:text-base text-gray-600">
                    <span>{savedResume.personalInfo.email}</span>
                    <span>•</span>
                    <span>{savedResume.personalInfo.phone}</span>
                    <span>•</span>
                    <span>{savedResume.personalInfo.location}</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Professional Summary</h2>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{savedResume.personalInfo.summary}</p>
                </div>

                {/* Experience */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Experience</h2>
                  <div className="space-y-6">
                    {savedResume.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-blue-600 pl-6">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">{exp.title}</h3>
                        <p className="text-sm md:text-base text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                        <p className="text-sm md:text-base text-gray-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Education</h2>
                  <div className="space-y-4">
                    {savedResume.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-600 pl-6">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">{edu.degree}</h3>
                        <p className="text-sm md:text-base text-green-600 font-medium">{edu.school}</p>
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {savedResume.skills.map((skill, index) => (
                      <span key={index} className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Default Resume Template */}
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Experience</h2>
                  <div className="space-y-6">
                    <div className="border-l-4 border-blue-600 pl-6">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">Senior Frontend Developer</h3>
                      <p className="text-sm md:text-base text-blue-600 font-medium">TechCorp Inc.</p>
                      <p className="text-sm text-gray-500 mb-2">2021 - Present</p>
                      <p className="text-sm md:text-base text-gray-600">Led development of responsive web applications using React and TypeScript...</p>
                    </div>
                    <div className="border-l-4 border-gray-300 pl-6">
                      <h3 className="text-base md:text-lg font-semibold text-gray-800">Frontend Developer</h3>
                      <p className="text-sm md:text-base text-blue-600 font-medium">StartupXYZ</p>
                      <p className="text-sm text-gray-500 mb-2">2019 - 2021</p>
                      <p className="text-sm md:text-base text-gray-600">Developed and maintained user interfaces for web applications...</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6 md:mb-8">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'JavaScript', 'HTML/CSS', 'Node.js', 'Git', 'Figma'].map((skill) => (
                      <span key={skill} className="px-2 md:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs md:text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Education</h2>
                  <div className="border-l-4 border-green-600 pl-6">
                    <h3 className="text-base md:text-lg font-semibold text-gray-800">Bachelor of Computer Science</h3>
                    <p className="text-sm md:text-base text-green-600 font-medium">University of California</p>
                    <p className="text-sm text-gray-500">2015 - 2019</p>
                  </div>
                </div>
              </>
            )}
            
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button 
                onClick={() => {
                  // Create a simple PDF download for the default resume
                  const element = document.createElement('a');
                  const file = new Blob(['Resume content would be here'], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = 'resume.pdf';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]"
              >
                Download PDF
              </button>
              <button 
                onClick={() => setShowAIBuilder(true)}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[48px]"
              >
                {savedResume ? 'Regenerate with AI' : 'Edit Resume'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderApplications = () => (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">My Applications</h1>
      <div className="space-y-4">
        {[
          { title: 'Senior Frontend Developer', company: 'TechCorp', status: 'Interview Scheduled', statusColor: 'blue' },
          { title: 'UX/UI Designer', company: 'DesignStudio', status: 'Under Review', statusColor: 'yellow' },
          { title: 'Full Stack Developer', company: 'StartupABC', status: 'Rejected', statusColor: 'red' }
        ].map((app, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-800">{app.title}</h3>
                <p className="text-base md:text-lg text-blue-600 font-medium">{app.company}</p>
                <p className="text-sm md:text-base text-gray-500 mt-1">Applied 3 days ago</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                app.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                app.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {renderSidebar()}
      {activeTab === 'jobs' && renderJobSearch()}
      {activeTab === 'profile' && renderProfile()}
      {activeTab === 'resume' && renderResume()}
      {activeTab === 'applications' && renderApplications()}
    </div>
  );
};

export default JobSeekerDashboard;