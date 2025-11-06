# Clear Database Data

This guide explains how to clear previous reservation data from the database.

## Option 1: Using SQL Scripts (Direct Database Access)

### Clear Reservations Only
Run the SQL script to clear all reservations and reset stall statuses:

```bash
mysql -u root -p bookfair_db < clear_reservations.sql
```

Or manually in MySQL:
```sql
USE bookfair_db;
DELETE FROM reservations;
UPDATE stalls SET reserved = false;
```

### Clear All Data (Reservations + Map Layouts)
Run the SQL script to clear all data:

```bash
mysql -u root -p bookfair_db < clear_all_data.sql
```

## Option 2: Using Admin API Endpoints

### Clear Reservations Only
Make a DELETE request to the admin endpoint:

```bash
curl -X DELETE http://localhost:8081/api/admin/clear-reservations \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Clear All Data (Reservations + Map Layouts)
Make a DELETE request to clear all data:

```bash
# Clear reservations and map layouts only
curl -X DELETE http://localhost:8081/api/admin/clear-all-data \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Clear reservations, map layouts, AND all non-admin users
curl -X DELETE "http://localhost:8081/api/admin/clear-all-data?includeUsers=true" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Option 3: Using Admin Panel (Frontend)

If you have an admin panel UI, you can add buttons to call these endpoints.

## What Gets Cleared

### `/api/admin/clear-reservations`
- ✅ All reservations
- ✅ All stalls reset to `reserved = false`
- ❌ Map layouts (kept)
- ❌ Users (kept)

### `/api/admin/clear-all-data`
- ✅ All reservations
- ✅ All stalls reset to `reserved = false`
- ✅ All map layouts
- ❌ Users (kept by default, unless `includeUsers=true`)

## Database Connection Details

Default connection (from `application.properties`):
- Database: `bookfair_db`
- Host: `localhost:3306`
- Username: `root`
- Password: `Nipuni00@@` (or set via environment variable)

## Important Notes

⚠️ **Warning**: These operations are irreversible! Make sure to backup your data before clearing.

⚠️ **Admin Access Required**: API endpoints require admin authentication token.

⚠️ **Users**: By default, users are NOT deleted. Only set `includeUsers=true` if you want to remove all non-admin users.

