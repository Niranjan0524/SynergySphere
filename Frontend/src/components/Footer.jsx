import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Logo / About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              SynergySphere
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A modern platform to collaborate, innovate, and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/work" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Work
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Email: support@synergysphere.com</li>
              <li>Phone: +91 98765 43210</li>
              <li>Location: Bangalore, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} SynergySphere. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link to="/privacy" className="hover:text-primary-600">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
