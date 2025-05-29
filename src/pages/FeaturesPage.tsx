import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Activity,
  BarChart3,
  ArrowRight,
  CheckCircle,
  PieChart,
  Globe,
  Smartphone,
  Lock,
} from "lucide-react";

const FeaturesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Modern Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="StockPulse" className="w-8 h-8" />
              <span className="text-xl font-bold text-text">StockPulse</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-primary-600 font-medium">
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-text/70 hover:text-text transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/about"
                className="text-text/70 hover:text-text transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-text/70 hover:text-text transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link
                to="/auth/login"
                className="text-text/70 hover:text-text transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Features Content */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-surface/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl sm:text-5xl font-bold text-text mb-6">
                Powerful Features for
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {" "}
                  Smart Trading
                </span>
              </h1>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                Discover comprehensive tools and AI-powered insights designed to
                give you the edge in today's financial markets.
              </p>
            </motion.div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Activity,
                  title: "Real-Time Market Data",
                  description:
                    "Access live market data, price movements, and volume analysis with millisecond precision. Stay ahead with real-time updates.",
                  color: "from-blue-500 to-blue-600",
                  features: [
                    "Live price feeds",
                    "Volume analysis",
                    "Market depth",
                    "News integration",
                  ],
                },
                {
                  icon: Brain,
                  title: "AI Trading Signals",
                  description:
                    "Advanced machine learning algorithms analyze patterns and generate actionable trading signals with high accuracy.",
                  color: "from-purple-500 to-purple-600",
                  features: [
                    "Pattern recognition",
                    "Sentiment analysis",
                    "Predictive modeling",
                    "Risk assessment",
                  ],
                },
                {
                  icon: PieChart,
                  title: "Portfolio Analytics",
                  description:
                    "Comprehensive portfolio tracking with performance metrics, risk analysis, and asset allocation insights.",
                  color: "from-green-500 to-green-600",
                  features: [
                    "Performance tracking",
                    "Risk metrics",
                    "Asset allocation",
                    "Rebalancing alerts",
                  ],
                },
                {
                  icon: Target,
                  title: "Smart Screeners",
                  description:
                    "Find the best opportunities with customizable stock screeners and advanced filtering capabilities.",
                  color: "from-orange-500 to-orange-600",
                  features: [
                    "Custom filters",
                    "Technical indicators",
                    "Fundamental data",
                    "Saved searches",
                  ],
                },
                {
                  icon: Shield,
                  title: "Risk Management",
                  description:
                    "Built-in risk management tools to protect your capital and optimize returns with smart position sizing.",
                  color: "from-red-500 to-red-600",
                  features: [
                    "Stop loss automation",
                    "Position sizing",
                    "Risk limits",
                    "Drawdown protection",
                  ],
                },
                {
                  icon: Zap,
                  title: "Lightning Fast",
                  description:
                    "Optimized for speed with instant order execution, real-time updates, and minimal latency.",
                  color: "from-yellow-500 to-yellow-600",
                  features: [
                    "Sub-second execution",
                    "Real-time updates",
                    "Low latency feeds",
                    "Optimized algorithms",
                  ],
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-background rounded-xl p-8 shadow-lg border border-border hover:border-primary-300 transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-text mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-text/70 mb-6">{feature.description}</p>
                  <ul className="space-y-2">
                    {feature.features.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-text/60"
                      >
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                Built with Cutting-Edge Technology
              </h2>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                Our platform leverages the latest in AI, machine learning, and
                cloud infrastructure to deliver unmatched performance.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Globe,
                  title: "Global Infrastructure",
                  description:
                    "Distributed servers worldwide ensure low latency and high availability for all users.",
                },
                {
                  icon: Smartphone,
                  title: "Cross-Platform",
                  description:
                    "Access your trading platform from any device - web, mobile, or desktop applications.",
                },
                {
                  icon: Lock,
                  title: "Enterprise Security",
                  description:
                    "Bank-grade security with end-to-end encryption and multi-factor authentication.",
                },
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <tech.icon className="w-10 h-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-text mb-4">
                    {tech.title}
                  </h3>
                  <p className="text-text/70">{tech.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center text-white"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Experience These Features?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of successful traders using StockPulse to
                maximize their returns
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth/register"
                  className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                >
                  Start Your Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  to="/pricing"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
                >
                  View Pricing
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-text">StockPulse</span>
              </div>
              <p className="text-text/70 mb-4">
                AGI-powered trading platform for modern investors.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-text/40 hover:text-primary-600 cursor-pointer" />
                <Smartphone className="w-5 h-5 text-text/40 hover:text-primary-600 cursor-pointer" />
                <Lock className="w-5 h-5 text-text/40 hover:text-primary-600 cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-text mb-4">Product</h3>
              <ul className="space-y-2 text-text/70">
                <li>
                  <Link to="/features" className="hover:text-text">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="hover:text-text">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    API
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Mobile App
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-text mb-4">Company</h3>
              <ul className="space-y-2 text-text/70">
                <li>
                  <Link to="/about" className="hover:text-text">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-text">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-text mb-4">Support</h3>
              <ul className="space-y-2 text-text/70">
                <li>
                  <Link to="#" className="hover:text-text">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Security
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-text">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-text/60">
            <p>&copy; 2025 StockPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
