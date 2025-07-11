const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Basic middleware only
app.use(cors());
app.use(express.json());

// Simple routes
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({
    success: true,
    message: 'Minimal Express server is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test', (req, res) => {
  console.log('Test route requested');
  res.json({
    success: true,
    message: 'Test route working'
  });
});

// Start server
console.log('Starting minimal Express server...');
const server = app.listen(PORT, () => {
  console.log(`🚀 Minimal Express server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
