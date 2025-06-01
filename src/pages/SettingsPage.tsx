import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Shield,
  Bell,
  LogOut,
  HelpCircle,
  Palette,
  BarChart3,
  Sparkles,
  Clock,
} from 'lucide-react';
import { UnifiedThemeSelector } from '../components/common/UnifiedThemeSelector';
import { useTheme } from '../hooks/useTheme'; // Enhanced hook
import { PageLayout, Card } from '../components/layout/PageLayout';

const SettingsPage: React.FC = () => {
  // Use enhanced theme hook with all features
  const { 
    mode, 
    colorTheme, 
    isDark, 
    analytics, 
    recommendations, 
    autoSwitch,
    toggleAutoSwitch,
    exportThemeData,
    importThemeData
  } = useTheme({
    enableAnalytics: true,
    enableRecommendations: true,
    context: 'settings-page'
  });
  
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Palette /> },
    { id: 'account', label: 'Account', icon: <User /> },
    { id: 'security', label: 'Security', icon: <Shield /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell /> },
    { id: 'help', label: 'Help & Support', icon: <HelpCircle /> },
  ];

  const handleExportTheme = async () => {
    try {
      const data = await exportThemeData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stockpulse-theme-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export theme data:', error);
    }
  };

  const handleImportTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        await importThemeData(data);
        console.log('Theme data imported successfully');
      } catch (error) {
        console.error('Failed to import theme data:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <PageLayout>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center text-text">
              <Settings className="mr-2 h-5 w-5 text-primary" />
              Settings
            </h2>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-text hover:bg-surface/50'
                  }`}
                >
                  <span className="mr-3 h-5 w-5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
              <button className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-secondary hover:bg-secondary/10 transition-colors duration-150">
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </button>
            </nav>
          </Card>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <Card padding="lg">
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">
                  Appearance Settings
                </h3>

                <div className="space-y-8">
                  {/* Enhanced Theme Management */}
                  <div>
                    <h4 className="text-md font-medium mb-4 text-text flex items-center">
                      <Palette className="mr-2 h-5 w-5 text-primary" />
                      Theme & Colors
                    </h4>
                    <p className="text-sm text-text/60 mb-6">
                      Customize StockPulse with AI-powered theme recommendations, 
                      analytics, and advanced theme management features.
                    </p>

                    {/* Unified Theme Selector - Full Featured */}
                    <div className="mb-8 p-6 rounded-xl border border-border bg-surface/30">
                      <UnifiedThemeSelector
                        variant="full"
                        position="settings"
                        showLabels={true}
                        showRecommendations={true}
                        showAnalytics={true}
                        enableAutoSwitch={true}
                        className="settings-theme-selector"
                        title="Theme Management"
                        description="Advanced theme controls with AI recommendations and usage analytics"
                      />
                    </div>

                    {/* Theme Analytics Section */}
                    {analytics && (
                      <div className="p-6 rounded-xl border border-border bg-surface/20">
                        <h5 className="font-medium mb-4 text-text flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4 text-primary" />
                          Theme Usage Analytics
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-background/50">
                            <div className="text-sm text-text/60">Total Changes</div>
                            <div className="text-lg font-semibold text-text">
                              {analytics.totalChanges || 0}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <div className="text-sm text-text/60">Most Used Theme</div>
                            <div className="text-lg font-semibold text-text">
                              {analytics.mostUsedTheme || colorTheme}
                            </div>
                          </div>
                          <div className="p-3 rounded-lg bg-background/50">
                            <div className="text-sm text-text/60">Usage Time</div>
                            <div className="text-lg font-semibold text-text">
                              {analytics.totalUsageTime ? 
                                `${Math.round(analytics.totalUsageTime / 1000 / 60)}m` : 
                                '0m'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* AI Recommendations Section */}
                    {recommendations && recommendations.length > 0 && (
                      <div className="p-6 rounded-xl border border-border bg-surface/20">
                        <h5 className="font-medium mb-4 text-text flex items-center">
                          <Sparkles className="mr-2 h-4 w-4 text-primary" />
                          AI Theme Recommendations
                        </h5>
                        <div className="space-y-3">
                          {recommendations.slice(0, 3).map((rec, index) => (
                            <div key={index} className="p-3 rounded-lg bg-background/50 border border-border/50">
                              <div className="text-sm font-medium text-text">{rec.theme}</div>
                              <div className="text-xs text-text/60 mt-1">{rec.reason}</div>
                              <div className="text-xs text-primary mt-1">
                                Confidence: {Math.round(rec.confidence * 100)}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Auto-Switch Settings */}
                    <div className="p-6 rounded-xl border border-border bg-surface/20">
                      <h5 className="font-medium mb-4 text-text flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        Automatic Theme Switching
                      </h5>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-text">Smart Auto-Switch</div>
                          <div className="text-xs text-text/60 mt-1">
                            Automatically switch themes based on time, system preference, and usage patterns
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={autoSwitch?.enabled || false}
                            onChange={toggleAutoSwitch}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                      {autoSwitch?.enabled && (
                        <div className="mt-4 p-3 rounded-lg bg-background/50">
                          <div className="text-xs text-text/60">
                            Auto-switch is enabled. Themes will change based on:
                          </div>
                          <ul className="text-xs text-text/80 mt-2 space-y-1">
                            <li>• System time (dark mode at night)</li>
                            <li>• System preferences</li>
                            <li>• Usage patterns and analytics</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Theme Data Management */}
                    <div className="p-6 rounded-xl border border-border bg-surface/20">
                      <h5 className="font-medium mb-4 text-text">Theme Data Management</h5>
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleExportTheme}
                          className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors duration-200"
                        >
                          Export Theme Data
                        </button>
                        <label className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg text-sm font-medium hover:bg-secondary/20 transition-colors duration-200 cursor-pointer">
                          Import Theme Data
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportTheme}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="text-xs text-text/60 mt-3">
                        Export your theme preferences and analytics data, or import settings from another device.
                      </div>
                    </div>
                  </div>

                  {/* Layout Preferences */}
                  <div>
                    <h4 className="text-md font-medium mb-4">
                      Layout Preferences
                    </h4>
                    <p className="text-sm text-text/60 mb-4">
                      Customize how information is displayed throughout the application.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-text">Compact Mode</h5>
                          <p className="text-sm text-text/60">
                            Reduce padding and spacing to fit more content on screen
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-text">Show Grid Lines</h5>
                          <p className="text-sm text-text/60">
                            Display grid lines in charts and tables
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-text">Animations</h5>
                          <p className="text-sm text-text/60">
                            Enable animations and transitions
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            defaultChecked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Font Settings */}
                  <div>
                    <h4 className="text-md font-medium mb-4 text-text">Font Settings</h4>
                    <p className="text-sm text-text/60 mb-4">
                      Adjust typography settings for better readability.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Font Size
                        </label>
                        <select className="block w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                          <option value="small">Small</option>
                          <option value="medium" selected>Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-text mb-2">
                          Font Family
                        </label>
                        <select className="block w-full px-3 py-2 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary">
                          <option value="inter">Inter (Recommended)</option>
                          <option value="system">System Default</option>
                          <option value="roboto">Roboto</option>
                          <option value="opensans">Open Sans</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other tabs content */}
            {activeTab === 'account' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">Account Settings</h3>
                <p className="text-text/60">Account settings content goes here...</p>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">Security Settings</h3>
                <p className="text-text/60">Security settings content goes here...</p>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">Notification Settings</h3>
                <p className="text-text/60">Notification settings content goes here...</p>
              </motion.div>
            )}

            {activeTab === 'help' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">Help & Support</h3>
                <p className="text-text/60">Help and support content goes here...</p>
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
