#!/bin/bash

# Restaurant Management System - Docker Setup Script
# This script helps you get the Docker environment up and running

set -e

echo "🍽️  Restaurant Management System - Docker Setup"
echo "=============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files if they don't exist
echo "📝 Setting up environment files..."

if [ ! -f "artifacts/api-server/.env" ]; then
    cp artifacts/api-server/.env.example artifacts/api-server/.env
    echo "✅ Created backend .env file"
else
    echo "ℹ️  Backend .env file already exists"
fi

if [ ! -f "artifacts/mockup-sandbox/.env" ]; then
    cp artifacts/mockup-sandbox/.env.example artifacts/mockup-sandbox/.env
    echo "✅ Created frontend .env file"
else
    echo "ℹ️  Frontend .env file already exists"
fi

# Build and start the containers
echo "🐳 Building and starting Docker containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Show service URLs
echo ""
echo "🎉 Setup complete! Your services are available at:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo "   Database: localhost:5432"
echo ""
echo "📚 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "📖 For more information, see DOCKER_README.md"
