import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ArrowRight,
  BarChart3,
  Globe,
  Smartphone,
  Lock,
} from "lucide-react";

const ContactPage: React.FC = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Contact form submitted:", formData);
  };

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
              <Link
                to="/about"
                className="text-text/70 hover:text-text transition-colors"
              >
                About
              </Link>
              <Link to="/contact" className="text-primary-600 font-medium">
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
                Get in{" "}
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  Touch
                </span>
              </h1>
              <p className="text-lg text-text/70 max-w-3xl mx-auto">
                Have questions about StockPulse? We're here to help. Reach out
                to our team and we'll get back to you within 24 hours.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="bg-surface rounded-xl p-8 border border-border shadow-lg">
                  <h2 className="text-2xl font-bold text-text mb-6">
                    Send us a message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-text mb-2"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-text mb-2"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-text mb-2"
                      >
                        Subject
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="sales">Sales & Pricing</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-text mb-2"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        placeholder="Tell us how we can help you..."
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
                    >
                      Send Message
                      <Send className="w-4 h-4 ml-2" />
                    </button>
                  </form>
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
                    <h2 className="text-2xl font-bold text-text mb-6">
                      Contact Information
                    </h2>
                    <p className="text-text/70 mb-8">
                      Our team is ready to help you succeed. Choose the best way
                      to reach us.
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
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-6 bg-surface rounded-xl border border-border"
                      >
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-text mb-1">
                            {item.title}
                          </h3>
                          <p className="text-text/80 mb-1">{item.content}</p>
                          <p className="text-sm text-text/60">
                            {item.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl p-6 text-white">
                    <h3 className="font-semibold mb-2">
                      Need immediate assistance?
                    </h3>
                    <p className="mb-4 opacity-90">
                      Join our community for real-time support and discussions.
                    </p>
                    <Link
                      to="/auth/register"
                      className="bg-white text-primary-600 hover:bg-gray-100 px-4 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
                    >
                      Join Community
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
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

export default ContactPage;
