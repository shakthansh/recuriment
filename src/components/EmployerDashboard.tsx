import React, { useState, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase, Job } from '../lib/supabase';
import { 
  Building2, 
  Plus, 
  Briefcase, 
  Users, 
  Settings, 
  ChevronLeft,
  MapPin,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Loader2
} from 'lucide-react';

interface EmployerDashboardProps {
  onBack: () => void;
}

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string;
  tags: string;
}

const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI job description generator state
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const genAI = new GoogleGenerativeAI('AIzaSyAMqMgvCu-bM7rvZUDjbjDXCYoXT6iAL34');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    salary: '',
    description: '',
    requirements: '',
    tags: ''
  });

  useEffect(() => {
    checkUser();
    fetchJobs();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // If no user, sign in anonymously for demo purposes
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error('Error signing in:', error);
      } else {
        setUser(data.user);
      }
    } else {
      setUser(user);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showMessage('error', 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const generateJobDescription = async () => {
    if (!formData.title || !formData.company || !formData.location || !formData.salary) {
      showMessage('error', 'Please fill in job title, company, location, and salary range first');
      return;
    }

    setIsGeneratingDescription(true);
    try {
      const prompt = `
        Create a professional and compelling job description for the following position:
        
        Job Title: ${formData.title}
        Company: ${formData.company}
        Location: ${formData.location}
        Salary Range: ${formData.salary}
        Employment Type: ${formData.type}
        
        Please create a comprehensive job description that includes:
        1. A brief company overview (you can make reasonable assumptions about the company)
        2. Role overview and key responsibilities
        3. What we're looking for in a candidate
        4. What the company offers
        5. Growth opportunities
        
        Make it engaging, professional, and attractive to potential candidates. The description should be 3-4 paragraphs long and highlight why this is an exciting opportunity.
        
        Do not include requirements or skills list as those will be added separately.
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedDescription = response.text();
      
      setFormData(prev => ({ ...prev, description: generatedDescription }));
      showMessage('success', 'Job description generated successfully!');
      
    } catch (error) {
      console.error('Error generating job description:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        showMessage('error', 'The AI model is currently overloaded. Please try again in a few moments.');
      } else {
        showMessage('error', 'Failed to generate job description. Please try again.');
      }
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      type: 'Full-time',
      salary: '',
      description: '',
      requirements: '',
      tags: ''
    });
    setEditingJob(null);
    setShowJobForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showMessage('error', 'Please sign in to post jobs');
      return;
    }

    setSubmitting(true);
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        type: formData.type,
        salary: formData.salary,
        description: formData.description,
        requirements: formData.requirements.split(',').map(req => req.trim()).filter(req => req),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        posted_by: user.id
      };

      let error;
      if (editingJob) {
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', editingJob.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([jobData]);
        error = insertError;
      }

      if (error) throw error;

      showMessage('success', editingJob ? 'Job updated successfully!' : 'Job posted successfully!');
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error saving job:', error);
      showMessage('error', 'Failed to save job. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements.join(', '),
      tags: job.tags.join(', ')
    });
    setShowJobForm(true);
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      showMessage('success', 'Job deleted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      showMessage('error', 'Failed to delete job');
    }
  };

  const toggleJobStatus = async (job: Job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      showMessage('success', `Job ${job.is_active ? 'deactivated' : 'activated'} successfully!`);
      fetchJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      showMessage('error', 'Failed to update job status');
    }
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
        <h2 className="text-lg md:text-xl font-bold text-gray-800">Employer Portal</h2>
      </div>
      
      <nav className="p-2 md:p-4">
        <div className="grid grid-cols-3 md:grid-cols-1 gap-2 md:space-y-2 md:block">
          <button
            onClick={() => setActiveTab('jobs')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'jobs' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-sm md:text-base">Manage Jobs</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'analytics' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm md:text-base">Analytics</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center justify-center md:justify-start space-x-2 md:space-x-3 px-3 md:px-4 py-3 rounded-lg transition-colors min-h-[48px] ${
              activeTab === 'settings' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm md:text-base">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );

  const renderJobForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start md:items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto my-4 md:my-0">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              {editingJob ? 'Edit Job' : 'Post New Job'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div className="grid md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="Senior Frontend Developer"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="TechCorp Inc."
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder="San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Employment Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Salary Range *</label>
            <input
              type="text"
              required
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="$120k - $160k"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Job Description *</label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <span className="text-xs md:text-sm text-gray-500">Describe the role and what makes it exciting</span>
              <button
                type="button"
                onClick={generateJobDescription}
                disabled={isGeneratingDescription || !formData.title || !formData.company || !formData.location || !formData.salary}
                className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[40px]"
              >
                {isGeneratingDescription ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Generate with AI</span>
                    <span className="sm:hidden">AI Generate</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting... or use AI to generate automatically"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Requirements</label>
            <textarea
              rows={3}
              value={formData.requirements}
              onChange={(e) => handleInputChange('requirements', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="React, TypeScript, 5+ years experience (separate with commas)"
            />
          </div>

          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Tags</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="Remote, Tech, Senior Level (separate with commas)"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors min-h-[48px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-h-[48px]"
            >
              <Save className="w-5 h-5" />
              <span>{submitting ? 'Saving...' : (editingJob ? 'Update Job' : 'Post Job')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderJobsTab = () => (
    <div className="flex-1 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">Manage Jobs</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Post and manage your job listings</p>
        </div>
        <button
          onClick={() => setShowJobForm(true)}
          className="w-full sm:w-auto px-4 md:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm md:text-base min-h-[48px]"
        >
          <Plus className="w-5 h-5" />
          <span>Post New Job</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 md:mb-6 p-3 md:p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm md:text-base">{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">No jobs posted yet</h3>
              <p className="text-sm md:text-base text-gray-500 mb-6 px-4">Start by posting your first job to attract top talent</p>
              <button
                onClick={() => setShowJobForm(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className={`bg-white border rounded-xl p-4 md:p-6 ${job.is_active ? 'border-gray-200' : 'border-gray-300 bg-gray-50'}`}>
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg md:text-xl font-semibold text-gray-800">{job.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        job.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {job.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-base md:text-lg text-blue-600 font-medium mb-3">{job.company}</p>
                    
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
                    
                    <p className="text-sm md:text-base text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                    
                    {job.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end lg:justify-start space-x-2 lg:ml-4">
                    <button
                      onClick={() => toggleJobStatus(job)}
                      className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${
                        job.is_active ? 'hover:bg-gray-100 text-gray-600' : 'hover:bg-green-100 text-green-600'
                      }`}
                      title={job.is_active ? 'Deactivate job' : 'Activate job'}
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(job)}
                      className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                      title="Edit job"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                      title="Delete job"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs md:text-sm text-gray-500 border-t border-gray-200 pt-3">
                  Posted {new Date(job.created_at).toLocaleDateString()}
                  {job.updated_at !== job.created_at && (
                    <span> • Updated {new Date(job.updated_at).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showJobForm && renderJobForm()}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Analytics</h1>
      <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
            <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{jobs.filter(job => job.is_active).length}</p>
            </div>
            <Eye className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-gray-600">This Month</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">
                {jobs.filter(job => new Date(job.created_at).getMonth() === new Date().getMonth()).length}
              </p>
            </div>
            <Plus className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <p className="text-sm md:text-base text-gray-600">Analytics features coming soon...</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">Settings</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Company Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Company Name</label>
            <input 
              type="text" 
              defaultValue="Your Company" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <div>
            <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">Company Description</label>
            <textarea 
              rows={4}
              defaultValue="Tell candidates about your company..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>
          <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors min-h-[48px]">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {renderSidebar()}
      {activeTab === 'jobs' && renderJobsTab()}
      {activeTab === 'analytics' && renderAnalyticsTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  );
};

export default EmployerDashboard;