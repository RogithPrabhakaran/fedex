import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return React.createElement('div', null, 'Hello World');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
