#!/usr/bin/env python3
"""
Test Dashboard API directly
Test the exact code path that the dashboard API follows.
"""
import asyncio
from uuid import UUID

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.services.portfolio import PortfolioService
from sqlalchemy import select


async def test_dashboard_api():
    """Test the dashboard API endpoint directly."""
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
            
            # Create portfolio service
            portfolio_service = PortfolioService(
                db=session,
                market_data_service=None,
                ai_service=None,
                event_bus=None,
                api_key_service=None
            )
            
            print("✅ Created portfolio service")
            
            # Test get_portfolio_summary
            try:
                summary = await portfolio_service.get_portfolio_summary(admin_user.id)
                if summary:
                    print("✅ Successfully got portfolio summary!")
                    print(f"Portfolio: {summary.portfolio.name}")
                    print(f"Total Value: ${summary.portfolio.total_value}")
                    print(f"Positions: {len(summary.positions)}")
                    print(f"Transactions: {len(summary.recent_transactions)}")
                    print(f"AI Insights: {len(summary.ai_insights)}")
                else:
                    print("❌ No summary returned")
                    
            except Exception as e:
                print(f"❌ Error in get_portfolio_summary: {e}")
                import traceback
                traceback.print_exc()
                
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(test_dashboard_api()) 