// Navigation component for testing routes (can be removed later)
import { Link, useLocation } from 'react-router-dom';

const TestNavigation = () => {
  const location = useLocation();
  
  return (
    <div className="fixed top-4 right-20 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 transition-colors duration-200">
      <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Dev Navigation</h3>
      <div className="space-y-2 text-xs">
        <div className="text-gray-600 dark:text-gray-400">Current: {location.pathname}</div>
        <Link to="/login" className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">Login</Link>
        <Link to="/signup" className="block text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300">SignUp</Link>
        <Link to="/forgot-password" className="block text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">Forgot Password</Link>
        <Link to="/dashboard" className="block text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">Dashboard</Link>
      </div>
    </div>
  );
};

export default TestNavigation;
