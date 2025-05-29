import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../contexts/ThemeContext";
import { Check, ChevronRight, ArrowRight } from "lucide-react";

const Onboarding: React.FC = () => {
  const { colorTheme, setColorTheme } = useTheme();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [tradingExperience, setTradingExperience] =
    useState<string>("beginner");
  const [investmentGoals, setInvestmentGoals] = useState<string[]>([]);
  const [riskTolerance, setRiskTolerance] = useState<string>("moderate");
  const [preferredTheme, setPreferredTheme] = useState<string>(colorTheme);
  const [completed, setCompleted] = useState<boolean>(false);

  const totalSteps = 5;

  // Investment goals options
  const goalOptions = [
    {
      id: "growth",
      label: "Growth",
      description: "Focus on capital appreciation",
    },
    { id: "income", label: "Income", description: "Generate regular income" },
    {
      id: "preservation",
      label: "Preservation",
      description: "Protect existing capital",
    },
    {
      id: "speculation",
      label: "Speculation",
      description: "High-risk, high-reward opportunities",
    },
    {
      id: "retirement",
      label: "Retirement",
      description: "Long-term retirement planning",
    },
  ];

  // Theme options
  const themeOptions = [
    {
      id: "tropical-jungle",
      name: "Tropical Jungle",
      description: "Vibrant Greens",
      primary: "#29A329",
    },
    {
      id: "ocean-sunset",
      name: "Ocean Sunset",
      description: "Blues + Corals",
      primary: "#008B8B",
    },
    {
      id: "desert-storm",
      name: "Desert Storm",
      description: "Warm Neutrals",
      primary: "#C19A6B",
    },
    {
      id: "berry-fields",
      name: "Berry Fields",
      description: "Purples + Pinks",
      primary: "#8E4585",
    },
    {
      id: "arctic-moss",
      name: "Arctic Moss",
      description: "Cool Grays + Greens",
      primary: "#4682B4",
    },
  ];

  // Toggle investment goal
  const toggleGoal = (goalId: string) => {
    if (investmentGoals.includes(goalId)) {
      setInvestmentGoals(investmentGoals.filter((id) => id !== goalId));
    } else {
      setInvestmentGoals([...investmentGoals, goalId]);
    }
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          name.trim() !== "" &&
          email.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
      case 2:
        return tradingExperience !== "";
      case 3:
        return investmentGoals.length > 0;
      case 4:
        return riskTolerance !== "";
      case 5:
        return preferredTheme !== "";
      default:
        return true;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (isStepValid()) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete onboarding
        setCompleted(true);
        // Apply selected theme
        setColorTheme(preferredTheme);

        // Delay navigation to dashboard to show completion animation
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip onboarding
  const handleSkip = () => {
    navigate("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!completed ? (
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-text">
              Welcome to StockPulse
            </h1>
            <p className="text-text/60 mt-2">
              Let's set up your account to get the most out of your trading
              experience
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      index + 1 < currentStep
                        ? "bg-primary-600 text-white"
                        : index + 1 === currentStep
                          ? "bg-primary-100 border-2 border-primary-600 text-primary-600 dark:bg-primary-900/30 dark:border-primary-500 dark:text-primary-400"
                          : "bg-surface border border-border text-text/60"
                    }`}
                  >
                    {index + 1 < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {index < totalSteps - 1 && (
                    <div
                      className={`flex-1 h-1 ${
                        index + 1 < currentStep ? "bg-primary-600" : "bg-border"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex justify-between text-xs text-text/60">
              <span>Profile</span>
              <span>Experience</span>
              <span>Goals</span>
              <span>Risk</span>
              <span>Theme</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-surface rounded-lg border border-border shadow-sm p-6 mb-6">
            {/* Step 1: Basic Profile */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Your Profile</h2>
                  <p className="text-text/60 mb-4">
                    Let's start with some basic information
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      Please enter a valid email address
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Trading Experience */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Trading Experience
                  </h2>
                  <p className="text-text/60 mb-4">
                    Tell us about your trading background
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setTradingExperience("beginner")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      tradingExperience === "beginner"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          tradingExperience === "beginner"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {tradingExperience === "beginner" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            tradingExperience === "beginner"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Beginner
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          New to trading or have less than 1 year of experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setTradingExperience("intermediate")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      tradingExperience === "intermediate"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          tradingExperience === "intermediate"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {tradingExperience === "intermediate" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            tradingExperience === "intermediate"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Intermediate
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          1-3 years of trading experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setTradingExperience("advanced")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      tradingExperience === "advanced"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          tradingExperience === "advanced"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {tradingExperience === "advanced" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            tradingExperience === "advanced"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Advanced
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          3-5 years of trading experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setTradingExperience("expert")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      tradingExperience === "expert"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          tradingExperience === "expert"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {tradingExperience === "expert" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            tradingExperience === "expert"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Expert
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          5+ years of trading experience
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Investment Goals */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Investment Goals
                  </h2>
                  <p className="text-text/60 mb-4">
                    Select your primary investment objectives (select all that
                    apply)
                  </p>
                </div>

                <div className="space-y-3">
                  {goalOptions.map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`p-4 border rounded-md cursor-pointer ${
                        investmentGoals.includes(goal.id)
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                          : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            investmentGoals.includes(goal.id)
                              ? "bg-primary-500 text-white"
                              : "border border-border dark:border-gray-600"
                          }`}
                        >
                          {investmentGoals.includes(goal.id) && (
                            <Check className="w-3 h-3" />
                          )}
                        </div>
                        <div className="ml-3">
                          <h3
                            className={`text-sm font-medium ${
                              investmentGoals.includes(goal.id)
                                ? "text-primary-700 dark:text-primary-400"
                                : "text-text dark:text-white"
                            }`}
                          >
                            {goal.label}
                          </h3>
                          <p className="text-xs text-text/60 mt-1">
                            {goal.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-sm text-text/60">
                  <p>
                    Selected goals: {investmentGoals.length} of{" "}
                    {goalOptions.length}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 4: Risk Tolerance */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">Risk Tolerance</h2>
                  <p className="text-text/60 mb-4">
                    Select your comfort level with investment risk
                  </p>
                </div>

                <div className="space-y-3">
                  <div
                    onClick={() => setRiskTolerance("conservative")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      riskTolerance === "conservative"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          riskTolerance === "conservative"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {riskTolerance === "conservative" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            riskTolerance === "conservative"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Conservative
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          Prefer stability and minimal risk, willing to accept
                          lower returns
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setRiskTolerance("moderate")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      riskTolerance === "moderate"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          riskTolerance === "moderate"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {riskTolerance === "moderate" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            riskTolerance === "moderate"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Moderate
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          Balanced approach with some risk for potential higher
                          returns
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setRiskTolerance("aggressive")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      riskTolerance === "aggressive"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          riskTolerance === "aggressive"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {riskTolerance === "aggressive" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            riskTolerance === "aggressive"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Aggressive
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          Comfortable with significant risk for potentially
                          higher returns
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    onClick={() => setRiskTolerance("very_aggressive")}
                    className={`p-4 border rounded-md cursor-pointer ${
                      riskTolerance === "very_aggressive"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                        : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          riskTolerance === "very_aggressive"
                            ? "bg-primary-500 text-white"
                            : "border border-border dark:border-gray-600"
                        }`}
                      >
                        {riskTolerance === "very_aggressive" && (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                      <div className="ml-3">
                        <h3
                          className={`text-sm font-medium ${
                            riskTolerance === "very_aggressive"
                              ? "text-primary-700 dark:text-primary-400"
                              : "text-text dark:text-white"
                          }`}
                        >
                          Very Aggressive
                        </h3>
                        <p className="text-xs text-text/60 mt-1">
                          Seeking maximum returns, willing to accept high
                          volatility and potential losses
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 5: Theme Selection */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-1">
                    Choose Your Theme
                  </h2>
                  <p className="text-text/60 mb-4">
                    Select a color theme for your StockPulse experience
                  </p>
                </div>

                <div className="space-y-3">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.id}
                      onClick={() => setPreferredTheme(theme.id)}
                      className={`p-4 border rounded-md cursor-pointer ${
                        preferredTheme === theme.id
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500"
                          : "border-border bg-surface hover:bg-border dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-md"
                          style={{ backgroundColor: theme.primary }}
                        ></div>
                        <div className="ml-3">
                          <h3
                            className={`text-sm font-medium ${
                              preferredTheme === theme.id
                                ? "text-primary-700 dark:text-primary-400"
                                : "text-text dark:text-white"
                            }`}
                          >
                            {theme.name}
                          </h3>
                          <p className="text-xs text-text/60 mt-1">
                            {theme.description}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              preferredTheme === theme.id
                                ? "bg-primary-500 text-white"
                                : "border border-border dark:border-gray-600"
                            }`}
                          >
                            {preferredTheme === theme.id && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            {currentStep === 1 ? (
              <button
                type="button"
                onClick={handleSkip}
                className="px-4 py-2 text-sm font-medium text-text hover:text-text/90 dark:text-text/40 dark:hover:text-text/100"
              >
                Skip for now
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePreviousStep}
                className="px-4 py-2 text-sm font-medium bg-surface text-text border border-border rounded-md hover:bg-border dark:bg-gray-800 dark:text-text dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={handleNextStep}
              disabled={!isStepValid()}
              className={`px-4 py-2 text-sm font-medium rounded-md flex items-center ${
                isStepValid()
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-primary-300 text-white cursor-not-allowed dark:bg-primary-800 dark:text-primary-300"
              }`}
            >
              {currentStep < totalSteps ? (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Complete Setup
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto text-center p-8 bg-surface rounded-lg shadow-lg"
        >
          <Check className="w-16 h-16 text-primary-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Setup Complete!</h1>
          <p className="text-text/60 mb-6">
            Your StockPulse account is ready. Redirecting you to the
            dashboard...
          </p>
          <div className="w-full bg-border rounded-full h-2.5 mb-4">
            <motion.div
              className="bg-primary-600 h-2.5 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.8, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Onboarding;
