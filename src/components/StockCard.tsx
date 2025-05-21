
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
      className={`stockpulse-card p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] ${
        isSelected ? 'border-l-4 border-stockpulse-blue' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="font-heading text-lg font-semibold text-gray-800">{stock.symbol}</div>
          <div className="text-sm text-gray-500 truncate max-w-[150px]">{stock.name}</div>
        </div>
        <div className={`flex items-center px-3 py-1.5 rounded-full ${
          isPriceUp ? 'bg-stockpulse-pastel-green text-stockpulse-green' : 'bg-stockpulse-pastel-pink text-stockpulse-coral'
        }`}>
          {isPriceUp ? (
            <ArrowUp className="w-3.5 h-3.5 mr-1" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 mr-1" />
          )}
          <span className="text-xs font-medium">
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>
      
      <div className="text-2xl font-bold mb-4">${stock.price.toFixed(2)}</div>
      
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-stockpulse-pastel-blue p-3 rounded-lg">
          <div className="text-gray-600 font-medium mb-1">Volume</div>
          <div className="font-semibold">{(stock.volume / 1000000).toFixed(1)}M</div>
        </div>
        <div className="bg-stockpulse-pastel-purple p-3 rounded-lg">
          <div className="text-gray-600 font-medium mb-1">Market Cap</div>
          <div className="font-semibold">{stock.marketCap}</div>
        </div>
        <div className="bg-stockpulse-pastel-yellow p-3 rounded-lg">
          <div className="text-gray-600 font-medium mb-1">P/E Ratio</div>
          <div className="font-semibold">{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</div>
        </div>
        <div className="bg-stockpulse-pastel-orange p-3 rounded-lg">
          <div className="text-gray-600 font-medium mb-1">Dividend</div>
          <div className="font-semibold">{stock.dividend ? `${stock.dividend}%` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
