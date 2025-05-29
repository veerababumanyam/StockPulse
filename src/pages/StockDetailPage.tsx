import React from "react";
import { useParams } from "react-router-dom";

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text">{symbol || "AAPL"}</h1>
          <p className="text-text/60">Apple Inc.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="text-3xl font-bold text-text">$182.63</div>
          <div className="flex items-center text-green-600 dark:text-green-400">
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
            <span className="font-medium">+$4.28 (2.34%)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">
              Price Chart
            </h2>
            <div className="h-80 bg-surface/50 border border-border rounded flex items-center justify-center">
              <p className="text-text/60">Stock price chart visualization</p>
            </div>
            <div className="flex mt-4 space-x-2">
              <button className="px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
                1D
              </button>
              <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary-500">
                1W
              </button>
              <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary-500">
                1M
              </button>
              <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary-500">
                3M
              </button>
              <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary-500">
                1Y
              </button>
              <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary-500">
                5Y
              </button>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">
              Key Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-text/60">Market Cap</h3>
                <div className="text-lg font-medium text-text">$2.85T</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">P/E Ratio</h3>
                <div className="text-lg font-medium text-text">30.42</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  Dividend Yield
                </h3>
                <div className="text-lg font-medium text-text">0.54%</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  52-Week High
                </h3>
                <div className="text-lg font-medium text-text">$198.23</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  52-Week Low
                </h3>
                <div className="text-lg font-medium text-text">$142.18</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  Avg. Volume
                </h3>
                <div className="text-lg font-medium text-text">58.32M</div>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">About</h2>
            <p className="text-text/70 mb-4">
              Apple Inc. designs, manufactures, and markets smartphones,
              personal computers, tablets, wearables, and accessories worldwide.
              It also sells various related services. The company offers iPhone,
              a line of smartphones; Mac, a line of personal computers; iPad, a
              line of multi-purpose tablets; and wearables, home, and
              accessories comprising AirPods, Apple TV, Apple Watch, Beats
              products, and HomePod.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-text/60">CEO</h3>
                <div className="text-base text-text">Tim Cook</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  Headquarters
                </h3>
                <div className="text-base text-text">Cupertino, California</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">Founded</h3>
                <div className="text-base text-text">April 1, 1976</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text/60">Employees</h3>
                <div className="text-base text-text">154,000</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">Trading</h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="orderType"
                  className="block text-sm font-medium text-text mb-1"
                >
                  Order Type
                </label>
                <select
                  id="orderType"
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
                >
                  <option>Market</option>
                  <option>Limit</option>
                  <option>Stop</option>
                  <option>Stop Limit</option>
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
                  defaultValue={10}
                  min={1}
                  className="block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-background text-text sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  Buy
                </button>
                <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                  Sell
                </button>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text">
              AI Analysis
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-text/60">
                  Technical Outlook
                </h3>
                <div className="flex items-center mt-1">
                  <div className="w-2/3 bg-border rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "70%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">
                    Bullish
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text/60">
                  Sentiment Analysis
                </h3>
                <div className="flex items-center mt-1">
                  <div className="w-2/3 bg-border rounded-full h-2.5">
                    <div
                      className="bg-green-600 h-2.5 rounded-full"
                      style={{ width: "65%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-green-600">
                    Positive
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text/60">Volatility</h3>
                <div className="flex items-center mt-1">
                  <div className="w-2/3 bg-border rounded-full h-2.5">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{ width: "45%" }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    Moderate
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-text">
                  AI Recommendation
                </h3>
                <p className="text-sm text-text/60 mt-1">
                  Based on technical patterns and market sentiment, our AI
                  suggests a{" "}
                  <span className="font-medium text-green-600">Buy</span> with a
                  price target of $195.50 (7% upside potential).
                </p>
              </div>
            </div>
          </div>

          <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 text-text">News</h2>
            <div className="space-y-4">
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-text">
                  Apple Announces New MacBook Pro with M3 Chip
                </h3>
                <p className="text-sm text-text/60 mt-1">2 hours ago</p>
              </div>
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-text">
                  Q2 Earnings Beat Expectations, Services Revenue Hits Record
                  High
                </h3>
                <p className="text-sm text-text/60 mt-1">1 day ago</p>
              </div>
              <div>
                <h3 className="text-base font-medium text-text">
                  Apple's AI Strategy: What to Expect at WWDC
                </h3>
                <p className="text-sm text-text/60 mt-1">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
