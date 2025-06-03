# Backend Utility Scripts

This directory contains one-time setup and maintenance scripts for the StockPulse backend.

## Scripts Overview

### Initial Setup Scripts

#### `init_admin.py`

**Purpose**: Creates the initial super admin user for the application.
**Usage**: Run once during initial deployment.

```bash
cd services/backend
python scripts/init_admin.py
```

**Credentials Created**:

- Email: admin@sp.com
- Password: admin@123 (change after first login)
- Role: ADMIN
- Status: APPROVED (auto-activated)

#### `setup_fmp_api_key.py`

**Purpose**: Sets up Financial Modeling Prep API key for the admin user.
**Usage**: Run after admin user creation to enable real market data.

```bash
cd services/backend
python scripts/setup_fmp_api_key.py
```

**Features**:

- Creates FMP provider configuration
- Adds encrypted API key for admin user
- Validates API key functionality

### Data Management Scripts

#### `create_test_portfolio.py`

**Purpose**: Creates test portfolio data for the admin user.
**Usage**: Run to populate demo data for testing.

```bash
cd services/backend
python scripts/create_test_portfolio.py
```

**Creates**:

- Main portfolio with demo positions (AAPL, GOOGL, TSLA)
- Sample transactions
- Portfolio performance metrics

#### `create_data_architecture_migration.py`

**Purpose**: Creates comprehensive data architecture tables and indexes.
**Usage**: Run to set up the complete data layer infrastructure.

```bash
cd services/backend
python scripts/create_data_architecture_migration.py
```

**Features**:

- Creates all data architecture tables
- Adds performance indexes
- Sets up sample data and preferences

### Maintenance Scripts

#### `fix_admin.py`

**Purpose**: Fixes admin user status and permissions.
**Usage**: Run if admin user becomes inactive or has permission issues.

```bash
cd services/backend
python scripts/fix_admin.py
```

**Actions**:

- Updates user status to APPROVED
- Activates user account
- Sets approval timestamp

## Prerequisites

Before running any scripts:

1. **Database Running**: Ensure PostgreSQL is running (Docker or local)
2. **Environment Variables**: Set up proper environment configuration
3. **Dependencies Installed**: Run `pip install -r requirements.txt`

## Execution Order

For initial setup, run scripts in this order:

1. `init_admin.py` - Create admin user
2. `setup_fmp_api_key.py` - Configure API access
3. `create_data_architecture_migration.py` - Set up data layer
4. `create_test_portfolio.py` - Add demo data

## Security Notes

⚠️ **Important Security Considerations**:

- Change default admin password immediately after first login
- API keys are encrypted in database but visible in script source
- Scripts contain sensitive configuration - keep secure
- Run scripts only in trusted environments
- Review and audit script contents before execution

## Troubleshooting

### Common Issues

**Database Connection Errors**:

- Verify PostgreSQL is running on port 5432
- Check DATABASE_URL in environment configuration
- Ensure database user has proper permissions

**Import Errors**:

- Verify you're running from `services/backend` directory
- Check Python path includes the app directory
- Ensure all dependencies are installed

**Permission Errors**:

- Run scripts with appropriate user permissions
- Verify database user has CREATE/INSERT permissions
- Check file system permissions for log files

### Getting Help

For issues with these scripts:

1. Check the logs for detailed error messages
2. Verify database connectivity
3. Review environment configuration
4. Consult the main application documentation

## Maintenance

These scripts are designed for one-time use during setup. For ongoing maintenance:

- Use the main application APIs for user management
- Use database migrations for schema changes
- Use the admin interface for configuration updates
- Monitor logs for any script execution issues
