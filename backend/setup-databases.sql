-- Database Setup Script for True Microservices Architecture
-- This script creates separate databases for each service

-- Create database for User Service
-- Contains: users
CREATE DATABASE IF NOT EXISTS bookfair_user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Reservation Service
-- Contains: reservations, stalls, map_layouts
CREATE DATABASE IF NOT EXISTS bookfair_reservation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Employee Service
-- Contains: employees
CREATE DATABASE IF NOT EXISTS bookfair_employee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Note: Email Service is stateless and doesn't need a database

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON bookfair_user_db.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON bookfair_reservation_db.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON bookfair_employee_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Databases created successfully!' AS Status;

