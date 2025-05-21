
import { AIInsight } from '@/lib/mockData';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Shuffle, Eye } from 'lucide-react';

interface AIInsightsProps {
  insights: AIInsight[];
  selectedStock?: string;
}

const AIInsights: React.FC<AIInsightsProps> = ({ insights, selectedStock }) => {
  // Filter insights by selected stock if provided
  const filteredInsights = selectedStock
    ? insights.filter(insight => insight.stock === selectedStock)
    : insights;

  // Function to determine the styles based on the recommendation type
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'buy':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800',
          icon: TrendingUp
        };
      case 'sell':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800',
          icon: TrendingDown
        };
      case 'hold':
        return { 
          bg: 'bg-blue-100', 
          text: 'text-blue-800',
          icon: Shuffle
        };
      case 'watch':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800',
          icon: Eye
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800',
          icon: Eye
        };
    }
  };

  // Function to format the timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="stockpulse-card overflow-hidden animate-slide-up">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-stockpulse-purple/10 to-stockpulse-blue-light/5">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-stockpulse-purple mr-2" />
          <div>
            <h2 className="text-lg font-semibold">AI Insights</h2>
            <p className="text-xs text-gray-500">
              Powered by StockPulse AI analysis
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className="bg-white/90">
          {selectedStock ? `Insights for ${selectedStock}` : 'All Insights'}
        </Badge>
      </div>
      
      <div className="divide-y divide-gray-100">
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight, index) => {
            const typeStyle = getTypeStyles(insight.type);
            const Icon = typeStyle.icon;
            
            return (
              <div 
                key={insight.id} 
                className="p-5 hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div className={`${typeStyle.bg} ${typeStyle.text} px-2.5 py-1.5 rounded-lg text-xs font-semibold uppercase flex items-center space-x-1`}>
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      <span>{insight.type}</span>
                    </div>
                    <Badge variant="outline" className="ml-2 capitalize bg-white">
                      {insight.stock}
                    </Badge>
                    <Badge variant="outline" className="ml-2 capitalize bg-white">
                      {insight.timeframe === 'short' ? 'Short term' : 
                       insight.timeframe === 'medium' ? 'Medium term' : 'Long term'}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-200 h-2 w-24 rounded-full mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            insight.confidence > 70 ? 'bg-stockpulse-green' : 
                            insight.confidence > 40 ? 'bg-stockpulse-gold' : 
                            'bg-stockpulse-coral'
                          }`}
                          style={{ width: `${insight.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold">{insight.confidence}%</span>
                    </div>
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-2">{insight.summary}</h3>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">{insight.details}</p>
                
                <div className="text-xs text-gray-400 flex items-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-stockpulse-blue-light mr-2"></span>
                  {formatTimestamp(insight.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex rounded-full bg-gray-100 p-3 mb-4">
              <Brain className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No insights available</h3>
            <p className="text-sm text-gray-500">
              {selectedStock ? 
                `No AI insights available for ${selectedStock} at this time.` : 
                'No insights available. Please check back later.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
