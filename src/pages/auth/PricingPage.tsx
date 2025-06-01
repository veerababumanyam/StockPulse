import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  X,
  Star,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Globe,
  Smartphone,
  Lock,
  Menu,
  Sparkles,
  Users,
  Award,
  Activity
} from 'lucide-react';

const PricingPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/auth/login');
  };

  const handleGetStarted = () => {
    navigate('/auth/register');
  };

  const handleNavigation = (section: string) => {
    setIsMenuOpen(false);
    
    switch (section.toLowerCase()) {
      case 'features':
        navigate('/');
        // After navigation, scroll to features
        setTimeout(() => {
          const featuresSection = document.getElementById('features');
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
        break;
      case 'pricing':
        // Already on pricing page
        break;
      case 'about':
        navigate('/about');
        break;
      case 'contact':
        navigate('/auth/contact');
        break;
      default:
        break;
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individual traders getting started',
      features: [
        'Real-time market data',
        'Basic trading signals',
        'Portfolio tracking',
        'Mobile app access',
        'Email support',
        'Up to 10 watchlists',
      ],
      notIncluded: [
        'Advanced AI analytics',
        'Custom indicators',
        'Priority support',
        'API access',
      ],
      popular: false,
      cta: 'Start Free Trial',
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Advanced tools for serious traders',
      features: [
        'Everything in Starter',
        'Advanced AI trading signals',
        'Custom technical indicators',
        'Risk management tools',
        'Advanced portfolio analytics',
        'Priority support',
        'Unlimited watchlists',
        'Export data features',
      ],
      notIncluded: ['White-label solutions', 'Dedicated account manager'],
      popular: true,
      cta: 'Start Free Trial',
    },
    {
      name: 'Enterprise',
      price: '$299',
      period: '/month',
      description: 'Complete solution for institutions',
      features: [
        'Everything in Professional',
        'API access & webhooks',
        'White-label solutions',
        'Custom integrations',
        'Dedicated account manager',
        'Multi-user accounts',
        'Advanced security features',
        'Custom reporting',
        'SLA guarantee',
        '24/7 phone support',
      ],
      notIncluded: [],
      popular: false,
      cta: 'Contact Sales',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        {/* Animated grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent bg-[size:50px_50px] opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle, #06b6d4 1px, transparent 1px)' }} />
      </div>

      {/* Modern Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer">
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
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Pricing', 'About', 'Contact'].map((item, index) => (
                <motion.button
                  key={item}
                  onClick={() => handleNavigation(item)}
                  className={`relative transition-all duration-300 font-medium cursor-pointer ${
                    item === 'Pricing' 
                      ? 'text-cyan-400' 
                      : 'text-white/70 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {item}
                  {item === 'Pricing' && (
                    <motion.div
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
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
                    className={`block py-3 text-lg transition-colors w-full text-left ${
                      item === 'Pricing' 
                        ? 'text-cyan-400' 
                        : 'text-white/70 hover:text-white'
                    }`}
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

      {/* Pricing Content */}
      <div className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
              >
                <BarChart3 className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Simple, Transparent{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Pricing
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
                Choose the perfect plan for your trading needs. All plans include a 14-day free trial with no commitment.
              </p>

              {/* Pricing Toggle */}
              <div className="flex items-center justify-center p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl w-fit mx-auto">
                <button className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg shadow-lg">
                  Monthly
                </button>
                <button className="px-6 py-3 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Annual (Save 20%)
                </button>
              </div>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative backdrop-blur-xl bg-white/5 border rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/25 ${
                    plan.popular
                      ? 'border-cyan-500 scale-105 bg-gradient-to-b from-cyan-500/10 to-purple-500/10'
                      : 'border-white/10 hover:border-cyan-500/30'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center shadow-lg">
                        <Star className="w-4 h-4 mr-2" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-white/70 mb-6">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-white">
                        {plan.price}
                      </span>
                      <span className="text-white/70 ml-2 text-lg">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-white mb-4 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-cyan-400" />
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-white/80"
                        >
                          <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-white/40"
                        >
                          <X className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <motion.button
                    onClick={() => {
                      if (plan.name === 'Enterprise') {
                        navigate('/auth/contact');
                      } else {
                        handleGetStarted();
                      }
                    }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-center transition-all duration-300 flex items-center justify-center group ${
                      plan.popular
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg hover:shadow-cyan-500/50'
                        : 'bg-white/5 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Compare All Features
              </h2>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                See exactly what's included in each plan to make the best choice for your trading needs.
              </p>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5 border-b border-white/10">
                    <tr>
                      <th className="text-left py-6 px-6 font-semibold text-white">
                        Features
                      </th>
                      <th className="text-center py-6 px-6 font-semibold text-white">
                        Starter
                      </th>
                      <th className="text-center py-6 px-6 font-semibold text-white">
                        Professional
                      </th>
                      <th className="text-center py-6 px-6 font-semibold text-white">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {[
                      ['Real-time market data', true, true, true],
                      ['Trading signals', 'Basic', 'Advanced AI', 'Advanced AI'],
                      ['Portfolio tracking', true, true, true],
                      ['Custom indicators', false, true, true],
                      ['Risk management', false, true, true],
                      ['API access', false, false, true],
                      ['Priority support', false, true, true],
                      ['Dedicated account manager', false, false, true],
                      ['White-label solutions', false, false, true],
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6 text-white">{row[0]}</td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[1] === 'boolean' ? (
                            row[1] ? (
                              <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/70">{row[1]}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[2] === 'boolean' ? (
                            row[2] ? (
                              <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/70">{row[2]}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[3] === 'boolean' ? (
                            row[3] ? (
                              <CheckCircle className="w-5 h-5 text-green-400 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-500 mx-auto" />
                            )
                          ) : (
                            <span className="text-white/70">{row[3]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: 'Can I try StockPulse before purchasing?',
                  answer: 'Yes! All plans include a 14-day free trial with full access to features. No credit card required to start.',
                },
                {
                  question: 'Can I change my plan later?',
                  answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.',
                },
                {
                  question: 'What payment methods do you accept?',
                  answer: 'We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. All payments are processed securely.',
                },
                {
                  question: 'Is there a cancellation fee?',
                  answer: 'No cancellation fees. You can cancel your subscription at any time and continue using the service until the end of your billing period.',
                },
                {
                  question: 'Do you offer refunds?',
                  answer: 'We offer a 30-day money-back guarantee for all paid plans. If you\'re not satisfied, contact us for a full refund.',
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
                >
                  <h3 className="font-semibold text-white mb-3 text-lg">
                    {faq.question}
                  </h3>
                  <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-3xl p-12"
            >
              <TrendingUp className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-white">
                Ready to Start Trading Smarter?
              </h2>
              <p className="text-xl mb-8 text-white/80 max-w-2xl mx-auto">
                Join thousands of successful traders using StockPulse to maximize their returns
              </p>
              <motion.button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 inline-flex items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-xl border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  StockPulse
                </span>
              </div>
              <p className="text-white/70 mb-4">
                AI-powered trading platform for modern investors.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-white/40 hover:text-cyan-400 cursor-pointer transition-colors" />
                <Smartphone className="w-5 h-5 text-white/40 hover:text-cyan-400 cursor-pointer transition-colors" />
                <Lock className="w-5 h-5 text-white/40 hover:text-cyan-400 cursor-pointer transition-colors" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-white/70">
                <li>
                  <button onClick={() => handleNavigation('features')} className="hover:text-cyan-400 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('pricing')} className="hover:text-cyan-400 transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    API
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Mobile App
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2 text-white/70">
                <li>
                  <button onClick={() => handleNavigation('about')} className="hover:text-cyan-400 transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Careers
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Press
                  </button>
                </li>
                <li>
                  <button onClick={() => handleNavigation('contact')} className="hover:text-cyan-400 transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-white/70">
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Help Center
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Documentation
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Security
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Privacy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-white/60">
            <p>&copy; 2025 StockPulse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage; 
