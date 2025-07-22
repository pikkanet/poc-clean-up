import React, { useState } from 'react';
import ApiComponent from './ApiComponent.tsx';

function App() {
  const [showApiComponent, setShowApiComponent] = useState(true);

  const toggleComponent = () => {
    setShowApiComponent(prev => !prev);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>React API Interval Hook Demo</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={toggleComponent}
          style={{
            padding: '10px 20px',
            backgroundColor: showApiComponent ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          {showApiComponent ? '🗑️ Unmount Component' : '🚀 Mount Component'}
        </button>
      </div>

      {showApiComponent ? (
        <ApiComponent />
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa',
          border: '2px dashed #dee2e6',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          <h3>Component Unmounted</h3>
          <p>API calls and intervals have been cleaned up</p>
          <p>Click "Mount Component" to restore it</p>
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#e9ecef',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4>How it works:</h4>
        <ul style={{ textAlign: 'left', paddingLeft: '20px' }}>
          <li>Component automatically fetches data every 5 seconds</li>
          <li>When unmounted, all API requests are cancelled</li>
          <li>Intervals are cleared to prevent memory leaks</li>
          <li>AbortController cancels any pending requests</li>
        </ul>
      </div>
    </div>
  );
}

export default App;