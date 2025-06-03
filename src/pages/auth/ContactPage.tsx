import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  TrendingUp,
  Globe,
  Smartphone,
  Lock,
  Menu,
  X,
  CheckCircle,
  MessageCircle,
  Clock,
  Users,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSignIn = () => {
    navigate("/auth/login");
  };

  const handleGetStarted = () => {
    navigate("/auth/register");
  };

  const handleNavigation = (section: string) => {
    setIsMenuOpen(false);

    switch (section.toLowerCase()) {
      case "features":
        navigate("/");
        // After navigation, scroll to features
        setTimeout(() => {
          const featuresSection = document.getElementById("features");
          if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
        break;
      case "pricing":
        navigate("/auth/pricing");
        break;
      case "about":
        navigate("/about");
        break;
      case "contact":
        // Already on contact page
        break;
      default:
        break;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

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
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{
            y: [10, -10, 10],
            x: [5, -5, 5],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated grid */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent bg-[size:50px_50px] opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle, #06b6d4 1px, transparent 1px)",
          }}
        />
      </div>

      {/* Modern Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center space-x-3 group cursor-pointer"
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
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {["Features", "Pricing", "About", "Contact"].map(
                (item, index) => (
                  <motion.button
                    key={item}
                    onClick={() => handleNavigation(item)}
                    className={`relative transition-all duration-300 font-medium cursor-pointer ${
                      item === "Contact"
                        ? "text-cyan-400"
                        : "text-white/70 hover:text-white"
                    }`}
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    {item}
                    {item === "Contact" && (
                      <motion.div
                        className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ),
              )}
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
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)",
                }}
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
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden backdrop-blur-xl bg-black/20 border-t border-white/10"
            >
              <div className="px-4 py-6 space-y-4">
                {["Features", "Pricing", "About", "Contact"].map(
                  (item, index) => (
                    <motion.button
                      key={item}
                      onClick={() => handleNavigation(item)}
                      className={`block py-3 text-lg transition-colors w-full text-left ${
                        item === "Contact"
                          ? "text-cyan-400"
                          : "text-white/70 hover:text-white"
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {item}
                    </motion.button>
                  ),
                )}
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

      {/* Contact Content */}
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
                <MessageCircle className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                Get in{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>
              <p className="text-xl text-white/70 max-w-3xl mx-auto">
                Have questions about StockPulse? We're here to help. Reach out
                to our team and we'll get back to you within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Send us a message
                  </h2>

                  {isSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                      >
                        <CheckCircle className="w-8 h-8 text-white" />
                      </motion.div>

                      <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 rounded-xl p-4 mb-6">
                        <p className="text-sm text-green-200">
                          Thank you for your message! We'll get back to you
                          within 24 hours.
                        </p>
                      </div>

                      <motion.button
                        onClick={() => {
                          setIsSubmitted(false);
                          setFormData({
                            name: "",
                            email: "",
                            subject: "",
                            message: "",
                          });
                        }}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Send Another Message
                      </motion.button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="name"
                            className="block text-sm font-medium text-white/80 mb-2"
                          >
                            Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="email"
                            className="block text-sm font-medium text-white/80 mb-2"
                          >
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                            placeholder="your@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-white/80 mb-2"
                        >
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300"
                          required
                        >
                          <option value="" className="bg-slate-800">
                            Select a subject
                          </option>
                          <option value="general" className="bg-slate-800">
                            General Inquiry
                          </option>
                          <option value="support" className="bg-slate-800">
                            Technical Support
                          </option>
                          <option value="sales" className="bg-slate-800">
                            Sales & Pricing
                          </option>
                          <option value="partnership" className="bg-slate-800">
                            Partnership
                          </option>
                          <option value="feedback" className="bg-slate-800">
                            Feedback
                          </option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-white/80 mb-2"
                        >
                          Message
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={6}
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-300 resize-none"
                          placeholder="Tell us how we can help you..."
                          required
                        />
                      </div>
                      <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </motion.button>
                    </form>
                  )}
                </div>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Contact Information
                    </h2>
                    <p className="text-white/70 mb-8">
                      Have a question or need help? We'd love to hear from you.
                      Send us a message and we'll respond as soon as possible.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {[
                      {
                        icon: Mail,
                        title: "Email",
                        content: "support@stockpulse.ai",
                        subtitle: "Send us an email anytime",
                      },
                      {
                        icon: Phone,
                        title: "Phone",
                        content: "+1 (555) 123-4567",
                        subtitle: "Mon-Fri from 8am to 5pm PST",
                      },
                      {
                        icon: MapPin,
                        title: "Office",
                        content:
                          "123 Financial District, San Francisco, CA 94105",
                        subtitle: "Visit us in person",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start space-x-4 p-6 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-300"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <item.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            {item.title}
                          </h3>
                          <p className="text-white/80 mb-1">{item.content}</p>
                          <p className="text-sm text-white/60">
                            {item.subtitle}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="backdrop-blur-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-center mb-4">
                      <Clock className="w-6 h-6 text-cyan-400 mr-3" />
                      <h3 className="font-semibold text-white">
                        Response Time
                      </h3>
                    </div>
                    <p className="text-white/80 mb-4">
                      We typically respond within 24 hours during business days.
                      For urgent matters, please call us directly.
                    </p>
                    <motion.button
                      onClick={handleGetStarted}
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 inline-flex items-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Join Community
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
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
                  <button
                    onClick={() => handleNavigation("features")}
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation("pricing")}
                    className="hover:text-cyan-400 transition-colors"
                  >
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
                  <button
                    onClick={() => handleNavigation("about")}
                    className="hover:text-cyan-400 transition-colors"
                  >
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
                  <button
                    onClick={() => handleNavigation("contact")}
                    className="hover:text-cyan-400 transition-colors"
                  >
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

export default ContactPage;
