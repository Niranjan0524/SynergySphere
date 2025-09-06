import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import Header from './Header';
import Footer from './Footer';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword } = formData;
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    try {
      setError('');
      setLoading(true);
      // Send data to backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const result = await response.json();
      if (response.ok) {
        navigate('/login');
      } else {
        setError(result.message || 'Failed to create account');
      }
    } catch (error) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
        {/* Desktop Header */}
        <div className="hidden md:block fixed top-0 left-0 w-full z-40">
          <Header />
        </div>
        {/* Mobile Header Toggle Button */}
        <button
          className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
          onClick={() => setShowMobileHeader(true)}
          aria-label="Open navigation"
        >
          ☰
        </button>
        {/* Mobile Header Sidebar */}
        {showMobileHeader && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="w-64 bg-white dark:bg-gray-900 shadow-2xl h-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
                <button
                  className="text-2xl text-gray-600 dark:text-gray-300"
                  onClick={() => setShowMobileHeader(false)}
                  aria-label="Close navigation"
                >
                  ✕
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-4">
                <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-primary-600" onClick={() => setShowMobileHeader(false)}>Home</Link>
                <Link to="/solutions" className="block text-gray-700 dark:text-gray-300 hover:text-primary-600" onClick={() => setShowMobileHeader(false)}>Solutions</Link>
                <Link to="/work" className="block text-gray-700 dark:text-gray-300 hover:text-primary-600" onClick={() => setShowMobileHeader(false)}>Work</Link>
                <Link to="/about" className="block text-gray-700 dark:text-gray-300 hover:text-primary-600" onClick={() => setShowMobileHeader(false)}>About</Link>
                <div className="flex gap-3 pt-4">
                  <Link to="/login" className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-center hover:bg-primary-50" onClick={() => setShowMobileHeader(false)}>Login</Link>
                  <Link to="/signup" className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-center hover:bg-primary-700" onClick={() => setShowMobileHeader(false)}>Sign Up</Link>
                </div>
              </nav>
            </div>
            <div className="flex-1 bg-black bg-opacity-30" onClick={() => setShowMobileHeader(false)}></div>
          </div>
        )}
        <div className="fixed top-6 right-6 z-10">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h2>
              <p className="text-gray-600 dark:text-gray-400">Join SynergySphere today</p>
            </div>
            <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 dark:bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By creating an account, you agree to our <strong>Terms of Service</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;
