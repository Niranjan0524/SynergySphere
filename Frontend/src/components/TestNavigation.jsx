// Navigation component for testing routes (can be removed later)
import { Link, useLocation } from 'react-router-dom';

const TestNavigation = () => {
  const location = useLocation();
  
  return (
    <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-bold text-sm mb-2">Dev Navigation</h3>
      <div className="space-y-2 text-xs">
        <div className="text-gray-600">Current: {location.pathname}</div>
        <Link to="/login" className="block text-blue-600 hover:text-blue-800">Login</Link>
        <Link to="/signup" className="block text-purple-600 hover:text-purple-800">SignUp</Link>
        <Link to="/forgot-password" className="block text-indigo-600 hover:text-indigo-800">Forgot Password</Link>
        <Link to="/dashboard" className="block text-green-600 hover:text-green-800">Dashboard</Link>
      </div>
    </div>
  );
};

export default TestNavigation;
