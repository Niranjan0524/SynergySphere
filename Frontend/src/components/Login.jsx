import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMobileHeader, setShowMobileHeader] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    try {
      setError("");
      setLoading(true);
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 px-2 sm:px-6 lg:px-8 relative">
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
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Menu
              </span>
              <button
                className="text-2xl text-gray-600 dark:text-gray-300"
                onClick={() => setShowMobileHeader(false)}
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            {/* Only mobile nav links from Header */}
            <nav className="flex-1 p-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setShowMobileHeader(false)}
              >
                Home
              </Link>
              <Link
                to="/solutions"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setShowMobileHeader(false)}
              >
                Solutions
              </Link>
              <Link
                to="/work"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setShowMobileHeader(false)}
              >
                Work
              </Link>
              <Link
                to="/about"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setShowMobileHeader(false)}
              >
                About
              </Link>
              <div className="flex gap-3 pt-4">
                <Link
                  to="/login"
                  className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-center hover:bg-primary-50"
                  onClick={() => setShowMobileHeader(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-center hover:bg-primary-700"
                  onClick={() => setShowMobileHeader(false)}
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
          {/* Overlay to close sidebar */}
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setShowMobileHeader(false)}
          ></div>
        </div>
      )}
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="flex-1 flex items-center justify-center">
        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 sm:p-8 mt-24 sm:mt-32 mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back 👋
            </h2>
            <p className="text-gray-500 mt-2">Sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm text-center"
              >
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-base sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition text-base sm:text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between text-sm gap-2 sm:gap-0">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-primary-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary-600 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
