import React from 'react';
// import Navbar from '@components/layout/Navbar'; // REMOVE: MainLayout provides the Navbar
// import Footer from '@components/layout/Footer'; // REMOVE: MainLayout provides the Footer

const OptionsTrading: React.FC = () => {
  return (
    <div className="bg-background">
      {/* <Navbar /> */}
      {/* REMOVED */}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-text">Options Trading</h1>

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

              <div className="h-80 bg-surface/80 border border-border rounded-lg mb-4 flex items-center justify-center">
                <p className="text-text/60">Options chain visualization</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <button className="px-3 py-1 text-sm bg-primary text-white rounded focus:outline-none focus:ring-2 focus:ring-primary/50">
                  Jun 21, 2025
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  Jul 19, 2025
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  Aug 16, 2025
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  Sep 20, 2025
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  Dec 19, 2025
                </button>
                <button className="px-3 py-1 text-sm bg-surface border border-border text-text rounded hover:bg-surface/80 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200">
                  Jan 16, 2026
                </button>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="text-lg font-semibold text-text">
                  Options Chain - June 21, 2025
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-surface/80 border-b border-border">
                    <tr>
                      <th
                        colSpan={5}
                        className="px-4 py-3 text-center text-xs font-medium text-text/70 uppercase tracking-wider border-r border-border"
                      >
                        Calls
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-text/70 uppercase tracking-wider">
                        Strike
                      </th>
                      <th
                        colSpan={5}
                        className="px-4 py-3 text-center text-xs font-medium text-text/70 uppercase tracking-wider border-l border-border"
                      >
                        Puts
                      </th>
                    </tr>
                    <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Last
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Change
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Bid
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Ask
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-r border-border"
                      >
                        Volume
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-center text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Price
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider border-l border-border"
                      >
                        Last
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Change
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Bid
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Ask
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-text/70 uppercase tracking-wider"
                      >
                        Volume
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-surface divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        12.45
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                        +0.85
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        12.35
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        12.55
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-r border-border">
                        345
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center text-text">
                        $170.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-l border-border">
                        1.25
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -0.15
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        1.20
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        1.30
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        128
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        9.80
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                        +0.65
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        9.70
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        9.90
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-r border-border">
                        512
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center text-text">
                        $175.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-l border-border">
                        2.10
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -0.20
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        2.05
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        2.15
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        245
                      </td>
                    </tr>
                    <tr className="bg-primary/10 border-primary/20">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        7.25
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                        +0.45
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        7.15
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        7.35
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-r border-border">
                        876
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center text-text">
                        $180.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-l border-border">
                        3.45
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -0.30
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        3.40
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        3.50
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        567
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        4.85
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                        +0.35
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        4.75
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        4.95
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-r border-border">
                        1245
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center text-text">
                        $185.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-l border-border">
                        5.20
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -0.40
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        5.15
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        5.25
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        890
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        2.95
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                        +0.25
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        2.90
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        3.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-r border-border">
                        1567
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center text-text">
                        $190.00
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text border-l border-border">
                        7.65
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                        -0.55
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        7.60
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        7.70
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-text">
                        765
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Options Strategy Builder
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Strategy Type
                  </label>
                  <select className="input-field w-full">
                    <option>Long Call</option>
                    <option>Long Put</option>
                    <option>Covered Call</option>
                    <option>Cash-Secured Put</option>
                    <option>Bull Call Spread</option>
                    <option>Bear Put Spread</option>
                    <option>Iron Condor</option>
                    <option>Butterfly</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Expiration Date
                    </label>
                    <select className="input-field w-full">
                      <option>Jun 21, 2025</option>
                      <option>Jul 19, 2025</option>
                      <option>Aug 16, 2025</option>
                      <option>Sep 20, 2025</option>
                      <option>Dec 19, 2025</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Strike Price
                    </label>
                    <select className="input-field w-full">
                      <option>$170.00</option>
                      <option>$175.00</option>
                      <option>$180.00</option>
                      <option>$185.00</option>
                      <option>$190.00</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      className="input-field w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text mb-1">
                      Order Type
                    </label>
                    <select className="input-field w-full">
                      <option>Market</option>
                      <option>Limit</option>
                      <option>Stop</option>
                      <option>Stop Limit</option>
                    </select>
                  </div>
                </div>

                <div className="bg-surface/50 border border-border rounded-lg p-4">
                  <h4 className="font-medium text-text mb-2">
                    Strategy Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-text/60">Max Profit</div>
                      <div className="font-medium text-green-600">$2,345</div>
                    </div>
                    <div>
                      <div className="text-text/60">Max Loss</div>
                      <div className="font-medium text-red-600">$725</div>
                    </div>
                    <div>
                      <div className="text-text/60">Breakeven</div>
                      <div className="font-medium text-text">$182.25</div>
                    </div>
                  </div>
                </div>

                <button className="btn-primary w-full">Execute Strategy</button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">Greeks</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text/60">Delta</span>
                  <span className="font-medium text-text">0.65</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Gamma</span>
                  <span className="font-medium text-text">0.018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Theta</span>
                  <span className="font-medium text-red-600">-0.25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Vega</span>
                  <span className="font-medium text-text">0.85</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Rho</span>
                  <span className="font-medium text-text">0.42</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text/60">IV</span>
                  <span className="font-medium text-text">28.5%</span>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Open Positions
              </h3>
              <div className="space-y-3">
                <div className="border-b border-border pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-text">AAPL Call</div>
                      <div className="text-sm text-text/60">$180 Jun 21</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">+$245</div>
                      <div className="text-sm text-text/60">+15.2%</div>
                    </div>
                  </div>
                  <div className="text-xs text-text/60">Qty: 2 contracts</div>
                </div>

                <div className="border-b border-border pb-3">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-text">MSFT Put</div>
                      <div className="text-sm text-text/60">$420 Jul 19</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">-$85</div>
                      <div className="text-sm text-text/60">-8.5%</div>
                    </div>
                  </div>
                  <div className="text-xs text-text/60">Qty: 1 contract</div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-medium text-text">GOOGL Call</div>
                      <div className="text-sm text-text/60">$145 Aug 16</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">+$125</div>
                      <div className="text-sm text-text/60">+12.5%</div>
                    </div>
                  </div>
                  <div className="text-xs text-text/60">Qty: 3 contracts</div>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-border shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 text-text">
                Portfolio Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text/60">Total Options Value</span>
                  <span className="font-medium text-text">$8,245.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Day P&L</span>
                  <span className="font-medium text-green-600">+$285.32</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Total P&L</span>
                  <span className="font-medium text-green-600">+$1,245.67</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text/60">Buying Power</span>
                  <span className="font-medium text-text">$15,754.33</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2">
                  <span className="text-text/60">Beta Weighted Delta</span>
                  <span className="font-medium text-text">+2.45</span>
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

export default OptionsTrading;
