-- StockPulse Database Initialization
-- This file is run when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create application user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'stockpulse_app') THEN
    CREATE ROLE stockpulse_app WITH LOGIN PASSWORD 'app_password';
  END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE stockpulse TO stockpulse_app;
GRANT USAGE ON SCHEMA public TO stockpulse_app;
GRANT CREATE ON SCHEMA public TO stockpulse_app;

-- Create tables will be handled by SQLAlchemy/Alembic
-- This file is just for initial setup 