import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import ColorThemeSelector from './ui/color-theme-selector';
import ThemeSwatch from './ThemeSwatch';
import ThemePreview from './ThemePreview';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { themeNames, ThemeColor } from '@/lib/theme';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

const Settings = () => {
  const { themeMode, themeColor, setThemeColor } = useTheme();
  
  // State for notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    priceAlerts: false,
    stockNews: false,
    tradingSignals: true,
    marketSentiment: false
  });
  
  // State for privacy preferences
  const [privacyPrefs, setPrivacyPrefs] = useState({
    analyticsData: true,
    personalizedContent: true
  });
  
  // Handler for notification toggles
  const handleNotificationChange = (key: keyof typeof notificationPrefs) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Handler for privacy toggles
  const handlePrivacyChange = (key: keyof typeof privacyPrefs) => {
    setPrivacyPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-5xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Settings</h1>
      
      <Tabs defaultValue="appearance" className="w-full">
        <div className="mb-6 overflow-x-auto pb-1 -mx-4 px-4">
          <TabsList className="w-full min-w-[500px] flex sm:min-w-0 sm:flex-nowrap">
            <TabsTrigger value="appearance" className="flex-1">Appearance</TabsTrigger>
            <TabsTrigger value="account" className="flex-1">Account</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1">Notifications</TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">Privacy</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-0 space-y-4 sm:space-y-6 focus:outline-none">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Theme Mode</CardTitle>
              <CardDescription>
                Choose between light and dark mode
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-toggle" className="font-medium">
                    Theme Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {themeMode === 'light' ? 'Light mode' : 'Dark mode'}
                  </p>
                </div>
                <ThemeToggle id="theme-toggle" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Theme Color</CardTitle>
              <CardDescription>
                Customize your theme color
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <Label className="font-medium">Current Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Currently using {themeNames[themeColor]} theme
                  </p>
                </div>
                <ColorThemeSelector />
              </div>
              
              <div className="pt-4 border-t border-border">
                <Label className="font-medium mb-3 block">Available Themes</Label>
                
                <Tabs defaultValue="previews" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 mb-4">
                    <TabsTrigger value="previews">Previews</TabsTrigger>
                    <TabsTrigger value="swatches">Swatches</TabsTrigger>
                    <TabsTrigger value="list">List</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="previews" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {(['magenta', 'teal', 'indigo', 'amber', 'emerald', 'rose'] as ThemeColor[]).map((color) => (
                        <ThemePreview key={color} color={color} />
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="swatches" className="mt-0">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(['magenta', 'teal', 'indigo', 'amber', 'emerald', 'rose'] as ThemeColor[]).map((color) => (
                        <div 
                          key={color}
                          className={`cursor-pointer transition-all duration-200 ${
                            themeColor === color ? 'scale-105 ring-2 ring-primary' : 'hover:scale-105'
                          }`}
                        >
                          <ThemeSwatch color={color} showLabel={true} />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="list" className="mt-0">
                    <RadioGroup 
                      value={themeColor} 
                      onValueChange={(value) => setThemeColor(value as ThemeColor)}
                      className="space-y-2"
                    >
                      {Object.entries(themeNames).map(([key, name]) => (
                        <div key={key} className="flex items-center space-x-2">
                          <RadioGroupItem value={key} id={`theme-${key}`} />
                          <Label htmlFor={`theme-${key}`} className="cursor-pointer">
                            {name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Account Tab */}
        <TabsContent value="account" className="mt-0 space-y-4 sm:space-y-6 focus:outline-none">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
              <div>
                <Label className="font-medium">
                  Email
                </Label>
                <p className="text-sm text-muted-foreground">
                  example@stockpulse.ai
                </p>
              </div>
              <div>
                <Label className="font-medium">
                  Password
                </Label>
                <p className="text-sm text-muted-foreground">
                  Last changed 30 days ago
                </p>
                <button className="text-sm text-primary hover:underline mt-1">
                  Change password
                </button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div>
                <Label className="font-medium">
                  Current Plan
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pro Plan (Monthly)
                </p>
                <button className="text-sm text-primary hover:underline mt-1">
                  Manage subscription
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-0 space-y-4 sm:space-y-6 focus:outline-none">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price-alerts" className="font-medium">
                    Price Alerts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when price targets are hit
                  </p>
                </div>
                <Switch 
                  id="price-alerts"
                  checked={notificationPrefs.priceAlerts}
                  onCheckedChange={() => handleNotificationChange('priceAlerts')}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="space-y-1">
                  <Label htmlFor="stock-news" className="font-medium">
                    Stock News
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about stocks in your watchlist
                  </p>
                </div>
                <Switch 
                  id="stock-news"
                  checked={notificationPrefs.stockNews}
                  onCheckedChange={() => handleNotificationChange('stockNews')}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>App Notifications</CardTitle>
              <CardDescription>
                Configure in-app notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor="trading-signals" className="font-medium">
                    Trading Signals
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new trading signals
                  </p>
                </div>
                <Switch 
                  id="trading-signals"
                  checked={notificationPrefs.tradingSignals}
                  onCheckedChange={() => handleNotificationChange('tradingSignals')}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="space-y-1">
                  <Label htmlFor="market-sentiment" className="font-medium">
                    Market Sentiment
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive updates on market sentiment changes
                  </p>
                </div>
                <Switch 
                  id="market-sentiment"
                  checked={notificationPrefs.marketSentiment}
                  onCheckedChange={() => handleNotificationChange('marketSentiment')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Privacy Tab */}
        <TabsContent value="privacy" className="mt-0 space-y-4 sm:space-y-6 focus:outline-none">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Data Privacy</CardTitle>
              <CardDescription>
                Manage how your data is used
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Label htmlFor="analytics-data" className="font-medium">
                    Analytics Data
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow anonymous usage data collection to improve the app
                  </p>
                </div>
                <Switch 
                  id="analytics-data"
                  checked={privacyPrefs.analyticsData}
                  onCheckedChange={() => handlePrivacyChange('analyticsData')}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border">
                <div className="space-y-1">
                  <Label htmlFor="personalized-content" className="font-medium">
                    Personalized Content
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Allow personalization based on your activity
                  </p>
                </div>
                <Switch 
                  id="personalized-content"
                  checked={privacyPrefs.personalizedContent}
                  onCheckedChange={() => handlePrivacyChange('personalizedContent')}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle>Data Export</CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4">
              <button className="text-sm text-primary hover:underline">
                Export all data
              </button>
              <div className="border-t border-border pt-4">
                <button className="text-sm text-destructive hover:underline">
                  Delete account and all data
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings; 