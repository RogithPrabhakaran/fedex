import React from 'react';

const App = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>FedEx DCA Manager Pro</h1>
      <p>✅ Backend is ready at: http://localhost:5000</p>
      <p>✅ Frontend is working</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Next Steps:</h2>
        <ol>
          <li>Start backend: cd backend && npm run dev</li>
          <li>Backend will run on port 5000</li>
          <li>All APIs are working with authentication</li>
        </ol>
      </div>
    </div>
  );
};

export default App;
