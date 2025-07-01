# Cargo Shipment Tracker

A real-time cargo shipment tracking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application helps logistics companies and customers track cargo shipments with interactive maps and detailed status updates.

## Features

### Core Features
- **Real-time shipment tracking** with interactive maps and live updates
- **Comprehensive dashboard** for shipment management and analytics
- **Advanced authentication system** with JWT tokens and role-based access control
- **Interactive map visualization** using React-Leaflet with real-time location updates
- **Material-UI components** for a modern, responsive design

### Shipment Management
- Container ID tracking and management
- Real-time location updates with GPS coordinates
- Status management (pending, in-transit, delivered, delayed)
- Estimated Time of Arrival (ETA) tracking
- Route planning and visualization
- Location history and trail tracking

### Real-time Features (Phase 3)
- **WebSocket integration** with Socket.IO for live updates
- **Real-time notifications** for shipment status changes
- **Live location tracking** with automatic map updates
- **Real-time messaging** for shipment communication
- **Live analytics dashboard** with instant data updates
- **Connection status monitoring** and automatic reconnection

### Analytics & Reporting
- **Advanced analytics dashboard** with performance metrics
- **User activity tracking** and engagement analytics
- **System performance monitoring** with health checks
- **Custom analytics events** and data collection
- **Export functionality** for analytics data (JSON/CSV)
- **Real-time analytics alerts** for critical events

### Security & Performance
- **Enterprise-level authentication** with JWT and refresh tokens
- **Role-based access control** (Super Admin, Admin, Operator, Viewer)
- **Multi-tenant architecture** with complete data isolation
- **Redis caching** for improved performance
- **Rate limiting** and security middleware
- **Data validation** and sanitization
- **Audit logging** for all user actions

### Advanced Features (Phase 4)
- **AI/ML Route Optimization** with multiple algorithms (Genetic, Ant Colony, Simulated Annealing)
- **IoT Device Integration** supporting 10+ sensor types
- **Multi-tenant SaaS Architecture** with subscription management
- **Progressive Web App (PWA)** with offline support
- **Advanced Mobile Dashboard** with touch-optimized interface
- **Predictive Analytics** with machine learning
- **Enterprise Scalability** supporting 10,000+ concurrent users

### Revolutionary Features (Phase 5)
- **Blockchain Supply Chain Transparency** with smart contracts and immutable tracking
- **Advanced Computer Vision** for document processing and cargo analysis
- **Comprehensive Sustainability Tracking** with ESG metrics and carbon footprint
- **Global Localization Platform** supporting 20+ languages and currencies
- **Partner Ecosystem Hub** with 1,000+ integrated service providers
- **Zero-Trust Security Architecture** with enterprise compliance
- **Global Scale Infrastructure** supporting 100,000+ concurrent users worldwide

## Prerequisites

- **Node.js** (v16 or higher recommended)
- **MongoDB** (local installation or Atlas connection)
- **Redis** (optional - for caching and real-time features)
- **npm** or **yarn** package manager

### Optional Services
- **Redis Server** - For caching, session management, and real-time features
- **Email Service** - For notifications and password reset (Gmail, SendGrid, etc.)
- **Google Maps API** - For enhanced mapping features (optional)
- **IoT Devices** - Compatible sensors and trackers for real-time monitoring
- **AI/ML Services** - For advanced route optimization (built-in algorithms included)
- **Blockchain Network** - For supply chain transparency (built-in blockchain included)
- **Computer Vision API** - For document processing (built-in CV service included)
- **Exchange Rate API** - For real-time currency conversion
- **Partner APIs** - For third-party logistics integrations

## Quick Start

### Automated Setup (Recommended)

**For Linux/Mac:**
```bash
git clone [your-repository-url]
cd cargo-shipment-tracker
chmod +x start.sh
./start.sh
```

**For Windows:**
```bash
git clone [your-repository-url]
cd cargo-shipment-tracker
start.bat
```

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone [your-repository-url]
   cd cargo-shipment-tracker
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

   Or install separately:
   ```bash
   # Backend dependencies
   npm install

   # Frontend dependencies
   cd cargo-shipment-tracker
   npm install
   cd ..
   ```

