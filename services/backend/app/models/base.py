"""
SQLAlchemy Base class for all models.
This file contains only the Base class to avoid circular imports.
"""
from sqlalchemy.ext.declarative import declarative_base

# Create the base class for all models
Base = declarative_base() 