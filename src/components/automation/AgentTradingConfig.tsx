import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, AlertTriangle, BarChart2, Bot, Shield } from 'lucide-react';

interface AgentConfig {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'disabled';
  strategy: string;
  riskLevel: 'low' | 'medium' | 'high';
  maxPositionSize: number;
  maxDrawdown: number;
  tradingHours: {
    start: string;
    end: string;
  };
  allowedInstruments: string[];
  performance: {
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    avgReturn: number;
  };
}

interface AgentTradingConfigProps {
  userId?: string;
  showPerformance?: boolean;
  showRiskControls?: boolean;
}

const AgentTradingConfig: React.FC<AgentTradingConfigProps> = ({
  userId = 'user123',
  showPerformance = true,
  showRiskControls = true
}) => {
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  
  // Generate mock agent data
  const generateMockAgents = (): AgentConfig[] => {
    const mockAgents: AgentConfig[] = [
      {
        id: 'agent-001',
        name: 'Momentum Trader',
        status: 'active',
        strategy: 'Follows price momentum with technical indicators',
        riskLevel: 'medium',
        maxPositionSize: 5,
        maxDrawdown: 10,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        allowedInstruments: ['stocks', 'etfs'],
        performance: {
          winRate: 62,
          profitFactor: 1.8,
          totalTrades: 145,
          avgReturn: 0.7
        }
      },
      {
        id: 'agent-002',
        name: 'Swing Trader',
        status: 'paused',
        strategy: 'Captures multi-day price movements',
        riskLevel: 'medium',
        maxPositionSize: 10,
        maxDrawdown: 15,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        allowedInstruments: ['stocks', 'etfs'],
        performance: {
          winRate: 58,
          profitFactor: 2.1,
          totalTrades: 87,
          avgReturn: 1.2
        }
      },
      {
        id: 'agent-003',
        name: 'Options Scalper',
        status: 'disabled',
        strategy: 'Quick in-and-out options trades based on volatility',
        riskLevel: 'high',
        maxPositionSize: 3,
        maxDrawdown: 20,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        allowedInstruments: ['options'],
        performance: {
          winRate: 54,
          profitFactor: 1.5,
          totalTrades: 203,
          avgReturn: 1.8
        }
      },
      {
        id: 'agent-004',
        name: 'Dividend Harvester',
        status: 'active',
        strategy: 'Focuses on dividend capture and yield optimization',
        riskLevel: 'low',
        maxPositionSize: 15,
        maxDrawdown: 8,
        tradingHours: {
          start: '09:30',
          end: '16:00'
        },
        allowedInstruments: ['stocks', 'etfs'],
        performance: {
          winRate: 78,
          profitFactor: 2.4,
          totalTrades: 64,
          avgReturn: 0.5
        }
      }
    ];
    
    return mockAgents;
  };
  
  // Load agent data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        const mockData = generateMockAgents();
        setAgents(mockData);
        if (mockData.length > 0) {
          setSelectedAgent(mockData[0]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to load agent configurations');
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [userId]);

  // Helper function to get status color
  const getStatusColor = (status: AgentConfig['status']): string => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400';
      case 'paused':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'disabled':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };
  
  // Helper function to get status background color
  const getStatusBgColor = (status: AgentConfig['status']): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'paused':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'disabled':
        return 'bg-gray-100 dark:bg-gray-800';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };
  
  // Helper function to get risk level color
  const getRiskColor = (risk: AgentConfig['riskLevel']): string => {
    switch (risk) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center h-40 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Agent Trading Configuration</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure and manage your automated trading agents
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium">
            Create New Agent
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Agents</h4>
          <div className="space-y-2">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors duration-150 ${
                  selectedAgent?.id === agent.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="flex justify-between items-center">
                  <h5 className="font-medium">{agent.name}</h5>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBgColor(agent.status)} ${getStatusColor(agent.status)}`}>
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {agent.strategy}
                </p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className={getRiskColor(agent.riskLevel)}>
                    {agent.riskLevel.toUpperCase()} RISK
                  </span>
                  {showPerformance && (
                    <span>
                      Win Rate: {agent.performance.winRate}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="md:col-span-2">
          {selectedAgent ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isEditing ? 'Edit Agent Configuration' : 'Agent Details'}
                </h4>
                <div className="flex space-x-2">
                  {!isEditing ? (
                    <button 
                      className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm font-medium dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm font-medium"
                        onClick={() => setIsEditing(false)}
                      >
                        Save
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{selectedAgent.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {selectedAgent.strategy}
                    </p>
                  </div>
                  
                  {!isEditing ? (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBgColor(selectedAgent.status)} ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                    </div>
                  ) : (
                    <select 
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={selectedAgent.status}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  )}
                </div>
                
                {showPerformance && !isEditing && (
                  <div className="grid grid-cols-4 gap-3 mt-4">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Win Rate</p>
                      <p className="text-lg font-semibold">{selectedAgent.performance.winRate}%</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Profit Factor</p>
                      <p className="text-lg font-semibold">{selectedAgent.performance.profitFactor}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total Trades</p>
                      <p className="text-lg font-semibold">{selectedAgent.performance.totalTrades}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg Return</p>
                      <p className="text-lg font-semibold">{selectedAgent.performance.avgReturn}%</p>
                    </div>
                  </div>
                )}
              </div>
              
              {showRiskControls && (
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-4 h-4 mr-1 text-gray-700 dark:text-gray-300" />
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Risk Management</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Risk Level</p>
                      {!isEditing ? (
                        <p className={`font-medium capitalize ${getRiskColor(selectedAgent.riskLevel)}`}>
                          {selectedAgent.riskLevel}
                        </p>
                      ) : (
                        <select 
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={selectedAgent.riskLevel}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Position Size (%)</p>
                      {!isEditing ? (
                        <p className="font-medium">{selectedAgent.maxPositionSize}%</p>
                      ) : (
                        <input 
                          type="number" 
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={selectedAgent.maxPositionSize}
                          min="1"
                          max="100"
                        />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Max Drawdown (%)</p>
                      {!isEditing ? (
                        <p className="font-medium">{selectedAgent.maxDrawdown}%</p>
                      ) : (
                        <input 
                          type="number" 
                          className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          value={selectedAgent.maxDrawdown}
                          min="1"
                          max="100"
                        />
                      )}
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Trading Hours</p>
                      {!isEditing ? (
                        <p className="font-medium">{selectedAgent.tradingHours.start} - {selectedAgent.tradingHours.end}</p>
                      ) : (
                        <div className="flex space-x-2">
                          <input 
                            type="time" 
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={selectedAgent.tradingHours.start}
                          />
                          <span className="flex items-center">-</span>
                          <input 
                            type="time" 
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            value={selectedAgent.tradingHours.end}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <BarChart2 className="w-4 h-4 mr-1 text-gray-700 dark:text-gray-300" />
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Allowed Instruments</h4>
                </div>
                
                {!isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.allowedInstruments.map((instrument, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {instrument.toUpperCase()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="stocks" 
                        checked={selectedAgent.allowedInstruments.includes('stocks')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="stocks" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Stocks
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="etfs" 
                        checked={selectedAgent.allowedInstruments.includes('etfs')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="etfs" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        ETFs
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="options" 
                        checked={selectedAgent.allowedInstruments.includes('options')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="options" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Options
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="futures" 
                        checked={selectedAgent.allowedInstruments.includes('futures')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="futures" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Futures
                      </label>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Notice</h5>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                      Automated trading involves risk. Past performance does not guarantee future results. 
                      Always monitor your agents and ensure risk parameters are set appropriately for your 
                      financial situation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
              <Bot className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTradingConfig;
