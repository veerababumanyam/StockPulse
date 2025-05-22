import { ArrowDownIcon, ArrowUpIcon } from '@/assets/icons';
import { Stock } from '@/lib/mockData';
import { themeClasses } from '@/lib/theme-constants';
import { getAdaptiveClasses, getCardColorClasses } from '@/lib/theme-utils';

interface StockCardProps {
  stock: Stock;
  onClick?: () => void;
  isSelected?: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onClick, isSelected = false }) => {
  const isPriceUp = stock.change > 0;
  const adaptiveClasses = getAdaptiveClasses();

  return (
    <div
      className={`${themeClasses.container.card} p-5 cursor-pointer transition-all duration-300 hover:translate-y-[-2px] ${
        isSelected ? adaptiveClasses.cardHighlight : ''
      }`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className={`text-lg font-semibold ${themeClasses.text.primary}`}>{stock.symbol}</div>
          <div className={`text-sm ${themeClasses.text.secondary} truncate max-w-[150px]`}>{stock.name}</div>
        </div>
        <div className={`flex items-center px-3 py-1.5 rounded-full ${
          isPriceUp
            ? getCardColorClasses('priceUp')
            : getCardColorClasses('priceDown')
        }`}>
          {isPriceUp ? (
            <ArrowUpIcon className="w-3.5 h-3.5 mr-1" />
          ) : (
            <ArrowDownIcon className="w-3.5 h-3.5 mr-1" />
          )}
          <span className="text-xs font-medium">
            {Math.abs(stock.changePercent).toFixed(2)}%
          </span>
        </div>
      </div>

      <div className={`text-2xl font-bold mb-4 ${themeClasses.text.primary}`}>${stock.price.toFixed(2)}</div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className={`p-3 rounded-lg ${getCardColorClasses('volume')}`}>
          <div className="font-medium mb-1">Volume</div>
          <div className="font-semibold">{(stock.volume / 1000000).toFixed(1)}M</div>
        </div>
        <div className={`p-3 rounded-lg ${getCardColorClasses('marketCap')}`}>
          <div className="font-medium mb-1">Market Cap</div>
          <div className="font-semibold">{stock.marketCap}</div>
        </div>
        <div className={`p-3 rounded-lg ${getCardColorClasses('peRatio')}`}>
          <div className="font-medium mb-1">P/E Ratio</div>
          <div className="font-semibold">{stock.pe ? stock.pe.toFixed(2) : 'N/A'}</div>
        </div>
        <div className={`p-3 rounded-lg ${getCardColorClasses('dividend')}`}>
          <div className="font-medium mb-1">Dividend</div>
          <div className="font-semibold">{stock.dividend ? `${stock.dividend}%` : 'N/A'}</div>
        </div>
      </div>
    </div>
  );
};

export default StockCard;
