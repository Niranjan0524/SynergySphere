import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import InHeader from './Inheader';
import Sidebar from './Sidebar';
import ProjectAddorEdit from './ProjectAddorEdit';

const Dashboard = () => {
  const { currentUser, signOut, userId, userName, userEmail, token } = useAuth();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      {/* Sidebar for mobile (slide-in) */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="relative w-64 bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col">
            {/* Close button at top right of sidebar, same icon as open */}
            <button
              className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
              onClick={() => setShowSidebar(false)}
              aria-label="Close sidebar"
            >
              ☰
            </button>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black bg-opacity-30" onClick={() => setShowSidebar(false)}></div>
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {/* Mobile Sidebar Toggle Button (only when sidebar is closed) */}
        {!showSidebar && (
          <button
            className="md:hidden fixed top-16 left-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
            onClick={() => setShowSidebar(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        {/* Header */}
        <InHeader hideCompany={showSidebar} onNewProject={() => setShowProjectModal(true)} />
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Welcome Section */}
            <div className="bg-primary-600 dark:bg-primary-700 rounded-lg p-8 text-white mb-8 transition-colors duration-200">
              <h2 className="text-2xl font-bold mb-2">Welcome back, {userName}! 🚀</h2>
              <p className="text-primary-100 dark:text-primary-200 mb-4">
                You've successfully signed in to your SynergySphere dashboard.
              </p>
              
              {/* User Details */}
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">User Information:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p><strong>User ID:</strong> {userId}</p>
                  <p><strong>Name:</strong> {userName}</p>
                  <p><strong>Email:</strong> {userEmail}</p>
                  <p><strong>Status:</strong> <span className="text-green-300">Active</span></p>
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm">
                  <strong>Next Steps:</strong> The full project management features including project creation, 
                  task management, and team collaboration tools are ready to use.
                </p>
              </div>
            </div>

            {/* Coming Soon Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Project Management */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200 cursor-pointer" onClick={() => navigate('/projects')}>
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
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-200 cursor-pointer" onClick={() => navigate('/tasks')}>
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
        {/* Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative my-12">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={() => setShowProjectModal(false)}
                aria-label="Close project modal"
              >
                ✕
              </button>
              <ProjectAddorEdit />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
