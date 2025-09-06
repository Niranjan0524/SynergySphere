import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass-card mt-16 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mb-4"
            >
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
                SynergySphere
              </h3>
            </motion.div>
            <p className="text-neutral-300 mb-6 max-w-md leading-relaxed">
              Empowering teams to collaborate, innovate, and achieve extraordinary results through intelligent project management.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: '🚀', label: 'Innovation' },
                { icon: '⚡', label: 'Performance' },
                { icon: '🎯', label: 'Results' },
                { icon: '💡', label: 'Ideas' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="glass-card p-3 rounded-xl cursor-pointer"
                  title={item.label}
                >
                  <span className="text-xl">{item.icon}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                'Dashboard',
                'Projects',
                'Tasks',
                'Team',
                'Analytics',
                'Settings'
              ].map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href="#"
                    className="text-neutral-300 hover:text-accent-400 transition-all duration-300 hover:drop-shadow-glow"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {[
                'Documentation',
                'Support',
                'Blog',
                'FAQs'
              ].map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <a
                    href="#"
                    className="text-neutral-300 hover:text-accent-400 transition-all duration-300 hover:drop-shadow-glow"
                  >
                    {link}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-neutral-300 mb-4 sm:mb-0">
              © {new Date().getFullYear()} SynergySphere. Crafted with ❤️ for productivity.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-neutral-300 hover:text-accent-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-neutral-300 hover:text-accent-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-neutral-300 hover:text-accent-400 transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
