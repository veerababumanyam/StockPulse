#!/usr/bin/env python3
"""
Test Portfolio API Issue
Simple script to debug the 500 error in portfolio API.
"""
import asyncio
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.portfolio import Portfolio
from app.schemas.portfolio import Portfolio as PortfolioSchema


async def test_portfolio_conversion():
    """Test converting portfolio model to schema."""
    async with AsyncSessionLocal() as session:
        try:
            # Find admin user
            stmt = select(User).where(User.email == "admin@sp.com")
            result = await session.execute(stmt)
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("❌ Admin user not found!")
                return
            
            print(f"✅ Found admin user: {admin_user.email}")
            
            # Get portfolio
            portfolio_stmt = (
                select(Portfolio)
                .options(selectinload(Portfolio.positions))
                .where(Portfolio.user_id == admin_user.id)
                .limit(1)
            )
            portfolio_result = await session.execute(portfolio_stmt)
            portfolio = portfolio_result.scalar_one_or_none()
            
            if not portfolio:
                print("❌ No portfolio found!")
                return
                
            print(f"✅ Found portfolio: {portfolio.name}")
            print(f"Portfolio fields: {dir(portfolio)}")
            
            # Try to convert to schema
            try:
                portfolio_schema = PortfolioSchema.from_orm(portfolio)
                print("✅ Successfully converted portfolio to schema!")
                print(f"Schema data: {portfolio_schema.dict()}")
                
            except Exception as e:
                print(f"❌ Error converting portfolio to schema: {e}")
                print(f"Portfolio attributes:")
                for attr in dir(portfolio):
                    if not attr.startswith('_'):
                        try:
                            value = getattr(portfolio, attr)
                            print(f"  {attr}: {value} ({type(value)})")
                        except Exception as attr_e:
                            print(f"  {attr}: Error accessing - {attr_e}")
                
        except Exception as e:
            print(f"❌ Error: {e}")


if __name__ == "__main__":
    asyncio.run(test_portfolio_conversion()) 