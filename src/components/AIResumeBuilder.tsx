import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Download, Save, Loader2, User, Briefcase, GraduationCap, Award } from 'lucide-react';

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

interface AIResumeBuilderProps {
  onSave: (resumeData: ResumeData) => void;
  onBack: () => void;
}

const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({ onSave, onBack }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    targetRole: '',
    experience: '',
    education: '',
    skills: '',
    achievements: ''
  });
  const [generatedResume, setGeneratedResume] = useState<ResumeData | null>(null);

  const genAI = new GoogleGenerativeAI('AIzaSyAMqMgvCu-bM7rvZUDjbjDXCYoXT6iAL34');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateResume = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
        Create a professional resume based on the following information. Return the response in JSON format with the exact structure shown below:

        Personal Information:
        - Name: ${formData.name}
        - Email: ${formData.email}
        - Phone: ${formData.phone}
        - Location: ${formData.location}
        - Target Role: ${formData.targetRole}

        Experience: ${formData.experience}
        Education: ${formData.education}
        Skills: ${formData.skills}
        Achievements: ${formData.achievements}

        Please generate a professional resume with:
        1. A compelling professional summary (2-3 sentences)
        2. Well-formatted work experience with bullet points
        3. Education details
        4. Skills organized by category

        Return ONLY valid JSON in this exact format:
        {
          "personalInfo": {
            "name": "string",
            "email": "string",
            "phone": "string",
            "location": "string",
            "summary": "string"
          },
          "experience": [
            {
              "title": "string",
              "company": "string",
              "duration": "string",
              "description": "string"
            }
          ],
          "education": [
            {
              "degree": "string",
              "school": "string",
              "year": "string"
            }
          ],
          "skills": ["string"]
        }
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const resumeData = JSON.parse(jsonMatch[0]);
        setGeneratedResume(resumeData);
        setCurrentStep(3);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      console.error('Error generating resume:', error);
      // Check if it's a 503 overload error
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
        alert('The AI model is currently overloaded. Please try again in a few moments.');
      } else {
        alert('Failed to generate resume. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    if (!generatedResume) return;
    
    try {
      // Auto-save the resume when downloading
      onSave(generatedResume);
      
      const element = document.querySelector('.resume-content');
      if (!element) {
        console.error('Resume content element not found');
        alert('Unable to generate PDF. Please try again.');
        return;
      }
      
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `${generatedResume.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h2>
        <p className="text-gray-600">Let's start with your basic details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="john@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="San Francisco, CA"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Target Role *</label>
        <input
          type="text"
          value={formData.targetRole}
          onChange={(e) => handleInputChange('targetRole', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Senior Frontend Developer"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Briefcase className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Professional Details</h2>
        <p className="text-gray-600">Tell us about your experience and skills</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience *</label>
        <textarea
          rows={4}
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Describe your work experience, including job titles, companies, dates, and key responsibilities..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
        <textarea
          rows={3}
          value={formData.education}
          onChange={(e) => handleInputChange('education', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="List your educational background, degrees, institutions, and graduation years..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills *</label>
        <textarea
          rows={3}
          value={formData.skills}
          onChange={(e) => handleInputChange('skills', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="List your technical and soft skills, programming languages, tools, etc..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Achievements (Optional)</label>
        <textarea
          rows={3}
          value={formData.achievements}
          onChange={(e) => handleInputChange('achievements', e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          placeholder="Notable achievements, awards, certifications, projects..."
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your AI-Generated Resume</h2>
        <p className="text-gray-600">Review and customize your professional resume</p>
      </div>

      {generatedResume && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm resume-content">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{generatedResume.personalInfo.name}</h1>
            <div className="flex flex-wrap justify-center gap-4 text-gray-600">
              <span>{generatedResume.personalInfo.email}</span>
              <span>•</span>
              <span>{generatedResume.personalInfo.phone}</span>
              <span>•</span>
              <span>{generatedResume.personalInfo.location}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{generatedResume.personalInfo.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
              Experience
            </h2>
            <div className="space-y-6">
              {generatedResume.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-blue-600 font-medium">{exp.company}</p>
                  <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                  <p className="text-gray-700">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
              Education
            </h2>
            <div className="space-y-4">
              {generatedResume.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-green-600 pl-6">
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-green-600 font-medium">{edu.school}</p>
                  <p className="text-sm text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-blue-600" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {generatedResume.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const isStep1Valid = formData.name && formData.email && formData.phone && formData.location && formData.targetRole;
  const isStep2Valid = formData.experience && formData.education && formData.skills;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">Step {currentStep} of 3</span>
          <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / 3) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onBack : () => setCurrentStep(currentStep - 1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {currentStep === 1 ? 'Back to Resume' : 'Previous'}
          </button>

          <div className="flex space-x-4">
            {currentStep === 1 && (
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Valid}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Next Step
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={generateResume}
                disabled={!isStep2Valid || isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Resume</span>
                  </>
                )}
              </button>
            )}

            {currentStep === 3 && generatedResume && (
              <div className="flex space-x-4">
                <button
                  onClick={() => onSave(generatedResume)}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Resume</span>
                </button>
                <button
                  onClick={downloadPDF}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIResumeBuilder;