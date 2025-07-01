# Deployment Guide

This guide covers different deployment options for the Cargo Shipment Tracker application.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB database
- Git

## Local Development

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd cargo-shipment-tracker
   
   # For Linux/Mac
   chmod +x start.sh
   ./start.sh
   
   # For Windows
   start.bat
   ```

2. **Manual Setup**
   ```bash
   # Install dependencies
   npm run install-all
   
   # Set up environment files
   cp .env.example .env
   cp cargo-shipment-tracker/.env.example cargo-shipment-tracker/.env
   
   # Start MongoDB (varies by system)
   # Ubuntu: sudo systemctl start mongod
   # macOS: brew services start mongodb/brew/mongodb-community
   # Windows: net start MongoDB
   
   # Start backend
   npm start
   
   # In new terminal, start frontend
   cd cargo-shipment-tracker
   npm start
   ```

3. **Seed Sample Data** (Optional)
   ```bash
   npm run seed
   ```

## Production Deployment

### Option 1: Traditional Server (VPS/Dedicated)

1. **Server Setup**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install MongoDB
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   
   # Start MongoDB
   sudo systemctl start mongod
   sudo systemctl enable mongod
   
   # Install PM2 for process management
   sudo npm install -g pm2
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd cargo-shipment-tracker
   
   # Install dependencies
   npm run install-all
   
   # Build frontend
   cd cargo-shipment-tracker
   npm run build
   cd ..
   
   # Set up environment
   cp .env.example .env
   # Edit .env with production values
   
   # Start with PM2
   pm2 start server.js --name "cargo-tracker-api"
   pm2 startup
   pm2 save
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Frontend
       location / {
           root /path/to/cargo-shipment-tracker/cargo-shipment-tracker/build;
           try_files $uri $uri/ /index.html;
       }
       
       # API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Health check
       location /health {
           proxy_pass http://localhost:5000;
       }
   }
   ```

### Option 2: Docker Deployment

1. **Create Dockerfile for Backend**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   
   EXPOSE 5000
   
   CMD ["node", "server.js"]
   ```

2. **Create Dockerfile for Frontend**
   ```dockerfile
   FROM node:18-alpine as build
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=build /app/build /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   
   CMD ["nginx", "-g", "daemon off;"]
   ```

3. **Docker Compose**
   ```yaml
   version: '3.8'
   
   services:
     mongodb:
       image: mongo:6.0
       container_name: cargo-tracker-db
       restart: unless-stopped
       ports:
         - "27017:27017"
       volumes:
         - mongodb_data:/data/db
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password123
   
     backend:
       build: .
       container_name: cargo-tracker-api
       restart: unless-stopped
       ports:
         - "5000:5000"
       environment:
         MONGODB_URI: mongodb://admin:password123@mongodb:27017/cargo-tracker?authSource=admin
         NODE_ENV: production
       depends_on:
         - mongodb
   
     frontend:
       build: ./cargo-shipment-tracker
       container_name: cargo-tracker-web
       restart: unless-stopped
       ports:
         - "80:80"
       depends_on:
         - backend
   
   volumes:
     mongodb_data:
   ```

### Option 3: Cloud Deployment (Heroku)

1. **Backend Deployment**
   ```bash
   # Install Heroku CLI
   # Create Heroku app
   heroku create cargo-tracker-api
   
   # Add MongoDB Atlas
   heroku addons:create mongolab:sandbox
   
   # Set environment variables
   heroku config:set NODE_ENV=production
   
   # Deploy
   git push heroku main
   ```

2. **Frontend Deployment (Netlify/Vercel)**
   ```bash
   # Build settings for Netlify
   # Build command: npm run build
   # Publish directory: build
   
   # Environment variables
   REACT_APP_API_URL=https://your-heroku-app.herokuapp.com/api
   ```

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/cargo-tracker
PORT=5000
NODE_ENV=production
```

### Frontend (cargo-shipment-tracker/.env)
```env
REACT_APP_API_URL=https://your-api-domain.com/api
NODE_ENV=production
```

## Security Considerations

1. **Database Security**
   - Enable MongoDB authentication
   - Use strong passwords
   - Restrict network access
   - Regular backups

2. **API Security**
   - Implement rate limiting
   - Add authentication/authorization
   - Use HTTPS in production
   - Validate all inputs

3. **Frontend Security**
   - Never expose API keys
   - Use environment variables
   - Implement CSP headers

## Monitoring and Maintenance

1. **Logging**
   ```bash
   # PM2 logs
   pm2 logs cargo-tracker-api
   
   # MongoDB logs
   sudo tail -f /var/log/mongodb/mongod.log
   ```

2. **Health Checks**
   - API: `GET /health`
   - Database connectivity
   - Disk space monitoring
   - Memory usage

3. **Backup Strategy**
   ```bash
   # MongoDB backup
   mongodump --db cargo-tracker --out /backup/$(date +%Y%m%d)
   
   # Automated backup script
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   mongodump --db cargo-tracker --out /backup/$DATE
   find /backup -type d -mtime +7 -exec rm -rf {} +
   ```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

2. **Frontend Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables

3. **API Errors**
   - Check server logs
   - Verify database connectivity
   - Check port availability

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // Add indexes for better query performance
   db.shipments.createIndex({ "containerId": 1 })
   db.shipments.createIndex({ "status": 1 })
   db.shipments.createIndex({ "createdAt": -1 })
   ```

2. **Frontend Optimization**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading
   - Optimize images

3. **Backend Optimization**
   - Implement caching
   - Use connection pooling
   - Add request compression
   - Monitor memory usage
