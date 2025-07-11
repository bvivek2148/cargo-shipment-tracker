const http = require('http');
const url = require('url');

const PORT = 5002;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health check endpoint
  if (path === '/api/health' && req.method === 'GET') {
    const response = {
      success: true,
      message: 'Basic HTTP server is working',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  // Test endpoint
  if (path === '/api/test' && req.method === 'GET') {
    const response = {
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
    return;
  }
  
  // 404 for other routes
  const response = {
    success: false,
    message: 'Route not found',
    path: path
  };
  
  res.writeHead(404);
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Basic HTTP server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 Test endpoint: http://localhost:${PORT}/api/test`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down basic server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
