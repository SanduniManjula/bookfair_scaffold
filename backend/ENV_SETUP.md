# Environment Variables Setup Guide

## Why Use Environment Variables?

**Never commit sensitive credentials to version control!** Using environment variables:
- Keeps passwords and secrets out of your code
- Allows different configurations for development/production
- Makes it easier to share code without exposing credentials

## Setup Instructions

### 1. Email Service

1. Navigate to `backend/email-service/`
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your actual credentials:
   ```bash
   SPRING_MAIL_HOST=smtp.gmail.com
   SPRING_MAIL_PORT=587
   SPRING_MAIL_USERNAME=your_email@gmail.com
   SPRING_MAIL_PASSWORD=your_app_password_here
   ```

### 2. User Auth Service

1. Navigate to `backend/user-auth-service/`
2. Copy the example file:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and add your actual credentials:
   ```bash
   SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/bookfair_db?useSSL=false&allowPublicKeyRetrieval=true
   SPRING_DATASOURCE_USERNAME=root
   SPRING_DATASOURCE_PASSWORD=your_database_password
   EMAIL_SERVICE_URL=http://localhost:8083
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRATION=86400000
   ```

## Running Services

### Option 1: Using the run.sh script (Recommended)

The run scripts automatically load your `.env` file:

```bash
# Email Service
cd backend/email-service
./run.sh

# User Auth Service (in another terminal)
cd backend/user-auth-service
./run.sh
```

### Option 2: Manual Environment Variables

You can also set environment variables manually:

```bash
# Email Service
cd backend/email-service
export SPRING_MAIL_USERNAME=your_email@gmail.com
export SPRING_MAIL_PASSWORD=your_app_password
mvn spring-boot:run
```

### Option 3: Source .env file manually

```bash
# Email Service
cd backend/email-service
source .env  # or: export $(cat .env | grep -v '^#' | xargs)
mvn spring-boot:run
```

## Important Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Share `.env.example` files** - These are safe to commit as templates
3. **Update `.env.example`** - When you add new environment variables, update the example files
4. **Use strong passwords** - Especially for JWT_SECRET and database passwords

## Environment Variables Reference

### Email Service
- `SPRING_MAIL_HOST` - SMTP server host (default: smtp.gmail.com)
- `SPRING_MAIL_PORT` - SMTP server port (default: 587)
- `SPRING_MAIL_USERNAME` - Email username
- `SPRING_MAIL_PASSWORD` - Email password/app password

### User Auth Service
- `SPRING_DATASOURCE_URL` - Database connection URL
- `SPRING_DATASOURCE_USERNAME` - Database username
- `SPRING_DATASOURCE_PASSWORD` - Database password
- `EMAIL_SERVICE_URL` - Email service URL (default: http://localhost:8083)
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRATION` - JWT expiration time in milliseconds (default: 86400000)

## Gmail App Password Setup

If using Gmail, you need to:
1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App Passwords
3. Generate a new app password for "Mail"
4. Use that 16-character password (without spaces) in your `.env` file

