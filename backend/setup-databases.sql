-- Database Setup Script for True Microservices Architecture
-- This script creates separate databases for each service

-- Create database for User Auth Service
-- Contains: users, reservations, stalls, map_layouts
CREATE DATABASE IF NOT EXISTS bookfair_user_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create database for Employee Service
-- Contains: employees
CREATE DATABASE IF NOT EXISTS bookfair_employee_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Note: Email Service and QR Service are stateless and don't need databases

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON bookfair_user_db.* TO 'root'@'localhost';
-- GRANT ALL PRIVILEGES ON bookfair_employee_db.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

SELECT 'Databases created successfully!' AS Status;

