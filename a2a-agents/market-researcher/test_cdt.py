#!/usr/bin/env python3
"""
CDT Ticker Research Test
Demonstrates Market Research Agent functionality with CDT ticker
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add parent directory to path for shared imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from shared.rag_engine import LightRAGEngine
from shared.mcp_client import MCPClient
from shared.a2a_protocol import A2AMessage

async def research_cdt_ticker():
    """Research CDT ticker using all Market Research Agent capabilities."""
    
    print("=" * 60)
    print("🚀 CDT TICKER RESEARCH - Market Research Agent")
    print("=" * 60)
    
    # Initialize RAG engine with full functionality
    rag_engine = LightRAGEngine()
    await rag_engine.initialize()
    
    # Simulate CDT market data (in real scenario, this comes from MCP TimescaleDB)
    cdt_market_data = {
        "symbol": "CDT",
        "company_name": "Cardlytics Inc",
        "current_price": 45.32,
        "price_change": +1.24,
        "price_change_percent": +2.82,
        "volume": 145000,
        "market_cap": "2.1B",
        "sector": "Technology", 
        "industry": "Data Analytics",
        "52_week_high": 78.45,
        "52_week_low": 32.10,
        "pe_ratio": 18.5,
        "dividend_yield": 0.0,
        "beta": 1.45
    }
    
    # Simulate news sentiment data (in real scenario, this comes from MCP Graphiti)
    cdt_news_sentiment = {
        "overall_sentiment": "positive",
        "sentiment_score": 0.72,
        "news_count": 15,
        "recent_headlines": [
            "Cardlytics (CDT) Reports Strong Q4 2024 Earnings Beat",
            "CDT Announces Expansion of AI-Powered Purchase Intelligence Platform", 
            "Cardlytics Partners with Major Bank for Enhanced Data Analytics",
            "CDT Stock Upgraded by Analysts Following Digital Ad Growth",
            "Cardlytics Sees Increased Adoption of Privacy-Compliant Solutions"
        ],
        "key_topics": ["earnings", "AI expansion", "partnerships", "analyst upgrades", "privacy tech"],
        "social_sentiment": "bullish",
        "institutional_sentiment": "positive"
    }
    
    print("📊 MARKET ANALYSIS")
    print("-" * 40)
    
    # 1. Market Conditions Analysis
    market_analysis = await rag_engine.analyze_market_conditions(
        cdt_market_data, cdt_news_sentiment, ["CDT"]
    )
    
    print(f"Overall Sentiment: {market_analysis.get('overall_sentiment', 'N/A')}")
    print(f"Key Trends: {', '.join(market_analysis.get('key_trends', []))}")
    print(f"Risk Factors: {', '.join(market_analysis.get('risk_factors', []))}")
    print(f"Market Outlook: {market_analysis.get('market_outlook', 'N/A')[:100]}...")
    print(f"Confidence Score: {market_analysis.get('confidence_score', 0):.2f}")
    
    print("\n📰 NEWS RESEARCH")
    print("-" * 40)
    
    # 2. News Research Analysis
    news_research = await rag_engine.research_news(
        {"results": cdt_news_sentiment["recent_headlines"]},
        {"results": [{"content": headline, "score": 0.9} for headline in cdt_news_sentiment["recent_headlines"]]},
        ["CDT", "Cardlytics", "data analytics", "earnings"]
    )
    
    print(f"Executive Summary: {news_research.get('executive_summary', 'N/A')[:150]}...")
    print(f"Key Developments: {len(news_research.get('key_developments', []))} identified")
    print(f"Market Impact: {news_research.get('market_impact', 'N/A')}")
    print(f"Trending Topics: {', '.join(news_research.get('trending_topics', []))}")
    
    print("\n🏢 COMPANY ANALYSIS")
    print("-" * 40)
    
    # 3. Company Deep-Dive Analysis
    company_analysis = await rag_engine.analyze_company(
        "CDT",
        {"filings": ["10-K", "10-Q", "8-K"], "earnings_calls": 4},
        cdt_market_data,
        "comprehensive"
    )
    
    print(f"Company: {cdt_market_data['company_name']} (CDT)")
    print(f"Sector: {cdt_market_data['sector']} - {cdt_market_data['industry']}")
    print(f"Financial Health: {company_analysis.get('financial_health', 'N/A')}")
    print(f"Growth Prospects: {company_analysis.get('growth_prospects', 'N/A')}")
    print(f"Competitive Position: {company_analysis.get('competitive_position', 'N/A')}")
    print(f"Analyst Rating: {company_analysis.get('analyst_rating', 'N/A')}")
    
    print("\n📈 TREND IDENTIFICATION")
    print("-" * 40)
    
    # 4. Trend Analysis
    trend_analysis = await rag_engine.identify_trends(
        {"historical_data": cdt_market_data, "timeframe": "3M"},
        {"market_insights": market_analysis},
        "3M",
        ["Technology", "Data Analytics", "AdTech"]
    )
    
    identified_trends = trend_analysis.get('identified_trends', [])
    for i, trend in enumerate(identified_trends[:3], 1):
        print(f"{i}. {trend.get('trend', 'N/A')} - Strength: {trend.get('strength', 'N/A')}")
    
    print(f"Market Direction: {trend_analysis.get('market_direction', 'N/A')}")
    
    print("\n🎯 SECTOR ANALYSIS")
    print("-" * 40)
    
    # 5. Sector Analysis
    sector_analysis = await rag_engine.analyze_sector(
        "Technology",
        {"sector_performance": "+12.5% YTD", "companies": ["CDT", "GOOGL", "META"]},
        cdt_news_sentiment,
        ["Healthcare", "Financial Services", "Consumer Discretionary"]
    )
    
    print(f"Sector Outlook: {sector_analysis.get('sector_outlook', 'N/A')}")
    print(f"Relative Performance: {sector_analysis.get('relative_performance', 'N/A')}")
    print(f"Key Drivers: {', '.join(sector_analysis.get('key_drivers', []))}")
    
    print("\n🎭 SENTIMENT ANALYSIS")
    print("-" * 40)
    
    # 6. Sentiment Analysis
    sentiment_analysis = await rag_engine.analyze_sentiment(
        ["CDT"],
        cdt_news_sentiment,
        {"social_media": "positive", "analyst_reports": "bullish"},
        ["news", "social", "analyst_reports"]
    )
    
    print(f"Overall Sentiment: {sentiment_analysis.get('overall_sentiment', 'N/A')}")
    symbol_sentiment = sentiment_analysis.get('symbol_sentiment', {}).get('CDT', {})
    print(f"CDT Sentiment Score: {symbol_sentiment.get('score', 0):.2f}")
    print(f"Sentiment Trend: {symbol_sentiment.get('trend', 'N/A')}")
    print(f"Sentiment Drivers: {', '.join(sentiment_analysis.get('sentiment_drivers', []))}")
    
    print("\n🔮 AI-GENERATED INSIGHTS")
    print("-" * 40)
    
    # 7. Generate Comprehensive Insights
    insights = await rag_engine.generate_insights(
        {"user_preferences": {"risk_tolerance": "moderate", "sectors": ["technology"]}},
        cdt_market_data,
        cdt_news_sentiment,
        3
    )
    
    for i, insight in enumerate(insights[:3], 1):
        print(f"\n{i}. {insight.get('title', 'Market Insight')}")
        print(f"   Priority: {insight.get('priority', 'N/A')} | Confidence: {insight.get('confidence', 0):.2f}")
        print(f"   Summary: {insight.get('summary', insight.get('content', 'N/A')[:100])}...")
        if insight.get('actionable'):
            print(f"   ✅ Actionable insight with AG-UI components")
    
    print("\n🤖 NATURAL LANGUAGE QUERY TEST")
    print("-" * 40)
    
    # 8. Natural Language Query
    nlq_response = await rag_engine.process_nlq(
        "What is the investment outlook for CDT stock based on recent earnings and market trends?",
        {
            "market_data": cdt_market_data,
            "news_data": cdt_news_sentiment,
            "analysis_results": {
                "market_analysis": market_analysis,
                "company_analysis": company_analysis
            }
        },
        {"user_query_context": "investment_research"}
    )
    
    print(f"Q: What is the investment outlook for CDT stock?")
    print(f"A: {nlq_response.get('answer', 'N/A')[:200]}...")
    print(f"Confidence: {nlq_response.get('confidence', 0):.2f}")
    print(f"Sources: {len(nlq_response.get('sources', []))} references")
    
    # Display follow-up questions
    follow_ups = nlq_response.get('follow_up_questions', [])
    if follow_ups:
        print("\nSuggested follow-up questions:")
        for i, question in enumerate(follow_ups[:3], 1):
            print(f"  {i}. {question}")
    
    print("\n" + "=" * 60)
    print("✅ CDT RESEARCH COMPLETE - All Market Research Agent functionality tested!")
    print("=" * 60)
    
    # Cleanup
    await rag_engine.shutdown()

if __name__ == "__main__":
    asyncio.run(research_cdt_ticker()) 