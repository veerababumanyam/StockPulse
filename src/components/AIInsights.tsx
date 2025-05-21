
import { AIInsight } from '@/lib/mockData';

interface AIInsightsProps {
  insights: AIInsight[];
  selectedStock?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, selectedStock }) => {
  // Filter insights by selected stock if provided
  const filteredInsights = selectedStock
    ? insights.filter(insight => insight.stock === selectedStock)
    : insights;

  // Function to determine the background color based on the recommendation type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'buy':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800',
          icon: '↑'
        };
      case 'sell':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800',
          icon: '↓'
        };
      case 'hold':
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-800',
          icon: '→'
        };
      case 'watch':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800',
          icon: '👁️'
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          icon: '•'
        };
    }
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="stockpulse-card">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold">AI Insights</h2>
        <p className="text-sm text-gray-500">
          Powered by StockPulse AI analysis
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => {
            const typeStyle = getTypeStyles(insight.type);
            
            return (
              <div key={insight.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <div className={`${typeStyle.bg} ${typeStyle.text} px-2 py-1 rounded-md text-xs font-medium uppercase flex items-center space-x-1`}>
                      <span>{typeStyle.icon}</span>
                      <span>{insight.type}</span>
                    </div>
                    <span className="ml-2 text-sm font-medium">{insight.stock}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {insight.timeframe === 'short' ? 'Short term' : 
                       insight.timeframe === 'medium' ? 'Medium term' : 'Long term'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-gray-200 h-1.5 w-24 rounded-full mr-2">
                      <div 
                        className={`h-1.5 rounded-full ${
                          insight.confidence > 70 ? 'bg-green-500' : 
                          insight.confidence > 40 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${insight.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium">{insight.confidence}%</span>
                  </div>
                </div>
                
                <h3 className="font-medium mb-1">{insight.summary}</h3>
                <p className="text-sm text-gray-600 mb-2">{insight.details}</p>
                
                <div className="text-xs text-gray-500">
                  {formatTimestamp(insight.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-500">
            {selectedStock ? 
              `No AI insights available for ${selectedStock} at this time.` : 
              'No insights available. Please check back later.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
