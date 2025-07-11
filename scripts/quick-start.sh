#!/bin/bash

# 🚢 Cargo Shipment Tracker - Quick Start Script
# This script sets up the entire development environment with one command

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check system requirements
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_NODE="18.0.0"
        if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_NODE" ]; then
            print_success "Node.js $NODE_VERSION is installed ✓"
        else
            print_error "Node.js $REQUIRED_NODE or higher is required. Current: $NODE_VERSION"
            exit 1
        fi
    else
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_success "npm $NPM_VERSION is installed ✓"
    else
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Git
    if command_exists git; then
        GIT_VERSION=$(git --version | cut -d' ' -f3)
        print_success "Git $GIT_VERSION is installed ✓"
    else
        print_error "Git is not installed. Please install Git from https://git-scm.com/"
        exit 1
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker $DOCKER_VERSION is installed ✓"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not installed. Database setup will require manual installation."
        DOCKER_AVAILABLE=false
    fi
    
    # Check Docker Compose (optional)
    if command_exists docker-compose; then
        COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
        print_success "Docker Compose $COMPOSE_VERSION is installed ✓"
        COMPOSE_AVAILABLE=true
    else
        print_warning "Docker Compose is not installed."
        COMPOSE_AVAILABLE=false
    fi
}

# Function to clone repository
clone_repository() {
    print_status "Cloning Cargo Shipment Tracker repository..."
    
    if [ -d "cargo-shipment-tracker" ]; then
        print_warning "Directory 'cargo-shipment-tracker' already exists. Skipping clone."
        cd cargo-shipment-tracker
    else
        git clone https://github.com/username/cargo-shipment-tracker.git
        cd cargo-shipment-tracker
        print_success "Repository cloned successfully ✓"
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    print_success "Frontend dependencies installed ✓"
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd ../backend
    npm install
    print_success "Backend dependencies installed ✓"
    
    cd ..
}

# Function to setup environment files
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        if [ -f "backend/.env.example" ]; then
            cp backend/.env.example backend/.env
            print_success "Backend .env file created from template ✓"
        else
            print_warning "Backend .env.example not found. Creating basic .env file."
            cat > backend/.env << EOF
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cargo_tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:5173
EOF
        fi
    else
        print_warning "Backend .env file already exists. Skipping."
    fi
    
    # Frontend environment
    if [ ! -f "frontend/.env" ]; then
        if [ -f "frontend/.env.example" ]; then
            cp frontend/.env.example frontend/.env
            print_success "Frontend .env file created from template ✓"
        else
            print_warning "Frontend .env.example not found. Creating basic .env file."
            cat > frontend/.env << EOF
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
EOF
        fi
    else
        print_warning "Frontend .env file already exists. Skipping."
    fi
}

# Function to setup databases
setup_databases() {
    if [ "$DOCKER_AVAILABLE" = true ] && [ "$COMPOSE_AVAILABLE" = true ]; then
        print_status "Setting up databases with Docker..."
        docker-compose up -d mongodb redis
        print_success "Databases started with Docker ✓"
        
        # Wait for databases to be ready
        print_status "Waiting for databases to be ready..."
        sleep 10
        print_success "Databases should be ready ✓"
    else
        print_warning "Docker not available. Please install MongoDB and Redis manually:"
        echo "  MongoDB: https://www.mongodb.com/try/download/community"
        echo "  Redis: https://redis.io/download"
        echo ""
        echo "Or install with package managers:"
        echo "  macOS: brew install mongodb-community redis"
        echo "  Ubuntu: sudo apt install mongodb redis-server"
    fi
}

# Function to start development servers
start_servers() {
    print_status "Starting development servers..."
    
    # Create start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

# Function to cleanup on exit
cleanup() {
    echo "Stopping development servers..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Trap cleanup function on script exit
trap cleanup EXIT

echo "🚢 Starting Cargo Shipment Tracker Development Environment"
echo "=========================================================="

# Start backend
echo "Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "Starting frontend server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Development servers started!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api-docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
EOF
    
    chmod +x start-dev.sh
    print_success "Development start script created ✓"
}

# Function to display final instructions
display_instructions() {
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "To start the development environment:"
    echo "  ./start-dev.sh"
    echo ""
    echo "Or start services manually:"
    echo "  Terminal 1: cd backend && npm run dev"
    echo "  Terminal 2: cd frontend && npm run dev"
    echo ""
    echo "Access the application:"
    echo "  📱 Frontend:  http://localhost:5173"
    echo "  🔧 Backend:   http://localhost:5000"
    echo "  📚 API Docs:  http://localhost:5000/api-docs"
    echo ""
    echo "For more information, see the README.md file."
    echo ""
    print_success "Happy coding! 🚢"
}

# Main execution
main() {
    echo "🚢 Cargo Shipment Tracker - Quick Start Setup"
    echo "=============================================="
    echo ""
    
    check_requirements
    clone_repository
    install_dependencies
    setup_environment
    setup_databases
    start_servers
    display_instructions
}

# Run main function
main "$@"
