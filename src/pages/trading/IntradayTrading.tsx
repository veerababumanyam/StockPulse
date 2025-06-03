import React from "react";
// import Navbar from '@components/layout/Navbar'; // REMOVE: MainLayout provides the Navbar
// import Footer from '@components/layout/Footer'; // REMOVE: MainLayout provides the Footer

const IntradayTrading: React.FC = () => {
  return (
    <div className="bg-background">
      {/* <Navbar /> */}
      {/* REMOVED */}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">Intraday Trading</h1>

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

              <div className="h-96 bg-surface/50 border border-border rounded-lg mb-4 flex items-center justify-center">
                <p className="text-text/60">Intraday chart visualization</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary/50">
                  5m
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  15m
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  30m
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  1h
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  4h
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-sm text-text/60">Open</div>
                  <div className="font-semibold text-text">$180.25</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">High</div>
                  <div className="font-semibold text-text">$183.15</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Low</div>
                  <div className="font-semibold text-text">$179.88</div>
                </div>
                <div>
                  <div className="text-sm text-text/60">Volume</div>
                  <div className="font-semibold text-text">48.2M</div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Order Book
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2 text-green-600">
                    Bids
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-text/60 mb-2">
                      <span>Price</span>
                      <span>Size</span>
                      <span>Total</span>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-green-500/10 rounded"
                        style={{ width: "95%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-green-600">182.61</span>
                        <span className="text-text">125</span>
                        <span className="text-text">22,826</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-green-500/10 rounded"
                        style={{ width: "88%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-green-600">182.60</span>
                        <span className="text-text">98</span>
                        <span className="text-text">17,895</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-green-500/10 rounded"
                        style={{ width: "76%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-green-600">182.59</span>
                        <span className="text-text">76</span>
                        <span className="text-text">13,877</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-green-500/10 rounded"
                        style={{ width: "62%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-green-600">182.58</span>
                        <span className="text-text">62</span>
                        <span className="text-text">11,320</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-green-500/10 rounded"
                        style={{ width: "54%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-green-600">182.57</span>
                        <span className="text-text">45</span>
                        <span className="text-text">8,216</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2 text-red-600">
                    Asks
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-text/60 mb-2">
                      <span>Price</span>
                      <span>Size</span>
                      <span>Total</span>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-red-500/10 rounded"
                        style={{ width: "89%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-red-600">182.64</span>
                        <span className="text-text">89</span>
                        <span className="text-text">16,255</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-red-500/10 rounded"
                        style={{ width: "72%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-red-600">182.65</span>
                        <span className="text-text">72</span>
                        <span className="text-text">13,151</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-red-500/10 rounded"
                        style={{ width: "58%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-red-600">182.66</span>
                        <span className="text-text">58</span>
                        <span className="text-text">10,594</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-red-500/10 rounded"
                        style={{ width: "43%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-red-600">182.67</span>
                        <span className="text-text">43</span>
                        <span className="text-text">7,855</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div
                        className="absolute inset-0 bg-red-500/10 rounded"
                        style={{ width: "34%" }}
                      ></div>
                      <div className="relative flex justify-between text-xs py-1 px-2">
                        <span className="text-red-600">182.68</span>
                        <span className="text-text">34</span>
                        <span className="text-text">6,211</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Technical Indicators
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-text/60">RSI (14)</div>
                    <div className="font-semibold text-text">56.8</div>
                    <div className="text-xs text-text/60">Neutral</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-text/60">MACD</div>
                    <div className="font-semibold text-green-600">Bullish</div>
                    <div className="text-xs text-text/60">Crossover</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-text/60">Stochastic</div>
                    <div className="font-semibold text-red-600">82.4</div>
                    <div className="text-xs text-text/60">Overbought</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-text/60">Bollinger Bands</div>
                    <div className="font-semibold text-yellow-600">
                      Near Upper
                    </div>
                    <div className="text-xs text-text/60">Resistance</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Quick Order
              </h3>
              <form className="space-y-4">
                <div>
                  <label htmlFor="orderType" className="form-label">
                    Order Type
                  </label>
                  <select
                    id="orderType"
                    name="orderType"
                    className="input-field w-full"
                  >
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop</option>
                    <option>Stop Limit</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    placeholder="0"
                    className="input-field w-full"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="form-label">
                    Price (if limit/stop)
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    placeholder="0.00"
                    step="0.01"
                    className="input-field w-full"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Buy
                  </button>
                  <button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Sell
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">Hotkeys</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text/70">Buy Market</span>
                  <span className="font-mono bg-surface/80 border border-border px-2 py-0.5 rounded text-text">
                    Shift+B
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Sell Market</span>
                  <span className="font-mono bg-surface/80 border border-border px-2 py-0.5 rounded text-text">
                    Shift+S
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Cancel All</span>
                  <span className="font-mono bg-surface/80 border border-border px-2 py-0.5 rounded text-text">
                    Esc
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Increase Qty</span>
                  <span className="font-mono bg-surface/80 border border-border px-2 py-0.5 rounded text-text">
                    Ctrl+Up
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/70">Decrease Qty</span>
                  <span className="font-mono bg-surface/80 border border-border px-2 py-0.5 rounded text-text">
                    Ctrl+Down
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Open Positions
              </h3>
              <div className="space-y-3">
                <div className="p-3 border border-border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-text">AAPL +100</span>
                    <span className="text-green-600 font-medium">+$234.50</span>
                  </div>
                  <div className="text-sm text-text/60">
                    Avg: $180.15 | Current: $182.63
                  </div>
                </div>
                <div className="p-3 border border-border rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-text">MSFT -50</span>
                    <span className="text-red-600 font-medium">-$67.25</span>
                  </div>
                  <div className="text-sm text-text/60">
                    Avg: $337.89 | Current: $336.54
                  </div>
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

export default IntradayTrading;
