-- Script to clear all reservation data from the database
-- This will:
-- 1. Delete all reservations
-- 2. Reset all stalls to unreserved status
-- 3. Optionally clear map layouts (commented out by default)

USE bookfair_db;

-- Delete all reservations
DELETE FROM reservations;

-- Reset all stalls to unreserved status
UPDATE stalls SET reserved = false;

-- Optional: Clear map layouts (uncomment if you want to remove saved map layouts)
-- DELETE FROM map_layouts;

-- Show confirmation
SELECT 'All reservations cleared and stalls reset to unreserved status' AS message;
SELECT COUNT(*) AS remaining_reservations FROM reservations;
SELECT COUNT(*) AS total_stalls, SUM(CASE WHEN reserved = true THEN 1 ELSE 0 END) AS reserved_stalls FROM stalls;

