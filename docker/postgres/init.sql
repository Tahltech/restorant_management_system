-- Initialize PostgreSQL database for restaurant management system
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic schema structure
-- Note: The actual schema will be created by the application's migration system
-- This is just a placeholder initialization script

-- Grant permissions to the application user
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;

-- Log successful initialization
\echo 'Restaurant database initialized successfully';
