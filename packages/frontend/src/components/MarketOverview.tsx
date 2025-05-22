
import { MarketIndex } from '@/lib/mockData';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOverviewProps {
  indices: MarketIndex[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices }) => {
  return (
    <div className="stockpulse-card overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-pastel">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="w-1.5 h-6 bg-stockpulse-blue rounded-full mr-1"></span>
          Market Overview
        </h2>
      </div>
      <div className="divide-y divide-gray-100">
        {indices.map((index) => (
          <div 
            key={index.name} 
            className="px-6 py-4 flex justify-between items-center hover:bg-stockpulse-gray-light/30 transition-colors duration-300"
          >
            <div>
              <h3 className="font-medium text-gray-800">{index.name}</h3>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-base font-semibold">{index.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <div className={`flex items-center gap-1.5 ${index.change >= 0 ? 'text-stockpulse-green' : 'text-stockpulse-coral'}`}>
                {index.change >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;
