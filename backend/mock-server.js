const http = require('http');
const url = require('url');

const PORT = 5000;

// Mock users database
const users = [
  {
    _id: '1',
    firstName: 'System',
    lastName: 'Administrator',
    fullName: 'System Administrator',
    email: 'admin@cargotracker.com',
    password: 'Admin123!@#', // In real app, this would be hashed
    role: 'admin',
    department: 'IT Administration',
    phone: '+1234567890',
    isActive: true,
    lastLogin: new Date().toISOString()
  },
  {
    _id: '2',
    firstName: 'John',
    lastName: 'Manager',
    fullName: 'John Manager',
    email: 'manager@cargotracker.com',
    password: 'Manager123!@#',
    role: 'manager',
    department: 'Operations',
    phone: '+1234567891',
    isActive: true,
    lastLogin: new Date().toISOString()
  },
  {
    _id: '3',
    firstName: 'Jane',
    lastName: 'User',
    fullName: 'Jane User',
    email: 'user@cargotracker.com',
    password: 'User123!@#',
    role: 'user',
    department: 'Customer Service',
    phone: '+1234567892',
    isActive: true,
    lastLogin: new Date().toISOString()
  }
];

// Mock JWT token
const generateMockToken = (user) => {
  return `mock-jwt-token-${user._id}-${Date.now()}`;
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;
  
  console.log(`${new Date().toISOString()} - ${method} ${path}`);
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Content-Type', 'application/json');
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Parse request body for POST/PUT requests
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    let requestData = {};
    if (body) {
      try {
        requestData = JSON.parse(body);
      } catch (e) {
        console.error('Error parsing JSON:', e);
      }
    }
    
    // Health check
    if (path === '/api/health' && method === 'GET') {
      const response = {
        success: true,
        message: 'Mock server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }
    
    // Login endpoint
    if (path === '/api/auth/login' && method === 'POST') {
      const { email, password } = requestData;
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        const token = generateMockToken(user);
        const userResponse = { ...user };
        delete userResponse.password;
        
        const response = {
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: userResponse
          }
        };
        
        // Set cookie
        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800`);
        res.writeHead(200);
        res.end(JSON.stringify(response));
      } else {
        const response = {
          success: false,
          message: 'Invalid email or password'
        };
        res.writeHead(401);
        res.end(JSON.stringify(response));
      }
      return;
    }
    
    // Get current user
    if (path === '/api/auth/me' && method === 'GET') {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        // Mock token validation - in real app, verify JWT
        if (token.startsWith('mock-jwt-token-')) {
          const userId = token.split('-')[3];
          const user = users.find(u => u._id === userId);
          if (user) {
            const userResponse = { ...user };
            delete userResponse.password;
            const response = {
              success: true,
              data: userResponse
            };
            res.writeHead(200);
            res.end(JSON.stringify(response));
            return;
          }
        }
      }
      
      const response = {
        success: false,
        message: 'Unauthorized'
      };
      res.writeHead(401);
      res.end(JSON.stringify(response));
      return;
    }
    
    // Logout endpoint
    if (path === '/api/auth/logout' && method === 'POST') {
      res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
      const response = {
        success: true,
        message: 'Logout successful'
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }
    
    // Mock shipments endpoint
    if (path === '/api/shipments' && method === 'GET') {
      const response = {
        success: true,
        data: [],
        message: 'Mock shipments endpoint'
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }
    
    // Mock stats endpoint
    if (path === '/api/stats' && method === 'GET') {
      const response = {
        success: true,
        data: {
          overview: {
            total: 0,
            pending: 0,
            inTransit: 0,
            delivered: 0,
            cancelled: 0
          }
        }
      };
      res.writeHead(200);
      res.end(JSON.stringify(response));
      return;
    }
    
    // 404 for other routes
    const response = {
      success: false,
      message: 'Route not found',
      path: path
    };
    res.writeHead(404);
    res.end(JSON.stringify(response));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Mock server running on port ${PORT}`);
  console.log(`🔗 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Login: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Demo credentials:`);
  console.log(`   Admin: admin@cargotracker.com / Admin123!@#`);
  console.log(`   Manager: manager@cargotracker.com / Manager123!@#`);
  console.log(`   User: user@cargotracker.com / User123!@#`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  server.close(() => {
    console.log('Mock server closed');
    process.exit(0);
  });
});
