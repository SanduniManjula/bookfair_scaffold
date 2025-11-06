-- Script to clear ALL data from the database (use with caution!)
-- This will delete:
-- 1. All reservations
-- 2. All users (except admins - commented out)
-- 3. Reset all stalls to unreserved status
-- 4. Clear map layouts

USE bookfair_db;

-- Delete all reservations
DELETE FROM reservations;

-- Reset all stalls to unreserved status
UPDATE stalls SET reserved = false;

-- Clear map layouts
DELETE FROM map_layouts;

-- Optional: Delete all regular users (keeps admins)
-- Uncomment the following lines if you want to delete all non-admin users:
-- DELETE FROM users WHERE role != 'ADMIN';

-- Show confirmation
SELECT 'All data cleared successfully' AS message;
SELECT COUNT(*) AS remaining_reservations FROM reservations;
SELECT COUNT(*) AS remaining_users FROM users;
SELECT COUNT(*) AS total_stalls, SUM(CASE WHEN reserved = true THEN 1 ELSE 0 END) AS reserved_stalls FROM stalls;
SELECT COUNT(*) AS remaining_map_layouts FROM map_layouts;

