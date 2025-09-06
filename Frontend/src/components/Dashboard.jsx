import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Layout from './Layout';
import ProjectAddorEdit from './ProjectAddorEdit';

const Dashboard = () => {
  const { currentUser, userId, userName, userEmail, getAuthHeaders } = useAuth();
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projects, setProjects] = useState([
    {
      project_id: 101,
      name: 'Demo Project Alpha',
      status: 'progress',
      priority: 'high',
      deadline: '2025-12-01',
      progress: 45
    },
    {
      project_id: 102,
      name: 'Demo Project Beta',
      status: 'waiting',
      priority: 'medium',
      deadline: '2025-12-15',
      progress: 0
    }
  ]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const navigate = useNavigate();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setProjects([]);
        setTasks([]);
        // Only fetch if user is logged in
        if (!currentUser?.userId) return;

        // Fetch projects (same as ProjectPage.jsx)
        const response = await fetch(`${import.meta.env.VITE_API_URL}/projects/getProjects/${currentUser.userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token || localStorage.getItem('token')}`
          }
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch projects');
        }
        const fetchedProjects = data.data?.projects || [];
        
        const demoProjects = [
          {
            project_id: 101,
            name: 'Demo Project Alpha',
            status: 'progress',
            priority: 'high',
            deadline: '2025-12-01',
            progress: 45
          },
          {
            project_id: 102,
            name: 'Demo Project Beta',
            status: 'waiting',
            priority: 'medium',
            deadline: '2025-12-15',
            progress: 0
          }
        ];
        setProjects(demoProjects);

        // Optionally, fetch tasks here if you have a tasks API
        // For now, keep tasks as []

        // Calculate stats
        setStats({
          totalProjects: fetchedProjects.length,
          activeTasks: 0, // Update if you fetch tasks
          completedTasks: 0, // Update if you fetch tasks
          overdueTasks: 0 // Update if you fetch tasks
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser?.userId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'waiting': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-400';
    }
  };

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/6 w-80 h-80 bg-primary-500/5 rounded-full blur-3xl"
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, 100, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/6 w-96 h-96 bg-secondary-500/5 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-primary-600 via-accent-500 to-secondary-600 rounded-3xl p-8 sm:p-12 text-white mb-8 relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            
            <div className="relative z-10">
              <motion.h1
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl sm:text-4xl font-bold mb-4"
              >
                Welcome back, {userName}! 🚀
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-white/90 text-lg mb-6 max-w-2xl"
              >
                Ready to boost your productivity? Your SynergySphere dashboard is equipped with powerful project management tools.
              </motion.p>

              {/* Quick Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-4"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProjectModal(true)}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>New Project</span>
                </motion.button>
                
                <Link to="/tasks">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>✅</span>
                    <span>View All Tasks</span>
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            {[
              { label: 'Total Projects', value: stats.totalProjects, icon: '📁', color: 'primary' },
              { label: 'Active Tasks', value: stats.activeTasks, icon: '⚡', color: 'blue' },
              { label: 'Completed Tasks', value: stats.completedTasks, icon: '✅', color: 'green' },
              { label: 'Overdue Tasks', value: stats.overdueTasks, icon: '⚠️', color: 'red' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ duration: 0.2 }}
                className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/20 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-2xl font-bold ${
                    stat.color === 'primary' ? 'text-primary-600 dark:text-primary-400' :
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {stat.value}
                  </span>
                </div>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Projects and Tasks Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Recent Projects */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                  <span className="mr-2">📁</span>
                  Recent Projects
                </h2>
                <Link
                  to="/projects"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : projects.length > 0 ? (
                  projects.slice(0, 3).map((project) => (
                    <motion.div
                      key={project.project_id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900 dark:text-white">
                          {project.progress}%
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          Due: {new Date(project.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500 dark:text-neutral-400">No projects yet</p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowProjectModal(true)}
                      className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Create your first project
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center">
                  <span className="mr-2">✅</span>
                  Recent Tasks
                </h2>
                <Link
                  to="/tasks"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : tasks.length > 0 ? (
                  tasks.slice(0, 4).map((task) => (
                    <motion.div
                      key={task.task_id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center space-x-3 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl"
                    >
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${
                          task.status === 'completed' 
                            ? 'line-through text-neutral-500 dark:text-neutral-400' 
                            : 'text-neutral-900 dark:text-white'
                        }`}>
                          {task.name}
                        </h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {task.project_name}
                        </p>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {new Date(task.deadline).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-neutral-500 dark:text-neutral-400">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-neutral-700/20"
          >
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center">
              <span className="mr-2">⚡</span>
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { 
                  label: 'New Project', 
                  icon: '📁', 
                  action: () => setShowProjectModal(true),
                  color: 'bg-blue-500'
                },
                { 
                  label: 'View Projects', 
                  icon: '👁️', 
                  action: () => navigate('/projects'),
                  color: 'bg-green-500'
                },
                { 
                  label: 'Manage Tasks', 
                  icon: '✅', 
                  action: () => navigate('/tasks'),
                  color: 'bg-purple-500'
                },
                { 
                  label: 'Team Settings', 
                  icon: '⚙️', 
                  action: () => {},
                  color: 'bg-gray-500'
                }
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                  className="flex flex-col items-center p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl hover:shadow-md transition-all duration-200"
                >
                  <div className={`w-12 h-12 ${item.color} rounded-full flex items-center justify-center text-white text-xl mb-2`}>
                    {item.icon}
                  </div>
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Project Modal */}
        {showProjectModal && (
          <ProjectAddorEdit
            onClose={() => setShowProjectModal(false)}
            onSave={(projectData) => {
              console.log('New project created:', projectData);
              setShowProjectModal(false);
              // Refresh projects list here if needed
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
