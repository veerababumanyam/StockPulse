import express from 'express';
import { AIInsight } from '@stockpulse/shared';

const router = express.Router();

// Mock data for development
const mockInsights: AIInsight[] = [
  {
    id: "ins-001",
    stock: "AAPL",
    type: "buy",
    confidence: 82,
    summary: "Strong buy recommendation based on upcoming product cycle",
    details: "Our AI analysis indicates a strong likelihood of Apple outperforming expectations in the next quarter due to the upcoming iPhone release cycle and growing services revenue. Technical indicators also suggest a bullish pattern forming.",
    timeframe: "medium",
    timestamp: "2025-05-21T08:30:00Z"
  },
  {
    id: "ins-002",
    stock: "MSFT",
    type: "buy",
    confidence: 78,
    summary: "Buy on cloud strength and AI innovations",
    details: "Microsoft continues to show strong growth in its Azure cloud services, with our analysis predicting market share gains. Recent AI integrations across product lines should drive additional revenue streams.",
    timeframe: "long",
    timestamp: "2025-05-21T08:35:00Z"
  },
  {
    id: "ins-003",
    stock: "GOOGL",
    type: "hold",
    confidence: 65,
    summary: "Hold while monitoring regulatory challenges",
    details: "While Google's core business remains strong, our sentiment analysis detected increasing regulatory concerns that may impact future growth. Advertising revenue remains solid but showing signs of maturity.",
    timeframe: "short",
    timestamp: "2025-05-21T08:40:00Z"
  }
];

// GET all insights
router.get('/', (req, res) => {
  res.json(mockInsights);
});

// GET insights by stock symbol
router.get('/stock/:symbol', (req, res) => {
  const { symbol } = req.params;
  const insights = mockInsights.filter(
    insight => insight.stock === symbol.toUpperCase()
  );
  
  if (insights.length === 0) {
    return res.status(404).json({ 
      error: 'No insights found for this stock' 
    });
  }
  
  res.json(insights);
});

// GET insight by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const insight = mockInsights.find(ins => ins.id === id);
  
  if (!insight) {
    return res.status(404).json({ error: 'Insight not found' });
  }
  
  res.json(insight);
});

// Generate a new AI insight (mock)
router.post('/generate', (req, res) => {
  const { stock } = req.body;
  
  if (!stock) {
    return res.status(400).json({ error: 'Stock symbol is required' });
  }
  
  // Generate a random insight type
  const types: AIInsight['type'][] = ['buy', 'sell', 'hold', 'watch'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  // Generate a random confidence level
  const confidence = Math.floor(50 + Math.random() * 40);
  
  const newInsight: AIInsight = {
    id: `ins-${Date.now()}`,
    stock: stock.toUpperCase(),
    type: randomType,
    confidence,
    summary: `AI-generated ${randomType} recommendation for ${stock.toUpperCase()}`,
    details: `This is a mock AI-generated insight for demonstration purposes. In a real implementation, this would contain detailed analysis based on technical indicators, fundamental data, news sentiment, and market conditions.`,
    timeframe: "medium",
    timestamp: new Date().toISOString()
  };
  
  // In a real implementation, this would be saved to a database
  mockInsights.push(newInsight);
  
  res.status(201).json(newInsight);
});

export default router; 