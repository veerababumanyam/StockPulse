
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import StockChart from '@/components/StockChart';
import MarketOverview from '@/components/MarketOverview';
import StockSearch from '@/components/StockSearch';
import AIInsights from '@/components/AIInsights';
import StockCard from '@/components/StockCard';
import { mockStocks, mockIndices, mockInsights, mockChartData } from '@/lib/mockData';

const Index = () => {
  const [selectedStock, setSelectedStock] = useState('AAPL');

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
    // In a real app, this would fetch the selected stock's data
    console.log('Selected stock:', symbol);
  };

  // Get data for the selected stock
  const selectedStockData = mockStocks.find(stock => stock.symbol === selectedStock) || mockStocks[0];
  const chartData = mockChartData[selectedStock as keyof typeof mockChartData] || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column - watchlist and market overview */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-3">Watchlist</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {mockStocks.slice(0, 4).map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    onClick={() => handleStockSelect(stock.symbol)}
                  />
                ))}
              </div>
            </div>
            
            <MarketOverview indices={mockIndices} />
          </div>
          
          {/* Middle column - stock details and chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="stockpulse-card p-4 mb-2">
              <StockSearch stocks={mockStocks} onSelect={handleStockSelect} />
            </div>
            
            {selectedStockData && (
              <div className="stockpulse-card p-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedStockData.name} ({selectedStockData.symbol})</h2>
                    <p className="text-sm text-gray-500">{selectedStockData.sector}</p>
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
                  <div className="stat-card bg-gray-50">
                    <div className="stat-label">Volume</div>
                    <div className="stat-value">{(selectedStockData.volume / 1000000).toFixed(1)}M</div>
                  </div>
                  <div className="stat-card bg-gray-50">
                    <div className="stat-label">Market Cap</div>
                    <div className="stat-value">{selectedStockData.marketCap}</div>
                  </div>
                  <div className="stat-card bg-gray-50">
                    <div className="stat-label">P/E Ratio</div>
                    <div className="stat-value">{selectedStockData.pe ? selectedStockData.pe.toFixed(2) : 'N/A'}</div>
                  </div>
                  <div className="stat-card bg-gray-50">
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
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center md:flex md:justify-between md:text-left">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; 2025 StockPulse AI. All rights reserved.
              </p>
            </div>
            <div className="flex justify-center md:justify-end space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
