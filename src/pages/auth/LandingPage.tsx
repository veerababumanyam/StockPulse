import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  TrendingUp,
  Shield,
  Zap,
  Play,
  ChevronDown,
  PieChart,
  Smartphone,
  Menu,
  X,
  Sparkles,
  Users,
  Award,
  Activity,
  Star,
  BarChart3,
  LineChart,
  DollarSign,
  Target,
  Briefcase
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const navigate = useNavigate();

  // Advanced scroll transforms
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Mouse tracking for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    setIsLoaded(true);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Navigation handlers
  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleGetStarted = () => {
    navigate('/auth/register');
  };

  const handleWatchDemo = () => {
    // For now, scroll to features section or show a demo modal
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (section: string) => {
    setIsMenuOpen(false);
    
    // Handle different navigation cases
    switch (section.toLowerCase()) {
      case 'features':
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
          featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
        break;
      case 'pricing':
        navigate('/pricing');
        break;
      case 'about':
        navigate('/about');
        break;
      case 'contact':
        navigate('/contact');
        break;
      default:
        // For sections that exist on the page, scroll to them
        const element = document.getElementById(section.toLowerCase());
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
    }
  };

  // Stock chart animation data
  const stockData = [
    { time: '9:30', price: 150, volume: 1200 },
    { time: '10:00', price: 155, volume: 1800 },
    { time: '10:30', price: 148, volume: 2100 },
    { time: '11:00', price: 162, volume: 1600 },
    { time: '11:30', price: 158, volume: 1900 },
    { time: '12:00', price: 165, volume: 2400 },
    { time: '12:30', price: 172, volume: 2800 },
    { time: '13:00', price: 168, volume: 2200 },
    { time: '13:30', price: 175, volume: 3100 },
    { time: '14:00', price: 180, volume: 2600 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' }
    }
  };

  // Stock Chart Component
  const StockChart = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 1.5 }}
      className="absolute right-10 top-20 w-80 h-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hidden lg:block"
      style={{ 
        x: mousePosition.x * -0.2,
        y: mousePosition.y * -0.2 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold">AAPL</h3>
          <p className="text-green-400 text-sm">+$12.50 (+7.2%)</p>
        </div>
        <div className="text-right">
          <p className="text-white text-lg font-bold">$185.50</p>
          <p className="text-white/60 text-xs">Real-time</p>
        </div>
      </div>
      
      <div className="relative h-24">
        <svg className="w-full h-full" viewBox="0 0 320 96">
          <defs>
            <linearGradient id="stockGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
            </linearGradient>
          </defs>
          
          {/* Chart line */}
          <motion.path
            d="M 0 80 Q 32 70 64 75 T 128 60 T 192 45 T 256 35 T 320 25"
            stroke="#06b6d4"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2 }}
          />
          
          {/* Chart area */}
          <motion.path
            d="M 0 80 Q 32 70 64 75 T 128 60 T 192 45 T 256 35 T 320 25 L 320 96 L 0 96 Z"
            fill="url(#stockGradient)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 2.2 }}
          />
        </svg>
        
        {/* Animated price points */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: `${20 + i * 20}%`,
              top: `${60 - i * 8}%`
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.5 + i * 0.1 }}
          />
        ))}
      </div>
    </motion.div>
  );

  // Portfolio Widget Component
  const PortfolioWidget = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 2 }}
      className="absolute left-10 bottom-32 w-72 h-40 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hidden lg:block"
      style={{ 
        x: mousePosition.x * 0.3,
        y: mousePosition.y * 0.3 
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold flex items-center">
          <Briefcase className="w-4 h-4 mr-2" />
          Portfolio
        </h3>
        <span className="text-green-400 text-sm">+2.4%</span>
      </div>
      
      <div className="space-y-2">
        {[
          { symbol: 'AAPL', value: '$45,230', change: '+5.2%', color: 'bg-green-500' },
          { symbol: 'GOOGL', value: '$32,100', change: '+2.1%', color: 'bg-blue-500' },
          { symbol: 'TSLA', value: '$28,950', change: '-1.3%', color: 'bg-red-500' }
        ].map((stock, i) => (
          <motion.div
            key={stock.symbol}
            className="flex items-center justify-between"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.5 + i * 0.1 }}
          >
            <div className="flex items-center">
              <div className={`w-2 h-2 ${stock.color} rounded-full mr-2`} />
              <span className="text-white/80 text-sm">{stock.symbol}</span>
            </div>
            <div className="text-right">
              <p className="text-white text-sm">{stock.value}</p>
              <p className={`text-xs ${stock.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {stock.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  // Market Stats Component
  const MarketStats = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 1.8 }}
      className="absolute right-10 bottom-20 w-64 h-32 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hidden lg:block"
      style={{ 
        x: mousePosition.x * -0.1,
        y: mousePosition.y * -0.1 
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <BarChart3 className="w-4 h-4 mr-2" />
          Market
        </h3>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-white/60 text-xs">S&P 500</p>
          <p className="text-white font-semibold">4,185.47</p>
          <p className="text-green-400 text-xs">+0.8%</p>
        </div>
        <div>
          <p className="text-white/60 text-xs">NASDAQ</p>
          <p className="text-white font-semibold">12,965.34</p>
          <p className="text-green-400 text-xs">+1.2%</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden">
      {/* Glassmorphic Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo with animation */}
            <motion.div 
              className="flex items-center space-x-3 group cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-30"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                StockPulse
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Pricing', 'About', 'Contact'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => handleNavigation(item)}
                  className="relative text-white/70 hover:text-white transition-all duration-300 font-medium cursor-pointer"
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {item}
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400"
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <motion.button
                onClick={handleSignIn}
                className="text-white/70 hover:text-white transition-colors font-medium px-4 py-2 rounded-lg hover:bg-white/5"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sign In
              </motion.button>
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300"
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(6, 182, 212, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X size={28} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu size={28} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden backdrop-blur-xl bg-black/20 border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {['Features', 'Pricing', 'About', 'Contact'].map((item, index) => (
                  <motion.button
                    key={item}
                    onClick={() => handleNavigation(item)}
                    className="block py-3 text-lg text-white/70 hover:text-white transition-colors w-full text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {item}
                  </motion.button>
                ))}
                <hr className="border-white/10 my-4" />
                <motion.button
                  onClick={handleSignIn}
                  className="block w-full py-3 text-lg text-white/70 hover:text-white transition-colors text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Sign In
                </motion.button>
                <motion.button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold py-3 rounded-xl mt-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section with Advanced Animations */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
            style={{ 
              x: mousePosition.x * 0.5,
              y: mousePosition.y * 0.5 
            }}
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
            style={{ 
              x: mousePosition.x * -0.3,
              y: mousePosition.y * -0.3 
            }}
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 rounded-full blur-2xl"
            style={{ 
              x: mousePosition.x * 0.2,
              y: mousePosition.y * 0.2 
            }}
            variants={floatingVariants}
            animate="animate"
            transition={{ delay: 2 }}
          />
          
          {/* Animated grid */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent bg-[size:50px_50px] opacity-20" 
               style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)' }} />
        </div>

        {/* Stock Graphics Components */}
        <StockChart />
        <PortfolioWidget />
        <MarketStats />

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
          style={{ scale, opacity }}
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/20 rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-300 font-medium">AI-Powered Trading Platform</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold mb-6 leading-tight"
          >
            The Future of{' '}
            <motion.span
              className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                backgroundSize: '200% 200%'
              }}
            >
              Smart Trading
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl text-white/70 mb-12 max-w-4xl mx-auto leading-relaxed"
          >
            Experience next-generation stock analysis powered by advanced AI. Make informed decisions with 
            real-time insights, elegant analytics, and intuitive tools designed for modern investors.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              onClick={handleGetStarted}
              className="group relative bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 25px 50px rgba(6, 182, 212, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                Start Trading Now
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.button>
            
            <motion.button
              onClick={handleWatchDemo}
              className="group flex items-center gap-2 text-white border-2 border-white/20 hover:border-white/40 backdrop-blur-sm px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/5"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mr-2 group-hover:bg-white/20 transition-colors">
                <Play className="w-5 h-5 ml-1" />
              </div>
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center items-center gap-8 text-white/50"
          >
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-semibold">50K+ Traders</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">4.8 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold">Bank-Level Security</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center text-white/40"
          >
            <span className="text-sm mb-2 font-medium">Scroll to explore</span>
            <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="w-1 h-3 bg-white/40 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section with Modern Cards */}
      <section id="features" className="py-20 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Built for{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Smart Investors
              </span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Discover the cutting-edge tools that will transform your trading experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AGI-Powered Analysis',
                description: 'Advanced AI analyzes market patterns and provides intelligent insights for superior decision-making.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: TrendingUp,
                title: 'Real-Time Data',
                description: 'Access live market data, dynamic charts, and instant notifications to stay ahead.',
                gradient: 'from-cyan-500 to-blue-500'
              },
              {
                icon: Shield,
                title: 'Bank-Level Security',
                description: 'Military-grade encryption with secure data storage to protect your investments.',
                gradient: 'from-emerald-500 to-teal-500'
              },
              {
                icon: Smartphone,
                title: 'Mobile-First Design',
                description: 'Optimized for all devices with touch-friendly interfaces and responsive design.',
                gradient: 'from-orange-500 to-red-500'
              },
              {
                icon: PieChart,
                title: 'Advanced Analytics',
                description: 'Comprehensive portfolio tracking with AI-powered insights and predictive analysis.',
                gradient: 'from-indigo-500 to-purple-500'
              },
              {
                icon: Zap,
                title: 'Lightning Speed',
                description: 'Ultra-fast execution with sub-millisecond latency for time-sensitive opportunities.',
                gradient: 'from-yellow-500 to-orange-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                
                <motion.div
                  className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 h-full hover:border-white/20 transition-all duration-500"
                  whileHover={{ 
                    y: -10,
                    transition: { duration: 0.3, ease: 'easeOut' }
                  }}
                >
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-4 group-hover:text-cyan-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">
                    {feature.description}
                  </p>

                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 via-purple-600/20 to-pink-600/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { number: '50K+', label: 'Active Traders', icon: Users, color: 'from-cyan-400 to-blue-400' },
              { number: '$2.5B+', label: 'Trading Volume', icon: TrendingUp, color: 'from-purple-400 to-pink-400' },
              { number: '99.9%', label: 'Uptime', icon: Activity, color: 'from-emerald-400 to-teal-400' },
              { number: '24/7', label: 'Support', icon: Award, color: 'from-orange-400 to-red-400' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <motion.div
                  className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 15 }}
                >
                  <stat.icon className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg text-white/70 group-hover:text-white transition-colors">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform Your{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Trading?
              </span>
            </h2>
            <p className="text-xl text-white/70 mb-12">
              Join thousands of successful traders who trust StockPulse for their investment journey.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg px-12 py-6 rounded-2xl shadow-2xl inline-flex items-center gap-3"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 25px 50px rgba(6, 182, 212, 0.4)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started Free
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                StockPulse
              </span>
            </div>
            <div className="flex space-x-6 text-white/50">
              <button 
                onClick={() => handleNavigation('privacy')} 
                className="hover:text-cyan-400 transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => handleNavigation('terms')} 
                className="hover:text-cyan-400 transition-colors"
              >
                Terms
              </button>
              <button 
                onClick={() => handleNavigation('contact')} 
                className="hover:text-cyan-400 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/30">
            <p>&copy; 2024 StockPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
