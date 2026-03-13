# Restaurant Management System - Docker Setup

This directory contains the Docker configuration for running the Restaurant Management System with backend, frontend, and database services.

## Quick Start

1. **Prerequisites**
   - Docker and Docker Compose installed on your system
   - Git repository cloned locally

2. **Start the application**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## Services

### Backend API Server
- **Container**: `restaurant-api`
- **Port**: 3000
- **Health Check**: `/api/health`
- **Environment**: Production

### Frontend (Mockup Sandbox)
- **Container**: `restaurant-frontend`
- **Port**: 5173
- **Environment**: Development (for hot reload)
- **Volume Mount**: Live code updates

### PostgreSQL Database
- **Container**: `restaurant-postgres`
- **Port**: 5432
- **Database**: `restaurant_db`
- **User**: `restaurant_user`
- **Password**: `restaurant_pass`

## Environment Variables

### Backend (.env)
Copy `artifacts/api-server/.env.example` to `artifacts/api-server/.env`:
```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

### Frontend (.env)
Copy `artifacts/mockup-sandbox/.env.example` to `artifacts/mockup-sandbox/.env`:
```bash
cp artifacts/mockup-sandbox/.env.example artifacts/mockup-sandbox/.env
```

## Development Workflow

### Hot Reload
- Frontend supports hot reload through volume mounting
- Backend changes require rebuilding the container:
  ```bash
  docker-compose up -d --build api-server
  ```

### Logs
View logs for all services:
```bash
docker-compose logs -f
```

View logs for a specific service:
```bash
docker-compose logs -f api-server
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Database Management
Connect to the database:
```bash
docker-compose exec postgres psql -U restaurant_user -d restaurant_db
```

## Production Deployment

For production deployment:

1. Update environment variables with production values
2. Remove volume mounts from frontend service
3. Update CORS origins to match your domain
4. Use proper SSL certificates
5. Set up proper database backups

## Troubleshooting

### Port Conflicts
If ports are already in use, update the `docker-compose.yml` ports section.

### Database Connection Issues
- Ensure PostgreSQL container is running
- Check database credentials in environment variables
- Verify network connectivity between containers

### Frontend Not Connecting to Backend
- Check if backend container is healthy
- Verify API URL configuration in frontend
- Check CORS settings in backend

## Useful Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up -d --build

# Clean up volumes and containers
docker-compose down -v

# View running containers
docker-compose ps

# Execute commands in containers
docker-compose exec api-server sh
docker-compose exec frontend sh
docker-compose exec postgres sh
```
