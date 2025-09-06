import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import AddOrEditTask from './AddOrEditTask';

const TaskPage = () => {
  const { userId, getAuthHeaders } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'progress', 'completed'
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  // Mock data - replace with actual API calls
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Mock tasks data
        const mockTasks = [
          {
            task_id: 1,
            name: 'Design Homepage Mockup',
            description: 'Create wireframes and mockups for the new homepage design',
            start_time: '2025-09-01T10:00:00Z',
            deadline: '2025-09-10T18:00:00Z',
            status: 'progress',
            profile_image: null,
            created_at: '2025-09-01T10:00:00Z',
            project_name: 'Website Redesign',
            project_id: 1,
            assigned_to: { user_id: userId, name: 'You' },
            priority: 'high'
          },
          {
            task_id: 2,
            name: 'Implement Authentication System',
            description: 'Set up user authentication with JWT tokens',
            start_time: '2025-09-05T09:00:00Z',
            deadline: '2025-09-15T17:00:00Z',
            status: 'progress',
            profile_image: null,
            created_at: '2025-09-05T09:00:00Z',
            project_name: 'Mobile App Development',
            project_id: 2,
            assigned_to: { user_id: userId, name: 'You' },
            priority: 'medium'
          },
          {
            task_id: 3,
            name: 'Database Schema Migration',
            description: 'Migrate existing database to new cloud infrastructure',
            start_time: '2025-08-01T08:00:00Z',
            deadline: '2025-09-05T16:00:00Z',
            status: 'completed',
            profile_image: null,
            created_at: '2025-08-01T08:00:00Z',
            project_name: 'Database Migration',
            project_id: 3,
            assigned_to: { user_id: userId, name: 'You' },
            priority: 'high'
          },
          {
            task_id: 4,
            name: 'Write API Documentation',
            description: 'Document all API endpoints with examples',
            start_time: '2025-09-08T10:00:00Z',
            deadline: '2025-09-20T18:00:00Z',
            status: 'progress',
            profile_image: null,
            created_at: '2025-09-08T10:00:00Z',
            project_name: 'Website Redesign',
            project_id: 1,
            assigned_to: { user_id: userId, name: 'You' },
            priority: 'low'
          }
        ];

        setTasks(mockTasks);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const tasksByStatus = {
    progress: filteredTasks.filter(task => task.status === 'progress'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (taskData) => {
    if (editingTask) {
      // Update existing task
      setTasks(prev => prev.map(t => 
        t.task_id === editingTask.task_id 
          ? { ...t, ...taskData }
          : t
      ));
    } else {
      // Add new task
      const newTask = {
        task_id: Date.now(),
        created_at: new Date().toISOString(),
        assigned_to: { user_id: userId, name: 'You' },
        project_name: 'Unassigned', // Default project
        project_id: null,
        ...taskData
      };
      setTasks(prev => [newTask, ...prev]);
    }
    setShowTaskModal(false);
    setEditingTask(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task =>
      task.task_id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const TaskCard = ({ task }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`bg-white dark:bg-neutral-800 rounded-xl p-4 shadow-sm border-l-4 ${
        task.status === 'completed' 
          ? 'border-l-green-500' 
          : task.priority === 'high' 
            ? 'border-l-red-500'
            : task.priority === 'medium'
              ? 'border-l-yellow-500'
              : 'border-l-blue-500'
      } hover:shadow-md transition-all duration-200 cursor-pointer`}
      onClick={() => handleEditTask(task)}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className={`font-semibold text-neutral-900 dark:text-white ${
          task.status === 'completed' ? 'line-through opacity-75' : ''
        }`}>
          {task.name}
        </h3>
        <div className="flex items-center space-x-1">
          {isOverdue(task.deadline) && task.status !== 'completed' && (
            <span className="text-red-500 text-xs">⚠️</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange(
                task.task_id, 
                task.status === 'completed' ? 'progress' : 'completed'
              );
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-green-500'
            }`}
          >
            {task.status === 'completed' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
        {task.description}
      </p>

      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
          {task.priority} priority
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          {task.project_name}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
        <span>
          Due: {new Date(task.deadline).toLocaleDateString()}
        </span>
        <span className={`px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>
    </motion.div>
  );

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
                Tasks
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Organize and track your individual tasks efficiently
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4 mt-4 sm:mt-0"
            >
              {/* Filter Buttons */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                {['all', 'progress', 'completed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filterStatus === status
                        ? 'bg-white dark:bg-neutral-700 shadow-sm text-primary-600'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('board')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'board'
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

              {/* New Task Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowTaskModal(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Task</span>
              </motion.button>
            </motion.div>
          </div>

          {/* Tasks Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6">
                {filterStatus === 'all' 
                  ? 'Get started by creating your first task' 
                  : `No ${filterStatus} tasks to show`
                }
              </p>
              {filterStatus === 'all' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTaskModal(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Create Task
                </motion.button>
              )}
            </motion.div>
          ) : viewMode === 'board' ? (
            /* Kanban Board View */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* In Progress Column */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    In Progress
                  </h2>
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-2 py-1 rounded-full text-sm">
                    {tasksByStatus.progress.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {tasksByStatus.progress.map((task) => (
                    <TaskCard key={task.task_id} task={task} />
                  ))}
                  {tasksByStatus.progress.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl">
                      No tasks in progress
                    </div>
                  )}
                </div>
              </div>

              {/* Completed Column */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    Completed
                  </h2>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 px-2 py-1 rounded-full text-sm">
                    {tasksByStatus.completed.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {tasksByStatus.completed.map((task) => (
                    <TaskCard key={task.task_id} task={task} />
                  ))}
                  {tasksByStatus.completed.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-300 dark:border-neutral-600 rounded-xl">
                      No completed tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task.task_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <TaskCard task={task} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Task Modal */}
        <AnimatePresence>
          {showTaskModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowTaskModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-neutral-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              >
                <AddOrEditTask
                  task={editingTask}
                  onClose={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                  }}
                  onSave={handleTaskSave}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};

export default TaskPage;
