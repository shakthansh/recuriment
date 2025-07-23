import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import JobSeekerDashboard from './components/JobSeekerDashboard';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'job-seeker' | 'employer'>('landing');

  return (
    <div className="min-h-screen">
      {currentView === 'landing' && (
        <LandingPage 
          onGetJob={() => setCurrentView('job-seeker')}
          onPostJob={() => setCurrentView('employer')}
        />
      )}
      {currentView === 'job-seeker' && (
        <JobSeekerDashboard onBack={() => setCurrentView('landing')} />
      )}
      {currentView === 'employer' && (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Employer Dashboard</h1>
            <p className="text-gray-600 mb-6">Coming soon...</p>
            <button 
              onClick={() => setCurrentView('landing')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;