
import { useState } from 'react';
import { Search } from 'lucide-react';
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
      <div className="flex items-center border rounded-md bg-white shadow-sm">
        <div className="pl-3 pr-2">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          className="w-full py-2 px-1 text-sm focus:outline-none rounded-md"
          placeholder="Search symbols or companies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)} // Delay to allow click event to register
        />
      </div>
      
      {isFocused && query && filteredStocks.length > 0 && (
        <div className="absolute mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-72 overflow-y-auto">
          {filteredStocks.map((stock) => (
            <div
              key={stock.symbol}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
              onClick={() => {
                onSelect(stock.symbol);
                setQuery('');
              }}
            >
              <div>
                <div className="font-medium">{stock.symbol}</div>
                <div className="text-sm text-gray-500">{stock.name}</div>
              </div>
              <div className={`text-right ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                ${stock.price.toFixed(2)}
                <div className="text-xs">
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
