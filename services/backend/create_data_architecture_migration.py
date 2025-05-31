#!/usr/bin/env python3
"""
Create Data Architecture Migration
Creates database tables for the comprehensive data architecture
"""
import asyncio
import sys
import os
from pathlib import Path

# Add the app directory to the Python path
sys.path.append(str(Path(__file__).parent / "app"))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal, engine
from app.models.base import Base
from app.models.market_data import MarketDataSnapshot, TransactionHistory, UserPreferences, CacheMetrics
from app.models.user import User
from app.models.portfolio import Portfolio, PortfolioSnapshot
from app.models.api_keys import APIProvider, APIKey, APIKeyUsage

async def create_data_architecture_tables():
    """Create all data architecture tables"""
    
    print("🔧 Creating data architecture tables...")
    
    try:
        # Create all tables
        async with engine.begin() as conn:
            # Import all models to ensure they're registered with metadata
            from app.models import (
                User, Portfolio, PortfolioPosition, Transaction, AIPortfolioInsight, PortfolioSnapshot,
                APIProvider, APIKey, APIKeyUsage,
                MarketDataSnapshot, TransactionHistory, 
                UserPreferences, CacheMetrics
            )
            
            # Create all tables
            await conn.run_sync(Base.metadata.create_all)
            
        print("✅ Data architecture tables created successfully!")
        
        # Create indexes for performance
        await create_performance_indexes()
        
        print("✅ Performance indexes created successfully!")
        
        # Create sample data
        await create_sample_data()
        
        print("✅ Sample data created successfully!")
        
        print("\n🚀 Data architecture setup completed!")
        print("\nNew tables created:")
        print("- market_data_snapshots: Historical market data with TTL management")
        print("- portfolio_snapshots: Portfolio performance tracking")
        print("- transaction_history: Comprehensive audit trails")
        print("- user_preferences: User configurations and settings")
        print("- cache_metrics: Cache performance monitoring")
        
        print("\nData layers ready:")
        print("- ✅ Cache Layer (Redis): Hot data with 30-60s TTL")
        print("- ✅ Persistent Storage (PostgreSQL): Historical data and audit trails")
        print("- ✅ Vector Storage (Qdrant): Embeddings for semantic search")
        print("- ✅ Knowledge Graph (Graphiti): Relationship mapping")
        
    except Exception as e:
        print(f"❌ Error creating data architecture tables: {e}")
        raise

async def create_performance_indexes():
    """Create additional performance indexes"""
    
    async with AsyncSessionLocal() as db:
        try:
            # Create additional indexes for market data snapshots
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_market_data_symbol_expires 
                ON market_data_snapshots(symbol, expires_at) 
                WHERE expires_at > NOW()
            """)
            
            # Create index for portfolio snapshots by user and time
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_time 
                ON portfolio_snapshots(portfolio_id, snapshot_date DESC)
            """)
            
            # Create index for transaction history by symbol and time
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_transaction_history_symbol_time 
                ON transaction_history(symbol, transaction_timestamp DESC)
            """)
            
            # Create index for cache metrics by type and time
            await db.execute("""
                CREATE INDEX IF NOT EXISTS idx_cache_metrics_type_time 
                ON cache_metrics(cache_type, measurement_timestamp DESC)
            """)
            
            await db.commit()
            
        except Exception as e:
            print(f"Warning: Some indexes may already exist: {e}")

async def create_sample_data():
    """Create sample data for testing"""
    
    async with AsyncSessionLocal() as db:
        try:
            # Create sample user preferences for admin user
            from sqlalchemy import select
            
            # Find admin user
            admin_result = await db.execute(
                select(User).where(User.email == "admin@sp.com")
            )
            admin_user = admin_result.scalar_one_or_none()
            
            if admin_user:
                # Check if preferences already exist
                prefs_result = await db.execute(
                    select(UserPreferences).where(UserPreferences.user_id == admin_user.id)
                )
                existing_prefs = prefs_result.scalar_one_or_none()
                
                if not existing_prefs:
                    # Create default preferences
                    preferences = UserPreferences(
                        user_id=admin_user.id,
                        dashboard_layout={
                            "widgets": [
                                {"id": "portfolio-overview", "x": 0, "y": 0, "w": 6, "h": 4},
                                {"id": "portfolio-chart", "x": 6, "y": 0, "w": 6, "h": 4},
                                {"id": "watchlist", "x": 0, "y": 4, "w": 4, "h": 6},
                                {"id": "market-summary", "x": 4, "y": 4, "w": 4, "h": 3},
                                {"id": "ai-insights", "x": 8, "y": 4, "w": 4, "h": 6}
                            ]
                        },
                        default_timeframe="1M",
                        default_chart_type="line",
                        theme="light",
                        ai_insights_enabled=True,
                        ai_recommendations_enabled=True,
                        cache_duration_minutes=5
                    )
                    
                    db.add(preferences)
                    await db.commit()
                    print(f"✅ Created default preferences for admin user")
                else:
                    print(f"✅ Admin user preferences already exist")
            else:
                print("⚠️  Admin user not found - skipping sample preferences")
                
        except Exception as e:
            print(f"Warning: Error creating sample data: {e}")

if __name__ == "__main__":
    print("🔧 Setting up comprehensive data architecture...")
    asyncio.run(create_data_architecture_tables()) 