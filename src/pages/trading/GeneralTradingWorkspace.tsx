import React from "react";
import { motion } from "framer-motion";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Clock,
  Sliders,
} from "lucide-react";

const GeneralTradingWorkspace: React.FC = () => {
  return (
    <div className="bg-background">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">
          General Trading Workspace
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 text-text">
                Market Overview
              </h2>
              <div className="h-64 bg-surface/50 border border-border rounded-lg flex items-center justify-center">
                <p className="text-text/60">Market overview chart</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-text">
                  Watchlist
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 hover:bg-surface/80 rounded transition-colors duration-200">
                    <span className="font-medium text-text">AAPL</span>
                    <span className="text-green-600">+2.34%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-surface/80 rounded transition-colors duration-200">
                    <span className="font-medium text-text">MSFT</span>
                    <span className="text-red-600">-1.25%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-surface/80 rounded transition-colors duration-200">
                    <span className="font-medium text-text">GOOGL</span>
                    <span className="text-green-600">+0.89%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-text">
                  Recent Trades
                </h3>
                <div className="space-y-2">
                  <div className="p-2 border border-border rounded">
                    <div className="flex justify-between">
                      <span className="font-medium text-text">AAPL Buy</span>
                      <span className="text-green-600">+$125.50</span>
                    </div>
                    <div className="text-sm text-text/60">
                      100 shares @ $182.50
                    </div>
                  </div>
                  <div className="p-2 border border-border rounded">
                    <div className="flex justify-between">
                      <span className="font-medium text-text">MSFT Sell</span>
                      <span className="text-red-600">-$45.25</span>
                    </div>
                    <div className="text-sm text-text/60">
                      50 shares @ $336.75
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="btn-primary w-full">Place Order</button>
                <button className="btn-outline w-full">View Portfolio</button>
                <button className="bg-surface hover:bg-surface/80 border border-border text-text px-4 py-2 rounded-lg w-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50">
                  Market Analysis
                </button>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Account Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text/70">Total Value</span>
                  <span className="font-medium text-text">$125,430.75</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Available Cash</span>
                  <span className="font-medium text-text">$15,250.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Day P&L</span>
                  <span className="font-medium text-green-600">+$1,245.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Total P&L</span>
                  <span className="font-medium text-green-600">+$8,675.25</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeneralTradingWorkspace;
