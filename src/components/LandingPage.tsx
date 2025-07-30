import React from 'react';
import { Users, Briefcase, Star, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetJob: () => void;
  onPostJob: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetJob, onPostJob }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-lg md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TalentConnect
            </span>
          </div>
          <nav className="hidden lg:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">About</a>
            <a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight">
            Connect Talent with 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {" "}Opportunity
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 md:mb-12 leading-relaxed px-2">
            The premier platform where exceptional talent meets innovative companies. 
            Build your career or find your next star employee with our cutting-edge recruitment solutions.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:gap-6 justify-center mb-12 md:mb-16 px-4">
            <button 
              onClick={onGetJob}
              className="group w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 min-h-[56px]"
            >
              <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Find Your Dream Job</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onPostJob}
              className="group w-full sm:w-auto px-6 sm:px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 min-h-[56px]"
            >
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Hire Top Talent</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">50K+</div>
              <div className="text-sm md:text-base text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">100K+</div>
              <div className="text-sm md:text-base text-gray-600">Professionals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1 md:mb-2">5K+</div>
              <div className="text-sm md:text-base text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1 md:mb-2">95%</div>
              <div className="text-sm md:text-base text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose TalentConnect?</h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2">
              Advanced features designed to streamline your recruitment process and accelerate career growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <Star className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Smart Matching</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                AI-powered algorithms ensure perfect job-candidate matches based on skills, experience, and culture fit
              </p>
            </div>
            
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Career Growth</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Comprehensive tools for skill development, portfolio building, and career advancement tracking
              </p>
            </div>
            
            <div className="text-center p-6 md:p-8 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <h3 className="text-lg md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Verified Quality</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                Rigorous verification process ensures authentic profiles and legitimate job opportunities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <span className="text-lg md:text-xl font-bold">TalentConnect</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm md:text-base text-gray-400 mb-1 md:mb-2">© 2025 TalentConnect. All rights reserved.</p>
              <p className="text-sm md:text-base text-gray-400">Connecting talent with opportunity, globally.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;