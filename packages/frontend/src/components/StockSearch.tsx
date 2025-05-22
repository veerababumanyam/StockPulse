
import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { Stock } from '@/lib/mockData';

interface StockSearchProps {
  stocks: Stock[];
  onSelect: (symbol: string) => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ stocks, onSelect }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const filteredStocks = query
    ? stocks.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <div className="relative">
      <div className="flex items-center neumorphic bg-gradient-pastel transition-all duration-300 focus-within:shadow-neumorphic-inset">
        <div className="pl-5 pr-2">
          <Search className="h-5 w-5 text-stockpulse-blue" />
        </div>
        <input
          className="w-full py-4 px-1 text-base focus:outline-none rounded-xl bg-transparent"
          placeholder="Search symbols, companies, or AI themes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        />
        <div className="pr-5 pl-2">
          <div className="bg-stockpulse-pastel-blue p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-stockpulse-blue" />
          </div>
        </div>
      </div>
      
      {isFocused && query && filteredStocks.length > 0 && (
        <div className="absolute mt-3 w-full bg-white rounded-xl shadow-neumorphic border border-gray-100 z-10 max-h-80 overflow-y-auto animate-fade-in divide-y divide-gray-100">
          {filteredStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="px-5 py-3.5 hover:bg-stockpulse-gray-light/30 cursor-pointer flex justify-between transition-colors"
              onClick={() => {
                onSelect(stock.symbol);
                setQuery('');
              }}
            >
              <div>
                <div className="font-medium text-gray-900">{stock.symbol}</div>
                <div className="text-sm text-gray-500">{stock.name}</div>
              </div>
              <div className={`text-right ${stock.change >= 0 ? 'text-stockpulse-green' : 'text-stockpulse-coral'}`}>
                <div className="font-medium">${stock.price.toFixed(2)}</div>
                <div className="text-xs font-medium">
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isFocused && query && filteredStocks.length === 0 && (
        <div className="absolute mt-3 w-full bg-white rounded-xl shadow-neumorphic border border-gray-100 z-10 p-5 text-center animate-fade-in">
          <p className="text-gray-500">No stocks found matching "{query}"</p>
        </div>
      )}
      
      {!query && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="px-4 py-2 text-xs neumorphic-button text-gray-700">
            #TechStocks
          </button>
          <button className="px-4 py-2 text-xs neumorphic-button text-gray-700">
            #RisingStars
          </button>
          <button className="px-4 py-2 text-xs neumorphic-button text-gray-700">
            #Dividends
          </button>
          <button className="px-4 py-2 text-xs neumorphic-button text-gray-700">
            #AITrends
          </button>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
