-- Script to make an existing user an admin
-- Usage: mysql -u root -p bookfair_user_db < make-user-admin.sql
-- Or run: mysql -u root -p bookfair_user_db -e "UPDATE users SET role = 'ADMIN' WHERE email = 'your-email@example.com';"

USE bookfair_user_db;

-- Show current users
SELECT '=== Current Users ===' AS info;
SELECT id, email, business_name as username, role FROM users;

-- Make existing user admin (update email as needed)
-- UPDATE users SET role = 'ADMIN' WHERE email = 'sasandamanahara@gmail.com';

-- Show all admin users
SELECT '=== All Admin Users ===' AS info;
SELECT id, email, business_name as username, role FROM users WHERE role = 'ADMIN';

