
import { Stock } from '@/lib/mockData';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  isSelected?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick, isSelected = false }) => {
  const isPriceUp = stock.change > 0;

  return (
    <div
      className={`stockpulse-card p-4 cursor-pointer hover:translate-y-[-2px] transition-all duration-300 ${
        isSelected ? 'border-l-4 border-stockpulse-blue shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="font-bold text-gray-800">{stock.symbol}</div>
          <div className="text-sm text-gray-500 truncate max-w-[150px]">{stock.name}</div>
        </div>
        <div className={`flex items-center px-2 py-1 rounded-full ${
          isPriceUp ? 'bg-green-100 text-stockpulse-green' : 'bg-red-100 text-stockpulse-coral'
        }`}>
          {isPriceUp ? (
            <ArrowUp className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDown className="w-3 h-3 mr-1" />
          )}
          <span className="text-xs font-medium">
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="text-2xl font-bold mb-3">${stock.price.toFixed(2)}</div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 p-2 rounded-md">
          <div className="text-gray-500 font-medium">Volume</div>
          <div className="font-semibold">{(stock.volume / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-md">
          <div className="text-gray-500 font-medium">Market Cap</div>
          <div className="font-semibold">{stock.marketCap}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-md">
          <div className="text-gray-500 font-medium">P/E Ratio</div>
          <div className="font-semibold">{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</div>
        </div>
        <div className="bg-gray-50 p-2 rounded-md">
          <div className="text-gray-500 font-medium">Dividend</div>
          <div className="font-semibold">{stock.dividend ? `${stock.dividend}%` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
