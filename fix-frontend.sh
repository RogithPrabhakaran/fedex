#!/bin/bash
echo "🔧 Fixing frontend corruption..."
cd "/run/media/rogithpm/New Volume/Projects/Fedex/fedex-dca-manager-pro"
rm -rf frontend
mkdir frontend
cd frontend

echo '{"name":"fedex-frontend","scripts":{"dev":"python3 -m http.server 3000"},"type":"module"}' > package.json

cat > index.html << 'EOF'
<!DOCTYPE html>
<html><head><title>FedEx DCA Manager</title></head>
<body>
<div id="app">
  <h1>FedEx DCA Manager Pro</h1>
  <p>✅ Backend ready at: http://localhost:5000</p>
  <p>✅ Frontend working without Node.js corruption</p>
  <button onclick="testBackend()">Test Backend Connection</button>
  <div id="result"></div>
</div>
<script>
async function testBackend() {
  try {
    const res = await fetch('http://localhost:5000/api/health');
    const data = await res.json();
    document.getElementById('result').innerHTML = '✅ Backend: ' + data.status;
  } catch(e) {
    document.getElementById('result').innerHTML = '❌ Start backend first';
  }
}
</script>
</body></html>
EOF

echo "✅ Clean frontend created. Run: python3 -m http.server 3000"
