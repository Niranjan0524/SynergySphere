import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const TestNavigation = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sm:hidden fixed top-16 right-4 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-primary-600 text-white shadow-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Desktop Nav */}
      <div className="hidden sm:block fixed top-4 right-20 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40 transition-colors duration-200">
        <h3 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">
          Dev Navigation
        </h3>
        <div className="space-y-2 text-xs">
          <div className="text-gray-600 dark:text-gray-400">
            Current: {location.pathname}
          </div>
          <Link
            to="/login"
            className="block text-blue-600 dark:text-blue-400 hover:underline"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block text-purple-600 dark:text-purple-400 hover:underline"
          >
            SignUp
          </Link>
          <Link
            to="/forgot-password"
            className="block text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Forgot Password
          </Link>
          <Link
            to="/dashboard"
            className="block text-green-600 dark:text-green-400 hover:underline"
          >
            Dashboard
          </Link>
        </div>
      </div>

      {/* Mobile Nav (Slide-in) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="sm:hidden fixed top-0 right-0 w-64 h-full bg-white dark:bg-gray-900 shadow-2xl z-40 p-6"
          >
            <h3 className="font-bold text-base mb-4 text-gray-900 dark:text-white">
              Dev Navigation
            </h3>
            <div className="space-y-3 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Current: {location.pathname}
              </div>
              <Link
                to="/login"
                className="block text-blue-600 dark:text-blue-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block text-purple-600 dark:text-purple-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                SignUp
              </Link>
              <Link
                to="/forgot-password"
                className="block text-indigo-600 dark:text-indigo-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Forgot Password
              </Link>
              <Link
                to="/dashboard"
                className="block text-green-600 dark:text-green-400 hover:underline"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TestNavigation;
