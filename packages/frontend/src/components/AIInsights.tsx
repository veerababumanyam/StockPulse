
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
          bg: 'bg-stockpulse-pastel-green', 
          text: 'text-stockpulse-green',
          icon: TrendingUp
        };
      case 'sell':
        return { 
          bg: 'bg-stockpulse-pastel-pink', 
          text: 'text-stockpulse-coral',
          icon: TrendingDown
        };
      case 'hold':
        return { 
          bg: 'bg-stockpulse-pastel-blue', 
          text: 'text-stockpulse-blue',
          icon: Shuffle
        };
      case 'watch':
        return { 
          bg: 'bg-stockpulse-pastel-yellow', 
          text: 'text-stockpulse-gold',
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
      <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gradient-pastel">
        <div className="flex items-center">
          <div className="mr-3 p-2 bg-stockpulse-pastel-purple rounded-lg">
            <Brain className="h-5 w-5 text-stockpulse-purple" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold">AI Insights</h2>
            <p className="text-xs text-gray-500">
              Powered by StockPulse AI analysis
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className="bg-white/90 shadow-neumorphic-sm-inset">
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
                className="p-5 hover:bg-stockpulse-gray-light/30 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${0.1 + index * 0.05}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center flex-wrap gap-2">
                    <div className={`${typeStyle.bg} ${typeStyle.text} px-3 py-1.5 rounded-lg text-xs font-semibold uppercase flex items-center space-x-1 shadow-neumorphic-sm-inset`}>
                      <Icon className="h-3.5 w-3.5 mr-1" />
                      <span>{insight.type}</span>
                    </div>
                    <Badge variant="outline" className="capitalize bg-white/90 shadow-neumorphic-sm-inset">
                      {insight.stock}
                    </Badge>
                    <Badge variant="outline" className="capitalize bg-white/90 shadow-neumorphic-sm-inset">
                      {insight.timeframe === 'short' ? 'Short term' : 
                       insight.timeframe === 'medium' ? 'Medium term' : 'Long term'}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <div className="bg-stockpulse-pastel-blue h-2 w-24 rounded-full mr-2 shadow-neumorphic-sm-inset">
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
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{insight.details}</p>
                
                <div className="text-xs text-gray-400 flex items-center">
                  <span className="indicator-dot bg-stockpulse-blue-light mr-2"></span>
                  {formatTimestamp(insight.timestamp)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <div className="inline-flex rounded-full bg-stockpulse-pastel-purple p-3 mb-4 shadow-neumorphic-sm">
              <Brain className="h-6 w-6 text-stockpulse-purple" />
            </div>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">No insights available</h3>
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
