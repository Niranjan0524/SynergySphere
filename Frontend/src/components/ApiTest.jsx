import React, { useState } from 'react';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLoginAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.json();
      setTestResult(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRegisterAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        }),
      });

      const data = await response.json();
      setTestResult(`Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setTestResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">API Test</h2>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testRegisterAPI}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 mr-4"
        >
          Test Register API
        </button>
        
        <button
          onClick={testLoginAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Test Login API
        </button>
      </div>

      {loading && <p>Loading...</p>}
      
      {testResult && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
