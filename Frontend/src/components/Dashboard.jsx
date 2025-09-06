import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

const Dashboard = () => {
  const { currentUser, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">SynergySphere</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-sm text-gray-700 dark:text-gray-300">Welcome, {currentUser?.name || currentUser?.email}</span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-primary-600 dark:bg-primary-700 rounded-lg p-8 text-white mb-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold mb-2">Welcome to SynergySphere! 🚀</h2>
            <p className="text-primary-100 dark:text-primary-200 mb-4">
              You've successfully signed in. This is your team collaboration dashboard.
            </p>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-sm">
                <strong>Next Steps:</strong> The full project management features including project creation, 
                task management, and team collaboration tools will be implemented next.
              </p>
            </div>
          </div>

          {/* Coming Soon Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Project Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Projects</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Create and manage projects with your team.</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                Coming Soon
              </span>
            </div>

            {/* Task Management */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Tasks</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Assign and track tasks with due dates and statuses.</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                Coming Soon
              </span>
            </div>

            {/* Team Collaboration */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-lg font-medium text-gray-900 dark:text-white">Communication</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Project-specific threaded discussions.</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">
                Coming Soon
              </span>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Account Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</label>
                <p className="text-gray-900 dark:text-white">{currentUser?.name || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                <p className="text-gray-900 dark:text-white">{currentUser?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member since:</label>
                <p className="text-gray-900 dark:text-white">
                  {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Today'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
