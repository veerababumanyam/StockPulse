
import { Stock } from '@/lib/mockData';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick }) => {
  const isPriceUp = stock.change > 0;

  return (
    <div
      className="stockpulse-card p-4 cursor-pointer hover:translate-y-[-2px] transition-transform"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold">{stock.symbol}</div>
          <div className="text-sm text-gray-500 truncate max-w-[150px]">{stock.name}</div>
        </div>
        <div className={`flex items-center px-2 py-1 rounded ${isPriceUp ? 'bg-green-100' : 'bg-red-100'}`}>
          {isPriceUp ? (
            <ArrowUp className="w-3 h-3 text-stockpulse-teal mr-1" />
          ) : (
            <ArrowDown className="w-3 h-3 text-stockpulse-coral mr-1" />
          )}
          <span className={`text-xs font-medium ${isPriceUp ? 'text-stockpulse-teal' : 'text-stockpulse-coral'}`}>
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="text-2xl font-bold mb-3">${stock.price.toFixed(2)}</div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-gray-500">Volume</div>
          <div>{(stock.volume / 1000000).toFixed(1)}M</div>
        </div>
        <div>
          <div className="text-gray-500">Market Cap</div>
          <div>{stock.marketCap}</div>
        </div>
        <div>
          <div className="text-gray-500">P/E Ratio</div>
          <div>{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</div>
        </div>
        <div>
          <div className="text-gray-500">Dividend</div>
          <div>{stock.dividend ? `${stock.dividend}%` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
