
import { MarketIndex } from '@/lib/mockData';

interface MarketOverviewProps {
  indices: MarketIndex[];
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ indices }) => {
  return (
    <div className="stockpulse-card">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Market Overview</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {indices.map((index) => (
          <div key={index.name} className="px-4 py-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">{index.name}</h3>
            </div>
            <div className="flex flex-col items-end">
              <p className="text-base font-semibold">{index.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
              <div className={`flex items-center ${index.change >= 0 ? 'positive' : 'negative'}`}>
                <span className="text-sm">
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
