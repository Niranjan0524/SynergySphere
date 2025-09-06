import Sidebar from "./Sidebar";
import InHeader from "./Inheader";
import React, { useState, useEffect } from "react";
import ProjectCard from "./ProjectCard";
import ProjectAddorEdit from "./ProjectAddorEdit";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProjectPage() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Fetch projects from API
  const fetchProjects = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      setError("");
      
      console.log('Fetching projects for userId:', currentUser.userId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/getProjects/${currentUser.userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token || localStorage.getItem('token')}`
        }
      });

      console.log('Fetch Projects Response:', response);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

  const data = await response.json();
  setProjects(data.data?.projects || []);
      
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects on component mount and when user changes
  useEffect(() => {
    console.log('Current User:', currentUser);
    if (currentUser?.id) {
      fetchProjects();
    }
  }, [currentUser?.userId]);

  // Refresh projects when modal closes (in case new project was added)
  const handleCloseModal = () => {
    setShowProjectModal(false);
    fetchProjects(); // Refresh the projects list
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
        <div className="flex items-center gap-2 px-4 pt-2">
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <InHeader hideCompany={showSidebar} onNewProject={() => setShowProjectModal(true)} />
          </div>
        </div>
        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">My Projects</h2>
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
                <button 
                  onClick={fetchProjects} 
                  className="ml-2 text-red-600 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow animate-pulse">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first project.</p>
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Project
                </button>
              </div>
            ) : (
              /* Projects Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) =>
                  project.tasks && project.tasks.length > 0 ? (
                    project.tasks.map((task, idx) => (
                      <ProjectCard key={project.id + '-' + idx} project={project.name} task={task} />
                    ))
                  ) : (
                    <ProjectCard key={project.id} project={project.name} task={{
                      title: project.name,
                      tags: project.tags || [],
                      date: project.deadline,
                      image: "https://via.placeholder.com/150",
                      avatar: "https://randomuser.me/api/portraits/men/1.jpg",
                    }} />
                  )
                )}
              </div>
            )}
          </div>
        </main>
        {/* Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative my-12">
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
                aria-label="Close project modal"
              >
                ✕
              </button>
              <ProjectAddorEdit onSuccess={handleCloseModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
