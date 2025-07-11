const express = require('express');

const app = express();
const PORT = 5001; // Use different port

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({
    success: true,
    message: 'Minimal server is working',
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/health`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    process.exit(0);
  });
});
