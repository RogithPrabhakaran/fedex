#!/bin/bash
cd "/run/media/rogithpm/New Volume/Projects/Fedex/fedex-dca-manager-pro/frontend"
rm -rf node_modules package-lock.json
rm -f *.tsx *.ts *.js vite.config.ts tsconfig.json tailwind.config.js postcss.config.js
rm -rf views services components

cat > package.json << 'EOF'
{
  "name": "fedex-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}
EOF

cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
})
EOF

cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>FedEx DCA Manager</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
EOF

mkdir -p src
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'

function App() {
  return <h1>FedEx DCA Manager Pro - Working!</h1>
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
EOF

npm install
npm run dev
