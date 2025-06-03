import React from "react";
// import Navbar from '@components/layout/Navbar'; // REMOVE: MainLayout provides the Navbar
// import Footer from '@components/layout/Footer'; // REMOVE: MainLayout provides the Footer

const PositionalTrading: React.FC = () => {
  return (
    // The outer div with min-h-screen, flex, flex-col might also be redundant.
    <div className="bg-background">
      {/* <Navbar /> */}
      {/* REMOVED */}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">
          Positional Trading
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <h2 className="text-xl font-semibold text-text">AAPL</h2>
                  <span className="ml-2 text-text/70">Apple Inc.</span>
                </div>
                <div className="flex items-center">
                  <div className="text-2xl font-bold mr-2 text-text">
                    $182.63
                  </div>
                  <div className="flex items-center text-green-600">
                    <svg
                      className="w-5 h-5 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                    <span className="font-medium">+2.34%</span>
                  </div>
                </div>
              </div>

              <div className="h-96 bg-surface/80 border border-border rounded-lg mb-4 flex items-center justify-center">
                <p className="text-text/60">Multi-day chart visualization</p>
              </div>

              <div className="flex space-x-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary/50">
                  1D
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  5D
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  1M
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  3M
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  6M
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  YTD
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  1Y
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-text/60">Open</div>
                  <div className="font-medium text-text">$178.35</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">High</div>
                  <div className="font-medium text-text">$183.12</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Low</div>
                  <div className="font-medium text-text">$177.90</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Volume</div>
                  <div className="font-medium text-text">12.4M</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-text">
                  Technical Analysis
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-text">
                        Moving Averages
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Buy
                      </span>
                    </div>
                    <div className="w-full bg-surface/80 border border-border rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-text/60">
                      <span>Sell (3)</span>
                      <span>Neutral (2)</span>
                      <span>Buy (7)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-text">
                        Oscillators
                      </span>
                      <span className="text-sm font-medium text-yellow-600">
                        Neutral
                      </span>
                    </div>
                    <div className="w-full bg-surface/80 border border-border rounded-full h-2.5">
                      <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{ width: "50%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-text/60">
                      <span>Sell (2)</span>
                      <span>Neutral (6)</span>
                      <span>Buy (3)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-text">
                        Pivot Points
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        Above
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="text-center">
                        <div className="mb-1 text-text/60">R2</div>
                        <div className="text-text">$186.45</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-text/60">R1</div>
                        <div className="text-text">$184.78</div>
                      </div>
                      <div className="text-center bg-surface/80 border border-border rounded py-1">
                        <div className="mb-1 text-text/60">Pivot</div>
                        <div className="font-medium text-text">$181.25</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-text/60">S1</div>
                        <div className="text-text">$179.58</div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-text/60">S2</div>
                        <div className="text-text">$176.35</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-text">
                  Key Indicators
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-text/60">RSI (14)</div>
                      <div className="font-medium text-text">58.3</div>
                      <div className="text-xs text-text/60">Neutral</div>
                    </div>
                    <div>
                      <div className="text-sm text-text/60">MACD</div>
                      <div className="font-medium text-green-600">Bullish</div>
                      <div className="text-xs text-text/60">Signal: 0.85</div>
                    </div>
                    <div>
                      <div className="text-sm text-text/60">Stochastic</div>
                      <div className="font-medium text-text">65.7</div>
                      <div className="text-xs text-text/60">Neutral</div>
                    </div>
                    <div>
                      <div className="text-sm text-text/60">ADX</div>
                      <div className="font-medium text-text">28.4</div>
                      <div className="text-xs text-text/60">Strong Trend</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-text/60 mb-1">
                      Moving Averages
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-text">MA (20)</span>
                        <span className="text-sm text-green-600">
                          $178.45 (Above)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text">MA (50)</span>
                        <span className="text-sm text-green-600">
                          $175.32 (Above)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text">MA (100)</span>
                        <span className="text-sm text-green-600">
                          $172.18 (Above)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-text">MA (200)</span>
                        <span className="text-sm text-green-600">
                          $168.75 (Above)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Pattern Recognition
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">
                      Bullish Engulfing Pattern
                    </div>
                    <div className="text-sm text-text/60">
                      Detected on May 24, 2025. This pattern suggests a
                      potential reversal from a downtrend to an uptrend.
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">Support Level</div>
                    <div className="text-sm text-text/60">
                      Strong support at $175.00. Price has bounced from this
                      level multiple times.
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-full mr-3">
                    <svg
                      className="w-4 h-4 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-text">Resistance Zone</div>
                    <div className="text-sm text-text/60">
                      Approaching resistance at $185.00. Watch for potential
                      rejection or breakout.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Place Order
              </h3>
              <form className="space-y-4">
                <div>
                  <label
                    htmlFor="orderType"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Order Type
                  </label>
                  <select
                    id="orderType"
                    name="orderType"
                    className="input-field w-full"
                  >
                    <option value="market">Market Order</option>
                    <option value="limit">Limit Order</option>
                    <option value="stop">Stop Order</option>
                    <option value="stop-limit">Stop-Limit Order</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="Enter quantity"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    placeholder="Enter price"
                    className="input-field w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="submit"
                    className="btn-primary w-full bg-green-600 hover:bg-green-700"
                  >
                    Buy
                  </button>
                  <button
                    type="submit"
                    className="btn-primary w-full bg-red-600 hover:bg-red-700"
                  >
                    Sell
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Watchlist
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-text">AAPL</div>
                    <div className="text-xs text-text/60">Apple Inc.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text">$182.63</div>
                    <div className="text-xs text-green-600">+2.34%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-text">MSFT</div>
                    <div className="text-xs text-text/60">Microsoft Corp.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text">$425.18</div>
                    <div className="text-xs text-red-600">-0.85%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border">
                  <div>
                    <div className="font-medium text-text">GOOGL</div>
                    <div className="text-xs text-text/60">Alphabet Inc.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text">$141.75</div>
                    <div className="text-xs text-green-600">+1.24%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center py-2">
                  <div>
                    <div className="font-medium text-text">TSLA</div>
                    <div className="text-xs text-text/60">Tesla Inc.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-text">$248.95</div>
                    <div className="text-xs text-green-600">+3.42%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Portfolio Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text/60">Total Value</span>
                  <span className="font-medium text-text">$52,847.32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Day P&L</span>
                  <span className="font-medium text-green-600">+$1,245.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Total P&L</span>
                  <span className="font-medium text-green-600">+$8,847.32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Available Cash</span>
                  <span className="font-medium text-text">$12,543.18</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text/60">Buying Power</span>
                  <span className="font-medium text-text">$25,086.36</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
      {/* REMOVED */}
    </div>
  );
};

export default PositionalTrading;
