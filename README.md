# Bookfair Reservation System - Scaffold
This repo contains a starter backend (Spring Boot) and frontend (Next.js) scaffold.
Customize JWT, email, and full features as required by the project.

## Quick Start

### Starting All Services

To start all services at once (backend services + frontend):

```bash
./start-all.sh
```

This will start:
- User Auth Service (port 8081)
- Reservation Service (port 8082)
- Email Service (port 8083)
- QR Service (port 8084)
- Employee Service (port 8085)
- Frontend (port 3000)

All logs will be written to the `logs/` directory.

### Stopping All Services

To stop all services:

```bash
./stop-all.sh
```

Or press `Ctrl+C` if you started them with `./start-all.sh`.

### Starting Individual Services

You can also start services individually:

**Backend Services:**
```bash
cd backend/[service-name]
mvn spring-boot:run
```

Or if the service has a `run.sh` script:
```bash
cd backend/[service-name]
./run.sh
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## Services

- **user-auth-service**: User authentication and authorization (port 8081)
- **reservation-service**: Stall reservation management (port 8082)
- **email-service**: Email sending functionality (port 8083)
- **qr-service**: QR code generation (port 8084)
- **employee-service**: Employee management (port 8085)
- **frontend**: Next.js web application (port 3000)

## Requirements

- Java 17+ and Maven for backend services
- Node.js and npm for frontend
- MySQL database (see `backend/ENV_SETUP.md` for configuration)

## Database Setup

This project uses **database per service** pattern (true microservices):

1. **Create databases:**
   ```bash
   mysql -u root -p < backend/setup-databases.sql
   ```

2. **Databases created:**
   - `bookfair_user_db` - User Auth Service (users, reservations, stalls, map_layouts)
   - `bookfair_employee_db` - Employee Service (employees)

3. **See `backend/DATABASE_PER_SERVICE.md` for detailed documentation**
