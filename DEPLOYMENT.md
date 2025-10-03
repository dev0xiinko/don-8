# 🚀 DON-8 Deployment Guide

## Overview
This guide covers the complete deployment process for the DON-8 platform, including both frontend (Next.js) and backend (NestJS) components.

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│    Frontend         │    │     Backend         │    │    Database         │
│    Next.js          │────│     NestJS          │────│   PostgreSQL        │
│    Port: 3000       │    │     Port: 8000      │    │   Port: 5432        │
│                     │    │                     │    │                     │
│ • Health Monitoring │    │ • API Endpoints     │    │ • Prisma ORM        │
│ • React Hooks       │    │ • Authentication    │    │ • Migrations        │
│ • TypeScript        │    │ • CORS Enabled      │    │ • Schema            │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

## 🔧 Prerequisites

### System Requirements
- **Node.js**: v18.0.0 or higher
- **npm**: v8.0.0 or higher
- **PostgreSQL**: v13.0 or higher
- **Git**: Latest version

### Development Tools (Optional)
- **Docker**: For containerized deployment
- **PM2**: For production process management
- **Nginx**: For reverse proxy setup

## 📦 Installation & Setup

### 1. Clone Repository
```bash
git clone https://github.com/dev0xiinko/don-8.git
cd don-8
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Install ethers.js (if not already installed)
npm install ethers

# Create environment file
cp .env.example .env.local
```

**Environment Configuration (.env.local):**
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Wallet Connect Configuration
# NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# Optional: Blockchain Configuration
# NEXT_PUBLIC_INFURA_ID=your_infura_id
# NEXT_PUBLIC_CHAIN_ID=1
```

### 3. Backend Setup
```bash
# Navigate to backend directory
cd ../don8-backend-temp

# Install dependencies
npm install

# Setup environment file
cp .env.sample .env
```

**Backend Environment Configuration (.env):**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/don8_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"

# Server Configuration
PORT=8000

# Optional: Email Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Create database (if doesn't exist)
npx prisma db push

# Optional: Seed database with sample data
npx prisma db seed
```

## 🚀 Development Deployment

### Start Backend Server
```bash
cd don8-backend-temp
npm run start:dev
```
- **URL**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **Database Check**: http://localhost:8000/db-check

### Start Frontend Server
```bash
cd don-8
npm run dev
```
- **URL**: http://localhost:3000 (or next available port)
- **Health Dashboard**: http://localhost:3000/health

### Verify Integration
1. **Check Health Status**: Visit frontend and look for green connection indicator
2. **Test API**: Visit `/health` page for comprehensive status
3. **Monitor Console**: Check browser and terminal for any errors

## 🏭 Production Deployment

### Frontend (Next.js) Production Build
```bash
cd don-8

# Create optimized production build
npm run build

# Start production server
npm start
```

### Backend (NestJS) Production Build
```bash
cd don8-backend-temp

# Create production build
npm run build

# Start production server
npm run start:prod
```

### Process Management with PM2
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with PM2
cd don8-backend-temp
pm2 start dist/main.js --name "don8-backend"

# Start frontend with PM2
cd ../don-8
pm2 start npm --name "don8-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🐳 Docker Deployment

### Create Docker Compose Configuration
```yaml
version: '3.8'
services:
  # Database
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: don8_db
      POSTGRES_USER: don8_user
      POSTGRES_PASSWORD: don8_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # Backend
  backend:
    build: ./don8-backend-temp
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: "postgresql://don8_user:don8_password@postgres:5432/don8_db"
      JWT_SECRET: "your-jwt-secret"
    depends_on:
      - postgres

  # Frontend
  frontend:
    build: ./don-8
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: "http://backend:8000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

### Deploy with Docker
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔒 Security Configuration

### Environment Security
```bash
# Generate secure JWT secret
openssl rand -base64 64

# Set proper file permissions
chmod 600 .env
chmod 600 .env.local
```

### CORS Configuration
The backend is configured to allow connections from:
- http://localhost:3000
- http://localhost:3001  
- http://localhost:3002

**For production, update CORS in `main.ts`:**
```typescript
app.enableCors({
  origin: ['https://yourdomain.com'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

## 📊 Monitoring & Health Checks

### Health Endpoints
- **Backend Health**: `GET /health`
- **Database Check**: `GET /db-check`
- **Frontend Health**: Visit `/health` page

### Monitoring Setup
```bash
# Check backend status
curl http://localhost:8000/health

# Check database connectivity
curl http://localhost:8000/db-check

# Monitor logs
tail -f logs/application.log
```

### Performance Monitoring
The application includes built-in performance monitoring:
- **Response Time Tracking**
- **Connection Status Monitoring**
- **Real-time Health Indicators**

## 🔄 Database Management

### Migrations
```bash
# Create new migration
npx prisma migrate dev --name "migration-name"

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Backup & Restore
```bash
# Create database backup
pg_dump don8_db > backup.sql

# Restore from backup
psql don8_db < backup.sql
```

## 🌐 Reverse Proxy Setup (Nginx)

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📈 Scaling & Load Balancing

### Horizontal Scaling
```yaml
# docker-compose.yml with multiple replicas
services:
  backend:
    scale: 3
    # ... rest of backend config
```

### Load Balancer Configuration
```nginx
upstream backend {
    server localhost:8001;
    server localhost:8002;
    server localhost:8003;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
sudo service postgresql status

# Check connection
psql -h localhost -p 5432 -U username -d don8_db
```

#### 3. CORS Errors
- Verify frontend URL in backend CORS configuration
- Check browser network tab for exact error
- Ensure backend is running and accessible

#### 4. Health Status Shows Offline
- Confirm backend server is running on port 8000
- Test backend directly: `curl http://localhost:8000/health`
- Check `.env.local` file for correct `NEXT_PUBLIC_API_URL`

### Debug Commands
```bash
# Backend debugging
cd don8-backend-temp
npm run start:debug

# Frontend debugging
cd don-8
npm run dev -- --inspect

# Database debugging
npx prisma studio
```

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed (production)
- [ ] Domain DNS configured
- [ ] Firewall rules set up
- [ ] Monitoring tools installed

### Post-deployment
- [ ] Health endpoints responding
- [ ] Frontend-backend connectivity verified
- [ ] Database connections working
- [ ] SSL/HTTPS working (production)
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested

## 📞 Support & Maintenance

### Log Files
- **Backend Logs**: `don8-backend-temp/logs/`
- **Frontend Logs**: Browser console and Next.js terminal
- **Database Logs**: PostgreSQL log directory

### Monitoring Commands
```bash
# Check application status
pm2 status

# Monitor real-time logs
pm2 logs don8-backend --lines 100

# System resource monitoring
htop
df -h
free -m
```

### Regular Maintenance
- **Daily**: Check health endpoints and logs
- **Weekly**: Review performance metrics and errors  
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Database optimization and cleanup

---

## 📞 Contact & Support

For deployment assistance or issues:
- **Documentation**: Check `CHANGELOG.md` for detailed changes
- **API Reference**: Visit `/health` page for endpoint documentation
- **GitHub Issues**: Report problems via GitHub issues
- **Health Dashboard**: Monitor system status at `/health` endpoint

---

*Last Updated: October 3, 2025 - v2.1.0*