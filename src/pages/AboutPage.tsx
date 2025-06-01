import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Users,
  TrendingUp,
  Target,
  BarChart3,
  Globe,
  Smartphone,
  Lock,
} from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="StockPulse" className="w-8 h-8" />
              <span className="text-xl font-bold text-text">StockPulse</span>
            </Link>
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
              <Link to="/about" className="text-primary-600 font-medium">
                About
              </Link>
              <Link
                to="/contact"
                className="text-text/70 hover:text-text transition-colors"
              >
                Contact
              </Link>
            </div>
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
                About{' '}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  StockPulse
                </span>
              </h1>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                We&apos;re building the future of intelligent trading platforms,
                combining cutting-edge AI with institutional-grade infrastructure.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold text-text mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-text/70 mb-6">
                  Traditional trading platforms are complex, expensive, and
                  built for institutions. We believe everyone deserves access to
                  professional-grade trading tools powered by artificial
                  intelligence.
                </p>
                <p className="text-lg text-text/70">
                  StockPulse combines cutting-edge AI technology with intuitive
                  design to help traders of all levels make informed decisions
                  and maximize their returns.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-6"
              >
                {[
                  { icon: Users, title: '50,000+', desc: 'Active Traders' },
                  { icon: TrendingUp, title: '$2.1B+', desc: 'Volume Traded' },
                  { icon: Target, title: '94.2%', desc: 'Accuracy Rate' },
                  { icon: Award, title: '99.9%', desc: 'Uptime' },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="text-center p-6 bg-surface rounded-xl border border-border"
                  >
                    <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-4" />
                    <div className="text-2xl font-bold text-text mb-2">
                      {stat.title}
                    </div>
                    <div className="text-sm text-text/70">{stat.desc}</div>
                  </div>
                ))}
              </motion.div>
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
                Ready to Join Our Community?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Start your journey to smarter trading today
              </p>
              <Link
                to="/auth/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Get Started Now <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
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

export default AboutPage;
