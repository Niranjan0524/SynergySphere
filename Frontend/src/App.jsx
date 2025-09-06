import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppRoutes } from './routes/Routes';
import TestNavigation from './components/TestNavigation';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
            <AppRoutes />
            {/* Remove this in production */}
            {process.env.NODE_ENV === 'development'}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
