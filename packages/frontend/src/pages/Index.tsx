import { useState } from 'react';
import StockChart from '@/components/StockChart';
import MarketOverview from '@/components/MarketOverview';
import StockSearch from '@/components/StockSearch';
import AIInsights from '@/components/AIInsights';
import StockCard from '@/components/StockCard';
import Logo from '@/components/Logo';
import { mockStocks, mockIndices, mockInsights, mockChartData } from '@/lib/mockData';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    console.log('Selected stock:', symbol);
  };

  // Get data for the selected stock
  const selectedStockData = mockStocks.find(stock => stock.symbol === selectedStock) || mockStocks[0];
  const chartData = mockChartData[selectedStock as keyof typeof mockChartData] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column - watchlist and market overview */}
          <div className="flex flex-col gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-blue">Watchlist</h2>
                <button className="text-sm font-medium text-stockpulse-blue hover:text-stockpulse-blue-dark transition-colors">
                  See All
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {mockStocks.slice(0, 4).map((stock, index) => (
                  <div 
                    key={stock.symbol} 
                    className="animate-slide-up" 
                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                  >
                    <StockCard
                      stock={stock}
                      onClick={() => handleStockSelect(stock.symbol)}
                      isSelected={stock.symbol === selectedStock}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <MarketOverview indices={mockIndices} />
          </div>
          
          {/* Middle column - stock details and chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="stockpulse-card p-4 mb-2 animate-fade-in">
              <StockSearch stocks={mockStocks} onSelect={handleStockSelect} />
            </div>
            
            {selectedStockData && (
              <div className="stockpulse-card p-5 animate-fade-in">
                <div className="flex justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStockData.name} ({selectedStockData.symbol})</h2>
                    <p className="text-sm text-gray-500 mt-1">{selectedStockData.sector}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${selectedStockData.price.toFixed(2)}</div>
                    <div className={`flex items-center justify-end ${selectedStockData.change >= 0 ? 'positive' : 'negative'}`}>
                      <span>
                        {selectedStockData.change >= 0 ? '+' : ''}
                        {selectedStockData.change.toFixed(2)} ({selectedStockData.changePercent >= 0 ? '+' : ''}
                        {selectedStockData.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card bg-gray-50 border border-gray-100 hover:border-stockpulse-blue-light/30 transition-colors">
                    <div className="stat-label">Volume</div>
                    <div className="stat-value">{(selectedStockData.volume / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="stat-card bg-gray-50 border border-gray-100 hover:border-stockpulse-blue-light/30 transition-colors">
                    <div className="stat-label">Market Cap</div>
                    <div className="stat-value">{selectedStockData.marketCap}</div>
                  </div>
                  <div className="stat-card bg-gray-50 border border-gray-100 hover:border-stockpulse-blue-light/30 transition-colors">
                    <div className="stat-label">P/E Ratio</div>
                    <div className="stat-value">{selectedStockData.pe ? selectedStockData.pe.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="stat-card bg-gray-50 border border-gray-100 hover:border-stockpulse-blue-light/30 transition-colors">
                    <div className="stat-label">Dividend</div>
                    <div className="stat-value">{selectedStockData.dividend ? `${selectedStockData.dividend}%` : 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
            
            <StockChart 
              data={chartData}
              symbol={selectedStock}
            />
            
            <AIInsights 
              insights={mockInsights}
              selectedStock={selectedStock}
            />
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <Logo variant="horizontal" size="medium" />
              </div>
              <p className="text-sm text-gray-500 mb-4">Cutting-edge AI-powered stock analysis and market insights platform.</p>
              <p className="text-sm text-gray-500">&copy; 2025 StockPulse AI. All rights reserved.</p>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Documentation</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">API Access</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Learning Center</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Market Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-md font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-500 hover:text-stockpulse-blue transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index; 