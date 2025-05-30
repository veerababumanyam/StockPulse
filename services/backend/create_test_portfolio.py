#!/usr/bin/env python3
"""
Create Test Portfolio Data
Creates a test portfolio with positions for the admin user for testing purposes.
"""
import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, date
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.portfolio import Portfolio, PortfolioPosition, Transaction
from app.schemas.portfolio import PositionType, TransactionType, PortfolioStatus


async def create_test_portfolio():
    """Create test portfolio data for admin user."""
    async with AsyncSessionLocal() as session:
        try:
            # Find admin user
            stmt = select(User).where(User.email == "admin@sp.com")
            result = await session.execute(stmt)
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print("❌ Admin user not found!")
                return
            
            print(f"✅ Found admin user: {admin_user.email} (ID: {admin_user.id})")
            
            # Check if portfolio already exists
            portfolio_stmt = select(Portfolio).where(Portfolio.user_id == admin_user.id)
            existing_portfolio = (await session.execute(portfolio_stmt)).scalar_one_or_none()
            
            if existing_portfolio:
                print(f"📁 Portfolio already exists: {existing_portfolio.name}")
                return existing_portfolio.id
            
            # Create test portfolio
            portfolio = Portfolio(
                id=uuid.uuid4(),
                user_id=admin_user.id,
                name="Main Portfolio",
                description="Demo portfolio for testing StockPulse features",
                currency="USD",
                status=PortfolioStatus.ACTIVE,
                total_value=Decimal("125500.00"),
                total_cost=Decimal("100000.00"),
                cash_balance=Decimal("25000.00"),
                total_pnl=Decimal("25500.00"),
                total_pnl_percent=Decimal("25.50"),
                day_change=Decimal("1250.00"),
                day_change_percent=Decimal("1.01"),
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                last_calculated_at=datetime.utcnow()
            )
            
            session.add(portfolio)
            await session.flush()  # Get the ID
            
            print(f"📁 Created portfolio: {portfolio.name} (ID: {portfolio.id})")
            
            # Create test positions
            positions_data = [
                {
                    "symbol": "AAPL",
                    "quantity": Decimal("100"),
                    "average_cost": Decimal("150.00"),
                    "current_price": Decimal("175.50"),
                },
                {
                    "symbol": "GOOGL", 
                    "quantity": Decimal("25"),
                    "average_cost": Decimal("2000.00"),
                    "current_price": Decimal("2150.00"),
                },
                {
                    "symbol": "TSLA",
                    "quantity": Decimal("50"),
                    "average_cost": Decimal("200.00"),
                    "current_price": Decimal("240.00"),
                }
            ]
            
            for pos_data in positions_data:
                market_value = pos_data["quantity"] * pos_data["current_price"]
                cost_basis = pos_data["quantity"] * pos_data["average_cost"]
                unrealized_pnl = market_value - cost_basis
                unrealized_pnl_percent = (unrealized_pnl / cost_basis * 100) if cost_basis > 0 else Decimal("0")
                
                position = PortfolioPosition(
                    id=uuid.uuid4(),
                    portfolio_id=portfolio.id,
                    symbol=pos_data["symbol"],
                    position_type=PositionType.EQUITY,
                    quantity=pos_data["quantity"],
                    average_cost=pos_data["average_cost"],
                    current_price=pos_data["current_price"],
                    market_value=market_value,
                    cost_basis=cost_basis,
                    unrealized_pnl=unrealized_pnl,
                    unrealized_pnl_percent=unrealized_pnl_percent,
                    weight=Decimal("33.33"),  # Simplified equal weighting
                    last_updated=datetime.utcnow(),
                    price_updated_at=datetime.utcnow(),
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                
                session.add(position)
                print(f"📈 Added position: {pos_data['symbol']} - {pos_data['quantity']} shares @ ${pos_data['current_price']}")
            
            # Create some test transactions
            transactions_data = [
                {
                    "symbol": "AAPL",
                    "type": TransactionType.BUY,
                    "quantity": Decimal("100"),
                    "price": Decimal("150.00"),
                    "date": date(2024, 1, 15)
                },
                {
                    "symbol": "GOOGL", 
                    "type": TransactionType.BUY,
                    "quantity": Decimal("25"),
                    "price": Decimal("2000.00"),
                    "date": date(2024, 2, 1)
                },
                {
                    "symbol": "TSLA",
                    "type": TransactionType.BUY,
                    "quantity": Decimal("50"),
                    "price": Decimal("200.00"),
                    "date": date(2024, 2, 15)
                }
            ]
            
            for txn_data in transactions_data:
                total_amount = txn_data["quantity"] * txn_data["price"]
                
                transaction = Transaction(
                    id=uuid.uuid4(),
                    portfolio_id=portfolio.id,
                    user_id=admin_user.id,
                    symbol=txn_data["symbol"],
                    transaction_type=txn_data["type"],
                    quantity=txn_data["quantity"],
                    price=txn_data["price"],
                    fees=Decimal("9.99"),  # Standard fee
                    total_amount=total_amount + Decimal("9.99"),
                    transaction_date=txn_data["date"],
                    settlement_date=txn_data["date"],
                    notes=f"Initial purchase of {txn_data['symbol']}",
                    created_at=datetime.utcnow(),
                    created_by=admin_user.id,
                    updated_at=datetime.utcnow()
                )
                
                session.add(transaction)
                print(f"💰 Added transaction: {txn_data['type'].value} {txn_data['quantity']} {txn_data['symbol']} @ ${txn_data['price']}")
            
            # Commit all changes
            await session.commit()
            print("✅ Test portfolio data created successfully!")
            return portfolio.id
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error creating test portfolio: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(create_test_portfolio()) 