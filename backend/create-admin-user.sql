-- Script to create or update an admin user
-- Usage: mysql -u root -p bookfair_user_db < create-admin-user.sql

USE bookfair_user_db;

-- Show current users
SELECT 'Current Users:' AS info;
SELECT id, email, username, role, createdAt FROM users;

-- Create admin user (if doesn't exist)
-- Password: admin123 (will be hashed)
INSERT INTO users (business_name, email, password, role, genres, createdAt)
SELECT 'Admin User', 'admin@bookfair.com', '$2a$10$rKqXqXqXqXqXqXqXqXqXueXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq', 'ADMIN', NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@bookfair.com');

-- Update existing user to admin (uncomment and set email)
-- UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';

-- Show updated users
SELECT 'Updated Users:' AS info;
SELECT id, email, username, role, createdAt FROM users WHERE role = 'ADMIN';