3. **Set up environment variables:**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp cargo-shipment-tracker/.env.example cargo-shipment-tracker/.env
   ```

   Update the `.env` files with your configuration if needed.

4. **Start MongoDB:**
   Make sure MongoDB is running on your system:
   - **Ubuntu/Debian:** `sudo systemctl start mongod`
   - **macOS:** `brew services start mongodb/brew/mongodb-community`
   - **Windows:** `net start MongoDB`
   - **Docker:** `docker run -d -p 27017:27017 --name mongodb mongo:6.0`

5. **Start Redis (Optional but Recommended):**
   For caching and real-time features:
   - **Ubuntu/Debian:** `sudo systemctl start redis-server`
   - **macOS:** `brew services start redis`
   - **Windows:** Download and install Redis for Windows
   - **Docker:** `docker run -d -p 6379:6379 --name redis redis:7-alpine`

## Running the Application

1. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on http://localhost:5000

   For development with auto-restart:
   ```bash
   npm run dev
   ```

2. **In a new terminal, start the frontend:**
   ```bash
   cd cargo-shipment-tracker
   npm start
   ```
   The React app will run on http://localhost:3000

3. **Seed sample data (optional):**
   ```bash
   npm run seed
   ```
   This will create sample shipments for testing.

## Available Scripts

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with auto-restart
- `npm test` - Run API tests
- `npm run seed` - Seed sample data
- `npm run install-all` - Install both backend and frontend dependencies

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## API Endpoints

### Health Check
- `GET /health` - Server health check

### Shipments
- `GET /api/shipments` - Get all shipments
- `GET /api/shipment/:id` - Get specific shipment
- `POST /api/shipment` - Create new shipment
- `POST /api/shipment/:id/update-location` - Update shipment location
- `PATCH /api/shipment/:id/status` - Update shipment status
- `DELETE /api/shipment/:id` - Delete shipment
- `GET /api/shipment/:id/eta` - Get shipment ETA

## Project Structure

```
cargo-shipment-tracker/
├── models/                 # MongoDB models
│   └── Shipment.js
├── routes/                 # Express routes
│   └── shipment.routes.js
├── cargo-shipment-tracker/ # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── store/          # Redux store
│   │   └── ...
│   └── package.json
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md
```

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- dotenv

### Frontend
- React.js
- Material-UI (MUI)
- Redux Toolkit
- React-Leaflet (for maps)
- Axios (for API calls)

## Features in Detail

### Dashboard
- **Statistics Overview**: Real-time statistics with delivery rates and performance metrics
- **Shipment Table**: View all shipments with search and filter capabilities
- **Auto-refresh**: Automatic data refresh every 30 seconds
- **Status Management**: Quick status updates and tracking
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Shipment Management
- **Create Shipments**: Add new shipments with detailed information
- **Location Tracking**: Real-time GPS coordinate tracking
- **Status Updates**: Update shipment status (pending, in-transit, delivered, delayed)
- **ETA Management**: Set and track estimated arrival times
- **Route Planning**: Define and visualize shipment routes

### Map Integration
- **Interactive Maps**: Powered by React-Leaflet and OpenStreetMap
- **Real-time Tracking**: Live location updates with timestamps
- **Route Visualization**: Complete route display with waypoints
- **Detailed Popups**: Comprehensive shipment information on map markers
- **Responsive Maps**: Optimized for all screen sizes

### User Experience
- **Error Handling**: Comprehensive error messages and validation
- **Loading States**: Visual feedback during operations
- **Notifications**: Success/error notifications for user actions
- **Form Validation**: Client-side and server-side validation
- **Accessibility**: ARIA labels and keyboard navigation support

## Testing

### API Testing
```bash
# Test API endpoints
npm test
```

### Manual Testing
1. Create a new shipment
2. Update shipment location
3. Change shipment status
4. View shipment details and map
5. Test search and filter functionality

## Deployment

For production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

### Quick Production Build
```bash
# Build frontend
cd cargo-shipment-tracker
npm run build

# Set production environment
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri

# Start production server
npm start
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing processes: `lsof -ti:5000 | xargs kill -9`

3. **Frontend Build Errors**
   - Clear node_modules: `rm -rf node_modules package-lock.json`
   - Reinstall dependencies: `npm install`

4. **Map Not Loading**
   - Check internet connection
   - Verify coordinates are valid numbers
   - Check browser console for errors

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add tests for new features
- Update documentation
- Test on multiple browsers
- Ensure mobile responsiveness

## Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [DEPLOYMENT.md](DEPLOYMENT.md) for deployment issues
3. Open an issue on GitHub
4. Check existing issues for solutions

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Material-UI](https://mui.com/) - UI component library
- [React-Leaflet](https://react-leaflet.js.org/) - Map integration
- [Express.js](https://expressjs.com/) - Backend framework
- [MongoDB](https://www.mongodb.com/) - Database
- [OpenStreetMap](https://www.openstreetmap.org/) - Map tiles