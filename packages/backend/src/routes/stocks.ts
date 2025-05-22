import express from 'express';
import { Stock } from '@stockpulse/shared';

const router = express.Router();

// Mock data for development
const mockStocks: Stock[] = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 187.42,
    change: 1.25,
    changePercent: 0.67,
    volume: 58234567,
    marketCap: "2.94T",
    pe: 30.8,
    dividend: 0.58,
    sector: "Technology"
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 416.78,
    change: 3.45,
    changePercent: 0.83,
    volume: 22567890,
    marketCap: "3.10T",
    pe: 36.2,
    dividend: 0.68,
    sector: "Technology"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 141.53,
    change: -0.92,
    changePercent: -0.65,
    volume: 18976543,
    marketCap: "1.78T",
    pe: 25.1,
    dividend: null,
    sector: "Technology"
  }
];

// GET all stocks
router.get('/', (req, res) => {
  res.json(mockStocks);
});

// GET stock by symbol
router.get('/:symbol', (req, res) => {
  const { symbol } = req.params;
  const stock = mockStocks.find(s => s.symbol === symbol.toUpperCase());
  
  if (!stock) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  
  res.json(stock);
});

// GET historical data for a stock
router.get('/:symbol/history', (req, res) => {
  const { symbol } = req.params;
  const { timeframe = '1M' } = req.query;
  
  // Check if stock exists
  const stockExists = mockStocks.some(s => s.symbol === symbol.toUpperCase());
  
  if (!stockExists) {
    return res.status(404).json({ error: 'Stock not found' });
  }
  
  // Generate mock historical data
  const days = timeframe === '1D' ? 1 : 
               timeframe === '1W' ? 7 : 
               timeframe === '1M' ? 30 : 
               timeframe === '3M' ? 90 : 180;
  
  const data = generateMockHistoricalData(days);
  
  res.json({
    symbol: symbol.toUpperCase(),
    timeframe,
    data
  });
});

// Helper function to generate mock historical data
function generateMockHistoricalData(days: number) {
  const data = [];
  const now = new Date();
  
  // Start with a random price between 100 and 300
  let price = 100 + Math.random() * 200;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Add a random price movement (between -2% and +2%)
    const change = price * (0.04 * Math.random() - 0.02);
    price += change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
}

export default router; 