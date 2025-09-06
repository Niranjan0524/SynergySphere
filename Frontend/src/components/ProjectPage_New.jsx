import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from './Layout';
import ProjectAddorEdit from './ProjectAddorEdit';

const ProjectPage = () => {
  const { projectId } = useParams();
  const { userId, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Mock projects data
        const mockProjects = [
          {
            project_id: 1,
            name: 'Website Redesign',
            description: 'Complete redesign of company website with modern UI/UX principles',
            owner_id: userId,
            manager_id: userId,
            start_time: '2025-09-01T10:00:00Z',
            deadline: '2025-10-15T18:00:00Z',
            priority: 'high',
            status: 'progress',
            profile_image: null,
            created_at: '2025-09-01T10:00:00Z',
            team_members: [
              { user_id: 1, name: 'John Doe', role: 'owner' },
              { user_id: 2, name: 'Jane Smith', role: 'member' },
              { user_id: 3, name: 'Mike Johnson', role: 'member' }
            ],
            task_count: 12,
            completed_tasks: 7
          },
          {
            project_id: 2,
            name: 'Mobile App Development',
            description: 'Native mobile application for iOS and Android platforms',
            owner_id: userId,
            manager_id: userId,
            start_time: '2025-08-15T09:00:00Z',
            deadline: '2025-11-30T17:00:00Z',
            priority: 'medium',
            status: 'progress',
            profile_image: null,
            created_at: '2025-08-15T09:00:00Z',
            team_members: [
              { user_id: 1, name: 'Alice Brown', role: 'manager' },
              { user_id: 2, name: 'Bob Wilson', role: 'member' }
            ],
            task_count: 8,
            completed_tasks: 2
          },
          {
            project_id: 3,
            name: 'Database Migration',
            description: 'Migrate legacy database to new cloud infrastructure',
            owner_id: userId,
            manager_id: userId,
            start_time: '2025-08-01T08:00:00Z',
            deadline: '2025-09-15T16:00:00Z',
            priority: 'high',
            status: 'completed',
            profile_image: null,
            created_at: '2025-08-01T08:00:00Z',
            team_members: [
              { user_id: 1, name: 'Sarah Davis', role: 'owner' },
              { user_id: 2, name: 'Tom Anderson', role: 'member' }
            ],
            task_count: 15,
            completed_tasks: 15
          }
        ];

        setProjects(mockProjects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [userId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'waiting': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getProgressPercentage = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleProjectSave = (projectData) => {
    if (editingProject) {
      // Update existing project
      setProjects(prev => prev.map(p => 
        p.project_id === editingProject.project_id 
          ? { ...p, ...projectData }
          : p
      ));
    } else {
      // Add new project
      const newProject = {
        project_id: Date.now(),
        owner_id: userId,
        manager_id: userId,
        created_at: new Date().toISOString(),
        team_members: [{ user_id: userId, name: 'You', role: 'owner' }],
        task_count: 0,
        completed_tasks: 0,
        ...projectData
      };
      setProjects(prev => [newProject, ...prev]);
    }
    setShowProjectModal(false);
    setEditingProject(null);
  };

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                Projects
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Manage and track all your team projects in one place
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4 mt-4 sm:mt-0"
            >
              {/* View Mode Toggle */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* New Project Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProjectModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Project</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Projects Grid/List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No projects yet</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">Get started by creating your first project</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowProjectModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Create Project
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" 
                : "space-y-4"
              }
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.project_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className={`bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${
                    viewMode === 'list' ? 'flex items-center space-x-6' : ''
                  }`}
                  onClick={() => navigate(`/project/${project.project_id}`)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                            {project.name}
                          </h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2">
                            {project.description}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>

                      {/* Status and Priority */}
                      <div className="flex items-center space-x-2 mb-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority} priority
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
                          <span className="font-medium text-neutral-900 dark:text-white">
                            {getProgressPercentage(project.completed_tasks, project.task_count)}%
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(project.completed_tasks, project.task_count)}%` }}
                          />
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                          {project.completed_tasks} of {project.task_count} tasks completed
                        </p>
                      </div>

                      {/* Team and Deadline */}
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {project.team_members.slice(0, 3).map((member, idx) => (
                            <div
                              key={member.user_id}
                              className="w-8 h-8 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white dark:border-neutral-800"
                              title={member.name}
                            >
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {project.team_members.length > 3 && (
                            <div className="w-8 h-8 bg-neutral-300 dark:bg-neutral-600 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-300 text-sm font-medium border-2 border-white dark:border-neutral-800">
                              +{project.team_members.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">Deadline</p>
                          <p className="text-sm font-medium text-neutral-900 dark:text-white">
                            {new Date(project.deadline).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                            {project.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                              {project.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex -space-x-2">
                              {project.team_members.slice(0, 3).map((member, idx) => (
                                <div
                                  key={member.user_id}
                                  className="w-6 h-6 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-neutral-800"
                                  title={member.name}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                              {project.completed_tasks}/{project.task_count} tasks
                            </span>
                          </div>
                          <span className="text-sm font-medium text-neutral-900 dark:text-white">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Project Modal */}
        <AnimatePresence>
          {showProjectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowProjectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                <ProjectAddorEdit
                  project={editingProject}
                  onClose={() => {
                    setShowProjectModal(false);
                    setEditingProject(null);
                  }}
                  onSave={handleProjectSave}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default ProjectPage;
