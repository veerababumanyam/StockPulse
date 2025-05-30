import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Shield,
  Bell,
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  Palette,
} from "lucide-react";
import ThemeSelector from "../components/ui/ThemeSelector";
import { useTheme } from "../contexts/ThemeContext";
import { PageLayout, Card } from "../components/layout/PageLayout";

const SettingsPage: React.FC = () => {
  const { mode, colorTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");

  const tabs = [
    { id: "appearance", label: "Appearance", icon: <Palette /> },
    { id: "account", label: "Account", icon: <User /> },
    { id: "security", label: "Security", icon: <Shield /> },
    { id: "notifications", label: "Notifications", icon: <Bell /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle /> },
  ];

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
                      ? "bg-primary/10 text-primary"
                      : "text-text hover:bg-surface/50"
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
            {activeTab === "appearance" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6 text-text">
                  Appearance Settings
                </h3>

                <div className="space-y-8">
                  {/* Theme Mode */}
                  <div>
                    <h4 className="text-md font-medium mb-4 text-text">
                      Theme & Colors
                    </h4>
                    <p className="text-sm text-text/60 mb-4">
                      Customize the look and feel of StockPulse with your
                      preferred color theme and mode.
                    </p>

                    <div className="mb-6">
                      <ThemeSelector className="mb-4" />

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-border bg-surface">
                          <h5 className="font-medium mb-2 text-text">
                            Current Theme
                          </h5>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded-full bg-primary"></div>
                            <div className="w-4 h-4 rounded-full bg-secondary"></div>
                            <div className="w-4 h-4 rounded-full bg-accent"></div>
                            <span className="ml-2 text-sm text-text/60">
                              {colorTheme.charAt(0).toUpperCase() +
                                colorTheme.slice(1).replace("-", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg border border-border bg-surface">
                          <h5 className="font-medium mb-2 text-text">
                            Current Mode
                          </h5>
                          <div className="flex items-center">
                            {mode === "light" ? (
                              <Sun className="w-4 h-4 mr-2 text-primary" />
                            ) : mode === "dark" ? (
                              <Moon className="w-4 h-4 mr-2 text-accent" />
                            ) : (
                              <div className="flex">
                                <Sun className="w-4 h-4 mr-1 text-primary" />
                                <Moon className="w-4 h-4 mr-2 text-accent" />
                              </div>
                            )}
                            <span className="text-sm text-text/60">
                              {mode.charAt(0).toUpperCase() + mode.slice(1)}{" "}
                              Mode
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Layout Preferences */}
                  <div>
                    <h4 className="text-md font-medium mb-4">
                      Layout Preferences
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Customize how information is displayed throughout the
                      application.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Compact Mode</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Reduce padding and spacing to fit more content on
                            screen
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Show Grid Lines</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Display grid lines in charts and tables
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            checked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">Animations</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enable animations and transitions
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            className="sr-only peer"
                            checked
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Font Settings */}
                  <div>
                    <h4 className="text-md font-medium mb-4">Font Settings</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Adjust text size and font preferences.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Font Size
                        </label>
                        <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                          <option value="small">Small</option>
                          <option value="medium" selected>
                            Medium
                          </option>
                          <option value="large">Large</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Font Family
                        </label>
                        <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5">
                          <option value="inter" selected>
                            Inter (Default)
                          </option>
                          <option value="roboto">Roboto</option>
                          <option value="opensans">Open Sans</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200">
                      Save Preferences
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "account" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6">Account Settings</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your account information and preferences.
                </p>

                {/* Account settings content would go here */}
              </motion.div>
            )}

            {activeTab === "security" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6">Security Settings</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Manage your security preferences and authentication methods.
                </p>

                {/* Security settings content would go here */}
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6">
                  Notification Settings
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Customize how and when you receive notifications.
                </p>

                {/* Notification settings content would go here */}
              </motion.div>
            )}

            {activeTab === "help" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-lg font-medium mb-6">Help & Support</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Get help with StockPulse and contact support.
                </p>

                {/* Help & support content would go here */}
              </motion.div>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default SettingsPage;
