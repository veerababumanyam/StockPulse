import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Users,
  CheckCircle,
  Star,
  Play,
  ChevronDown,
  Activity,
  PieChart,
  Target,
  Globe,
  Smartphone,
  Lock,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  // SEO Meta Tags Effect
  useEffect(() => {
    document.title =
      "StockPulse - AGI-Powered Stock Analysis & Trading Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Transform your trading with StockPulse's AGI-powered stock analysis platform. Real-time data, smart analytics, and professional trading tools for modern investors.",
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content =
        "Transform your trading with StockPulse's AGI-powered stock analysis platform. Real-time data, smart analytics, and professional trading tools for modern investors.";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "StockPulse",
      description: "AGI-powered stock analysis and trading platform",
      url: "https://stockpulse.com",
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.getElementsByTagName("head")[0].appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[type="application/ld+json"]',
      );
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

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
              <Link
                to="/features"
                className="text-text/70 hover:text-text transition-colors"
              >
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
            <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span
                  className={`block w-6 h-0.5 bg-text transition-transform ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-text transition-opacity ${isMenuOpen ? "opacity-0" : ""}`}
                ></span>
                <span
                  className={`block w-6 h-0.5 bg-text transition-transform ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background border-t border-border"
          >
            <div className="px-4 py-6 space-y-4">
              <Link
                to="/features"
                className="block text-text/70 hover:text-text"
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="block text-text/70 hover:text-text"
              >
                Pricing
              </Link>
              <Link to="/about" className="block text-text/70 hover:text-text">
                About
              </Link>
              <Link
                to="/contact"
                className="block text-text/70 hover:text-text"
              >
                Contact
              </Link>
              <hr className="border-border" />
              <Link
                to="/auth/login"
                className="block text-text/70 hover:text-text"
              >
                Sign In
              </Link>
              <Link
                to="/auth/register"
                className="block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-center"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section with Advanced Graphics */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-primary-50/10 to-secondary-50/10"></div>
          <motion.div
            style={{ y: y1 }}
            className="absolute top-0 left-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl"
          ></motion.div>
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl"
          ></motion.div>

          {/* Floating Elements */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-6"
              >
                <Zap className="w-4 h-4 mr-2" />
                AGI-Powered Trading Intelligence
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
                Transform Your Trading with{" "}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Smart Analytics
                </span>
              </h1>

              <p className="text-lg text-text/70 mb-8 max-w-2xl mx-auto lg:mx-0">
                Leverage cutting-edge AGI technology to analyze markets,
                identify opportunities, and make data-driven investment
                decisions with confidence.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/auth/register"
                  className="group bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group bg-surface hover:bg-surface/80 text-text px-8 py-4 rounded-lg font-semibold transition-all duration-300 border border-border hover:border-primary-300 flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-text/60">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Free 14-day trial
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  No credit card required
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  Cancel anytime
                </div>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* MAGIn Dashboard Mockup */}
              <div className="relative bg-surface rounded-2xl border border-border shadow-2xl overflow-hidden">
                {/* Browser Bar */}
                <div className="flex items-center px-4 py-3 bg-background border-b border-border">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-surface rounded-md px-3 py-1 text-xs text-text/60">
                      stockpulse.com/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-4">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      {
                        label: "Portfolio",
                        value: "$124.5K",
                        change: "+12.5%",
                        color: "text-green-500",
                      },
                      {
                        label: "Today P&L",
                        value: "+$2.4K",
                        change: "+1.9%",
                        color: "text-green-500",
                      },
                      {
                        label: "Win Rate",
                        value: "87.3%",
                        change: "+5.2%",
                        color: "text-blue-500",
                      },
                    ].map((stat, i) => (
                      <div key={i} className="bg-background rounded-lg p-3">
                        <div className="text-xs text-text/60">{stat.label}</div>
                        <div className="font-bold text-text">{stat.value}</div>
                        <div className={`text-xs ${stat.color}`}>
                          {stat.change}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chart Area */}
                  <div className="bg-background rounded-lg p-4 h-32 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-4">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="bg-primary-500 rounded-t"
                          style={{ width: "8px" }}
                          initial={{ height: "20%" }}
                          animate={{ height: `${20 + Math.random() * 60}%` }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Holdings */}
                  <div className="space-y-2">
                    {["AAPL", "MSFT", "GOOGL"].map((symbol, i) => (
                      <div
                        key={symbol}
                        className="flex items-center justify-between bg-background rounded-lg p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-8 h-8 rounded-full bg-primary-${(i + 1) * 200} flex items-center justify-center text-white text-xs font-bold`}
                          >
                            {symbol[0]}
                          </div>
                          <div>
                            <div className="font-medium text-text">
                              {symbol}
                            </div>
                            <div className="text-xs text-text/60">
                              {
                                [
                                  "Apple Inc.",
                                  "Microsoft Corp.",
                                  "Alphabet Inc.",
                                ][i]
                              }
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-text">
                            ${[182.63, 415.32, 175.98][i]}
                          </div>
                          <div className="text-xs text-green-500">
                            +{[2.34, 1.12, 0.87][i]}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-4 -right-4 bg-primary-500 text-white p-3 rounded-xl shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-6 h-6" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-secondary-500 text-white p-3 rounded-xl shadow-lg"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                <Brain className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-text/40" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              Everything You Need to Trade Smarter
            </h2>
            <p className="text-lg text-text/70 max-w-3xl mx-auto">
              Comprehensive tools and AGI-powered insights designed for modern
              traders and investors
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Activity,
                title: "Real-Time Market Data",
                description:
                  "Access live market data, price movements, and volume analysis with millisecond precision.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: Brain,
                title: "AGI Trading Signals",
                description:
                  "Advanced machine learning algorithms analyze patterns and generate actionable trading signals.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: PieChart,
                title: "Portfolio Analytics",
                description:
                  "Comprehensive portfolio tracking with performance metrics and risk analysis.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Target,
                title: "Smart Screeners",
                description:
                  "Find the best opportunities with customizable stock screeners and filters.",
                color: "from-orange-500 to-orange-600",
              },
              {
                icon: Shield,
                title: "Risk Management",
                description:
                  "Built-in risk management tools to protect your capital and optimize returns.",
                color: "from-red-500 to-red-600",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                description:
                  "Optimized for speed with instant order execution and real-time updates.",
                color: "from-yellow-500 to-yellow-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group bg-background rounded-xl p-6 shadow-lg border border-border hover:border-primary-300 transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-text/70">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-text mb-12">
              Trusted by Traders Worldwide
            </h2>

            <div className="grid md:grid-cols-4 gap-8 mb-12">
              {[
                { number: "50K+", label: "Active Traders" },
                { number: "$2.5B+", label: "Assets Managed" },
                { number: "99.9%", label: "Uptime" },
                { number: "4.9/5", label: "User Rating" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-text/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sarah Chen",
                  role: "Day Trader",
                  content:
                    "StockPulse's AGI signals have improved my win rate by 35%. The platform is incredibly intuitive.",
                  rating: 5,
                },
                {
                  name: "Michael Rodriguez",
                  role: "Portfolio Manager",
                  content:
                    "The real-time analytics and risk management tools are game-changers for institutional trading.",
                  rating: 5,
                },
                {
                  name: "Emily Johnson",
                  role: "RetAGIl Investor",
                  content:
                    "Finally, a platform that makes professional-grade tools accessible to individual investors.",
                  rating: 5,
                },
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="bg-surface rounded-xl p-6 border border-border"
                >
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-text/70 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-text">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-text/60">
                      {testimonial.role}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/10"></div>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-64 h-64 bg-white/5 rounded-full blur-3xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, 100, 0],
                y: [0, -100, 0],
              }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center text-white"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of successful traders using StockPulse to maximize
              their returns
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start Your Free Trial
              </Link>
              <Link
                to="/auth/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-lg font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

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

export default LandingPage;
