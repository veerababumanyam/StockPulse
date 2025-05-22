
// Mock data for StockPulse AI Platform
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
  pe: number | null;
  dividend: number | null;
  sector: string;
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface AIInsight {
  id: string;
  stock: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  confidence: number; // 0-100
  summary: string;
  details: string;
  timeframe: 'short' | 'medium' | 'long';
  timestamp: string;
}

export const mockStocks: Stock[] = [
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
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 180.75,
    change: 2.83,
    changePercent: 1.59,
    volume: 31245678,
    marketCap: "1.86T",
    pe: 78.3,
    dividend: null,
    sector: "Consumer Cyclical"
  },
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 174.12,
    change: -3.28,
    changePercent: -1.85,
    volume: 85674321,
    marketCap: "553.69B",
    pe: 46.8,
    dividend: null,
    sector: "Automotive"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 881.86,
    change: 12.24,
    changePercent: 1.41,
    volume: 42235689,
    marketCap: "2.17T",
    pe: 82.6,
    dividend: 0.04,
    sector: "Technology"
  },
  {
    symbol: "META",
    name: "Meta Platforms, Inc.",
    price: 465.97,
    change: 1.15,
    changePercent: 0.25,
    volume: 17865432,
    marketCap: "1.19T",
    pe: 30.2,
    dividend: null,
    sector: "Technology"
  },
  {
    symbol: "JNJ",
    name: "Johnson & Johnson",
    price: 156.32,
    change: -0.56,
    changePercent: -0.36,
    volume: 8765432,
    marketCap: "375.83B",
    pe: 17.4,
    dividend: 2.90,
    sector: "Healthcare"
  }
];

export const mockIndices: MarketIndex[] = [
  {
    name: "S&P 500",
    value: 5218.19,
    change: 26.32,
    changePercent: 0.51
  },
  {
    name: "Nasdaq",
    value: 16842.48,
    change: 184.09,
    changePercent: 1.10
  },
  {
    name: "Dow Jones",
    value: 38749.86,
    change: -23.71,
    changePercent: -0.06
  },
  {
    name: "Russell 2000",
    value: 2068.30,
    change: 10.75,
    changePercent: 0.52
  }
];

export const mockInsights: AIInsight[] = [
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
  },
  {
    id: "ins-004",
    stock: "TSLA",
    type: "sell",
    confidence: 70,
    summary: "Sell recommendation due to increasing competition",
    details: "Our competitive analysis indicates Tesla is facing increasing pressure from traditional automakers entering the EV market. Production challenges and margin compression are likely in the coming quarters.",
    timeframe: "medium",
    timestamp: "2025-05-21T08:45:00Z"
  },
  {
    id: "ins-005",
    stock: "NVDA",
    type: "buy",
    confidence: 88,
    summary: "Strong buy on continued AI chip demand",
    details: "NVIDIA continues to dominate the AI chip market with no significant competitors able to match their performance. Our supply chain analysis indicates they have resolved previous constraints and can meet the growing demand.",
    timeframe: "long",
    timestamp: "2025-05-21T08:50:00Z"
  },
  {
    id: "ins-006",
    stock: "JNJ",
    type: "watch",
    confidence: 60,
    summary: "Add to watchlist pending litigation outcomes",
    details: "Johnson & Johnson has stable fundamentals, but our legal analysis suggests upcoming litigation outcomes could create volatility. The healthcare sector generally remains defensive in current market conditions.",
    timeframe: "short",
    timestamp: "2025-05-21T08:55:00Z"
  }
];

// Mock price history data for charts
export const generateMockChartData = (days = 30, startPrice = 100, volatility = 0.02) => {
  const data = [];
  let price = startPrice;
  
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Generate a random price movement
    const change = price * (volatility * (Math.random() - 0.5));
    price += change;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: Math.max(0, parseFloat(price.toFixed(2)))
    });
  }
  
  return data;
};

export const mockChartData = {
  AAPL: generateMockChartData(90, 180, 0.015),
  MSFT: generateMockChartData(90, 410, 0.01),
  GOOGL: generateMockChartData(90, 140, 0.02),
  AMZN: generateMockChartData(90, 175, 0.025),
  TSLA: generateMockChartData(90, 180, 0.04),
  NVDA: generateMockChartData(90, 850, 0.03),
  META: generateMockChartData(90, 460, 0.018),
  JNJ: generateMockChartData(90, 155, 0.008),
};
