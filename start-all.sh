#!/bin/bash

# Script to start all services for the Bookfair application
# This script starts all backend services and the frontend

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# PID file to track running services
PID_FILE="$PROJECT_ROOT/.service-pids"

# Function to print colored messages
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_service() {
    echo -e "${BLUE}[SERVICE]${NC} $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    # Try the more specific check first, fallback to simpler check
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0
    elif lsof -ti :$port >/dev/null 2>&1 ; then
        return 0
    else
        return 1
    fi
}

# Function to start a backend service
start_backend_service() {
    local service_name=$1
    local service_dir="$BACKEND_DIR/$service_name"
    local port=$2
    
    if [ ! -d "$service_dir" ]; then
        print_error "Service directory not found: $service_dir"
        return 1
    fi
    
    print_service "Starting $service_name on port $port..."
    
    # Check if port is already in use
    if check_port $port; then
        print_warning "Port $port is already in use. Skipping $service_name"
        return 1
    fi
    
    cd "$service_dir"
    
    # Check if run.sh exists, otherwise use mvn directly
    if [ -f "run.sh" ]; then
        chmod +x run.sh
        ./run.sh > "$PROJECT_ROOT/logs/$service_name.log" 2>&1 &
    else
        mvn spring-boot:run > "$PROJECT_ROOT/logs/$service_name.log" 2>&1 &
    fi
    
    local pid=$!
    echo $pid >> "$PID_FILE"
    print_message "$service_name started with PID $pid (port $port)"
    
    # Wait a bit for service to start
    sleep 3
    
    # Check if process is still running
    if ! kill -0 $pid 2>/dev/null; then
        print_error "$service_name failed to start. Check logs/$service_name.log"
        return 1
    fi
    
    return 0
}

# Function to start frontend
start_frontend() {
    print_service "Starting frontend on port 3000..."
    
    if check_port 3000; then
        print_warning "Port 3000 is already in use. Skipping frontend"
        return 1
    fi
    
    cd "$FRONTEND_DIR"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_message "Installing frontend dependencies..."
        npm install
    fi
    
    npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
    local pid=$!
    echo $pid >> "$PID_FILE"
    print_message "Frontend started with PID $pid (port 3000)"
    
    sleep 3
    
    if ! kill -0 $pid 2>/dev/null; then
        print_error "Frontend failed to start. Check logs/frontend.log"
        return 1
    fi
    
    return 0
}

# Cleanup function
cleanup() {
    print_warning "\nShutting down all services..."
    if [ -f "$PID_FILE" ]; then
        while read pid; do
            if kill -0 $pid 2>/dev/null; then
                kill $pid 2>/dev/null || true
            fi
        done < "$PID_FILE"
        rm -f "$PID_FILE"
    fi
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

# Clear previous PID file
rm -f "$PID_FILE"

print_message "Starting all Bookfair services..."
echo ""

# Start backend services
start_backend_service "user-auth-service" 8081
start_backend_service "reservation-service" 8082
start_backend_service "email-service" 8083
start_backend_service "qr-service" 8084
start_backend_service "employee-service" 8085

echo ""

# Start frontend
start_frontend

echo ""
print_message "All services started successfully!"
echo ""
print_message "Service URLs:"
print_service "  - User Auth Service:    http://localhost:8081"
print_service "  - Reservation Service:  http://localhost:8082"
print_service "  - Email Service:        http://localhost:8083"
print_service "  - QR Service:           http://localhost:8084"
print_service "  - Employee Service:     http://localhost:8085"
print_service "  - Frontend:             http://localhost:3000"
echo ""
print_message "Logs are available in: $PROJECT_ROOT/logs/"
print_message "To stop all services, press Ctrl+C or run: ./stop-all.sh"
echo ""

# Wait for all background processes
wait

