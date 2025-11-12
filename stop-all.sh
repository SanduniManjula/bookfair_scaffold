#!/bin/bash

# Script to stop all services for the Bookfair application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="$PROJECT_ROOT/.service-pids"

print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null)
    
    if [ -z "$pids" ]; then
        return 0
    fi
    
    for pid in $pids; do
        kill $pid 2>/dev/null || true
        print_message "Stopped process on port $port (PID: $pid)"
    done
}

print_message "Stopping all Bookfair services..."

# Stop services by PID file
if [ -f "$PID_FILE" ]; then
    while read pid; do
        if kill -0 $pid 2>/dev/null; then
            kill $pid 2>/dev/null || true
            print_message "Stopped process with PID $pid"
        fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
else
    print_warning "PID file not found. Attempting to stop services by port..."
fi

# Also try to stop by port (in case PID file is missing)
kill_port 8081  # user-service
kill_port 8082  # reservation-service
kill_port 8083  # email-service
kill_port 8084  # employee-service
kill_port 3000  # frontend

# Kill any Java processes that might be Spring Boot apps
# This is a fallback - be careful with this in shared environments
print_message "Checking for remaining Spring Boot processes..."
pkill -f "spring-boot:run" 2>/dev/null || true

# Kill any Node processes running Next.js
print_message "Checking for remaining Next.js processes..."
pkill -f "next dev" 2>/dev/null || true

print_message "All services stopped!"

