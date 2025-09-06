import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-white">
            SynergySphere
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              Home
            </Link>
            <Link to="/solutions" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              Solutions
            </Link>
            <Link to="/work" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              Work
            </Link>
            <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-primary-600">
              About
            </Link>

            {/* Auth Buttons */}
            <Link
              to="/login"
              className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Sign Up
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-md"
          >
            <div className="px-4 py-4 space-y-4">
              <Link
                to="/"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/solutions"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                Solutions
              </Link>
              <Link
                to="/work"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                Work
              </Link>
              <Link
                to="/about"
                className="block text-gray-700 dark:text-gray-300 hover:text-primary-600"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>

              <div className="flex gap-3 pt-4">
                <Link
                  to="/login"
                  className="flex-1 px-4 py-2 border border-primary-600 text-primary-600 rounded-lg text-center hover:bg-primary-50"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-center hover:bg-primary-700"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
