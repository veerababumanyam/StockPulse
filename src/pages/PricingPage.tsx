import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  X,
  Zap,
  Star,
  ArrowRight,
  TrendingUp,
  BarChart3,
  Globe,
  Smartphone,
  Lock,
} from "lucide-react";

const PricingPage: React.FC = () => {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for individual traders getting started",
      features: [
        "Real-time market data",
        "Basic trading signals",
        "Portfolio tracking",
        "Mobile app access",
        "Email support",
        "Up to 10 watchlists",
      ],
      notIncluded: [
        "Advanced AI analytics",
        "Custom indicators",
        "Priority support",
        "API access",
      ],
      popular: false,
      cta: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Advanced tools for serious traders",
      features: [
        "Everything in Starter",
        "Advanced AI trading signals",
        "Custom technical indicators",
        "Risk management tools",
        "Advanced portfolio analytics",
        "Priority support",
        "Unlimited watchlists",
        "Export data features",
      ],
      notIncluded: ["White-label solutions", "Dedicated account manager"],
      popular: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "$299",
      period: "/month",
      description: "Complete solution for institutions",
      features: [
        "Everything in Professional",
        "API access & webhooks",
        "White-label solutions",
        "Custom integrations",
        "Dedicated account manager",
        "Multi-user accounts",
        "Advanced security features",
        "Custom reporting",
        "SLA guarantee",
        "24/7 phone support",
      ],
      notIncluded: [],
      popular: false,
      cta: "Contact Sales",
    },
  ];

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
              <Link to="/pricing" className="text-primary-600 font-medium">
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

      {/* Pricing Content */}
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
                Simple, Transparent
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {" "}
                  Pricing
                </span>
              </h1>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                Choose the perfect plan for your trading needs. All plans
                include a 14-day free trial with no commitment.
              </p>

              {/* Pricing Toggle */}
              <div className="flex items-center justify-center mt-8 p-1 bg-surface rounded-lg border border-border w-fit mx-auto">
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md">
                  Monthly
                </button>
                <button className="px-4 py-2 text-sm font-medium text-text/70 hover:text-text">
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
                  className={`relative bg-background rounded-2xl p-8 shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                    plan.popular
                      ? "border-primary-500 scale-105"
                      : "border-border hover:border-primary-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                        <Star className="w-4 h-4 mr-1" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-text mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-text/70 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-text">
                        {plan.price}
                      </span>
                      <span className="text-text/70 ml-1">{plan.period}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mb-8">
                    <h4 className="font-semibold text-text mb-4">
                      What's included:
                    </h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-text/80"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {plan.notIncluded.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center text-sm text-text/40"
                        >
                          <X className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link
                    to={
                      plan.name === "Enterprise" ? "/contact" : "/auth/register"
                    }
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center ${
                      plan.popular
                        ? "bg-primary-600 hover:bg-primary-700 text-white shadow-lg transform hover:scale-105"
                        : "bg-surface border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Comparison */}
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
                Compare All Features
              </h2>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                See exactly what's included in each plan to make the best choice
                for your trading needs.
              </p>
            </motion.div>

            {/* Comparison Table */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-surface rounded-xl border border-border overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-surface/50 border-b border-border">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-text">
                        Features
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-text">
                        Starter
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-text">
                        Professional
                      </th>
                      <th className="text-center py-4 px-6 font-semibold text-text">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["Real-time market data", true, true, true],
                      [
                        "Trading signals",
                        "Basic",
                        "Advanced AI",
                        "Advanced AI",
                      ],
                      ["Portfolio tracking", true, true, true],
                      ["Custom indicators", false, true, true],
                      ["Risk management", false, true, true],
                      ["API access", false, false, true],
                      ["Priority support", false, true, true],
                      ["Dedicated account manager", false, false, true],
                      ["White-label solutions", false, false, true],
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-surface/50">
                        <td className="py-4 px-6 text-text">{row[0]}</td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[1] === "boolean" ? (
                            row[1] ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-text/70">{row[1]}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[2] === "boolean" ? (
                            row[2] ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-text/70">{row[2]}</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {typeof row[3] === "boolean" ? (
                            row[3] ? (
                              <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                            ) : (
                              <X className="w-5 h-5 text-gray-400 mx-auto" />
                            )
                          ) : (
                            <span className="text-text/70">{row[3]}</span>
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
        <section className="py-20 bg-surface/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "Can I try StockPulse before purchasing?",
                  answer:
                    "Yes! All plans include a 14-day free trial with full access to features. No credit card required to start.",
                },
                {
                  question: "Can I change my plan later?",
                  answer:
                    "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately with prorated billing.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards, PayPal, and bank transfers for Enterprise customers. All payments are processed securely.",
                },
                {
                  question: "Is there a cancellation fee?",
                  answer:
                    "No cancellation fees. You can cancel your subscription at any time and continue using the service until the end of your billing period.",
                },
                {
                  question: "Do you offer refunds?",
                  answer:
                    "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact us for a full refund.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-background rounded-lg p-6 border border-border"
                >
                  <h3 className="font-semibold text-text mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-text/70">{faq.answer}</p>
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
              <TrendingUp className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Start Trading Smarter?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of successful traders using StockPulse to
                maximize their returns
              </p>
              <Link
                to="/auth/register"
                className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
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

export default PricingPage;
