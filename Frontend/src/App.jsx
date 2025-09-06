import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/Routes';
import TestNavigation from './components/TestNavigation';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          {/* Remove this in production */}
          {process.env.NODE_ENV === 'development' && <TestNavigation />}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
