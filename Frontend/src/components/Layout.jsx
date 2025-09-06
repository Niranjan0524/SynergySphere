import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-primary-50/20 to-secondary-50/20 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 transition-all duration-500">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
