# Story 8.23: Implement Event-Driven Forecast Adaptation Engine

**Epic:** [Epic 8: Enhanced AI Agents & Intelligence](../epic-8.md)

**Status:** To Do

**Priority:** High

**Estimated Effort:** 20 Story Points (5 weeks)

## User Story

**As a** portfolio manager or quantitative trader
**I want** an AI orchestration engine that coordinates specialized event agents and dynamically adapts forecasting models based on detected market events
**So that** I can have unified, contextually-aware predictions that automatically adjust for FOMC meetings, earnings, witching hours, and other market events while maintaining forecast consistency

## Description

Implement a comprehensive orchestration engine that coordinates all specialized event agents (FOMC, Earnings, Witching Hours) and dynamically adapts forecasting models based on detected market events. This meta-agent uses ensemble methods, Bayesian model averaging, and reinforcement learning to optimize forecast accuracy across different market regimes and event types.

The engine integrates with the AG-UI framework to provide a unified event intelligence dashboard that automatically prioritizes and displays the most relevant event information based on current market conditions and user context.

## Acceptance Criteria

### Event Detection and Coordination

- [ ] **Unified Event Calendar and Detection**

  - Centralized event monitoring across all specialized agents
  - Event priority scoring and conflict resolution when multiple events occur
  - Cross-event impact analysis and interaction effects
  - Real-time event importance weighting based on market conditions

- [ ] **Agent Orchestration Framework**
  - Seamless coordination between FOMC, Earnings, and Witching agents
  - Dynamic agent activation and deactivation based on event proximity
  - Resource allocation optimization for computational efficiency
  - Agent conflict resolution and output harmonization

### Adaptive Forecasting Engine

- [ ] **Dynamic Model Switching**

  - Automatic model selection based on detected events and market regimes
  - Bayesian model averaging for ensemble predictions during event periods
  - Real-time model weight adjustment based on recent performance
  - Regime-specific model activation and parameter tuning

- [ ] **Event Impact Integration**
  - Quantitative integration of event agent outputs into base forecasting models
  - Event-specific adjustment factors for different time horizons
  - Cross-asset event spillover modeling and propagation
  - Uncertainty propagation from event predictions to final forecasts

### Reinforcement Learning Optimization

- [ ] **Adaptive Learning Framework**

  - Continuous learning from forecast performance during different event types
  - Reinforcement learning for optimal agent weight assignments
  - Self-improving event detection sensitivity based on historical accuracy
  - Dynamic threshold adjustment for event significance classification

- [ ] **Feedback Loop Integration**
  - Post-event performance analysis and model recalibration
  - Error attribution to specific agents and event types
  - Learning rate optimization based on market volatility and regime
  - Automated model retraining triggers based on performance degradation

### AG-UI Event Intelligence Integration

- [ ] **Unified Event Dashboard**

  - AG-UI meta-widgets that aggregate and prioritize event information
  - Context-aware event display based on user trading style and positions
  - Interactive event timeline with forecast impact visualization
  - Voice-activated event briefings with cross-agent insights

- [ ] **Conversational Event Intelligence**
  - Natural language queries: "How will today's events affect my portfolio?"
  - Voice-activated cross-event analysis and interaction explanations
  - Multi-turn conversations about event scenarios and portfolio implications
  - Conversational explanation of forecast adjustments and model reasoning

## Dependencies

- Story 8.16: Bayesian Risk Modeling Agent (Foundation Framework)
- Story 8.20: FOMC Event Intelligence Agent (Fed Event Specialization)
- Story 8.21: Earnings Event Analysis Agent (Earnings Specialization)
- Story 8.22: Witching Hours Volatility Agent (Expiration Specialization)
- Story 2.7: Dynamic AG-UI Widget Framework (Interface Generation)

## Technical Specifications

### Event Orchestration Framework

```typescript
interface EventOrchestrator {
  eventDetector: UnifiedEventDetector;
  agentCoordinator: AgentCoordinator;
  forecastingEngine: AdaptiveForecastingEngine;
  learningOptimizer: ReinforcementLearningOptimizer;
  aguiIntegrator: EventAGUIIntegrator;
}

interface UnifiedEventDetector {
  activeEvents: MarketEvent[];
  eventPriorities: EventPriorityMap;
  conflictResolver: EventConflictResolver;
  impactCalculator: CrossEventImpactCalculator;
}

interface MarketEvent {
  eventId: string;
  eventType:
    | "fomc"
    | "earnings"
    | "witching"
    | "economic_data"
    | "geopolitical";
  severity: "low" | "medium" | "high" | "critical";
  timeToEvent: number;
  expectedImpact: EventImpactForecast;
  affectedAssets: string[];
  historicalAnalogs: HistoricalEventComparison[];
  agentRecommendations: AgentRecommendation[];
}

interface EventImpactForecast {
  priceImpact: number;
  volatilityImpact: number;
  volumeImpact: number;
  correlationChanges: CorrelationChange[];
  timeHorizon: "1H" | "1D" | "1W" | "1M";
  confidenceInterval: [number, number];
}
```

### Adaptive Forecasting Engine

```python
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from sklearn.ensemble import VotingRegressor
import torch
import torch.nn as nn

class AdaptiveForecastingEngine:
    def __init__(self):
        self.base_models = {}
        self.event_models = {}
        self.ensemble_weights = {}
        self.model_performance_history = {}
        self.rl_optimizer = None

    def initialize_forecasting_models(self):
        """Initialize base and event-specific forecasting models"""
        # Base models for normal market conditions
        self.base_models = {
            'arima': ARIMAModel(),
            'lstm': LSTMModel(),
            'xgboost': XGBoostModel(),
            'bayesian': BayesianModel()
        }

        # Event-specific overlay models
        self.event_models = {
            'fomc': FOMCEventModel(),
            'earnings': EarningsEventModel(),
            'witching': WitchingEventModel(),
            'crisis': CrisisEventModel()
        }

        # Initialize ensemble weights
        self.ensemble_weights = {
            'normal': {'arima': 0.2, 'lstm': 0.3, 'xgboost': 0.3, 'bayesian': 0.2},
            'fomc': {'arima': 0.1, 'lstm': 0.2, 'xgboost': 0.2, 'bayesian': 0.3, 'fomc': 0.2},
            'earnings': {'arima': 0.1, 'lstm': 0.3, 'xgboost': 0.3, 'bayesian': 0.2, 'earnings': 0.1},
            'witching': {'arima': 0.15, 'lstm': 0.25, 'xgboost': 0.25, 'bayesian': 0.2, 'witching': 0.15}
        }

    def generate_adaptive_forecast(self,
                                 market_data: pd.DataFrame,
                                 active_events: List[MarketEvent],
                                 forecast_horizon: str) -> Dict:
        """Generate forecast that adapts to current market events"""

        # Determine market regime and active event types
        market_regime = self.classify_market_regime(market_data, active_events)

        # Generate base model predictions
        base_predictions = {}
        for model_name, model in self.base_models.items():
            base_predictions[model_name] = model.predict(
                market_data, horizon=forecast_horizon
            )

        # Generate event-specific predictions
        event_predictions = {}
        for event in active_events:
            event_type = event.eventType
            if event_type in self.event_models:
                event_predictions[event_type] = self.event_models[event_type].predict(
                    market_data, event, horizon=forecast_horizon
                )

        # Apply dynamic ensemble weighting
        ensemble_forecast = self.create_ensemble_forecast(
            base_predictions, event_predictions, market_regime, active_events
        )

        # Calculate uncertainty and confidence intervals
        forecast_uncertainty = self.calculate_forecast_uncertainty(
            base_predictions, event_predictions, ensemble_forecast
        )

        return {
            'ensemble_forecast': ensemble_forecast,
            'base_predictions': base_predictions,
            'event_predictions': event_predictions,
            'uncertainty_metrics': forecast_uncertainty,
            'model_weights': self.get_current_weights(market_regime),
            'regime_classification': market_regime,
            'event_adjustments': self.calculate_event_adjustments(active_events)
        }

    def create_ensemble_forecast(self,
                               base_preds: Dict,
                               event_preds: Dict,
                               regime: str,
                               events: List[MarketEvent]) -> Dict:
        """Create weighted ensemble forecast based on regime and events"""

        # Get base weights for current regime
        weights = self.ensemble_weights.get(regime, self.ensemble_weights['normal'])

        # Adjust weights based on recent model performance
        adjusted_weights = self.adjust_weights_by_performance(weights, regime)

        # Calculate ensemble prediction
        ensemble_value = 0.0
        total_weight = 0.0

        # Weight base model predictions
        for model_name, prediction in base_preds.items():
            weight = adjusted_weights.get(model_name, 0.0)
            ensemble_value += weight * prediction['value']
            total_weight += weight

        # Weight event model predictions
        for event_type, prediction in event_preds.items():
            weight = adjusted_weights.get(event_type, 0.0)
            ensemble_value += weight * prediction['value']
            total_weight += weight

        # Normalize
        if total_weight > 0:
            ensemble_value /= total_weight

        return {
            'value': ensemble_value,
            'confidence': self.calculate_ensemble_confidence(
                base_preds, event_preds, adjusted_weights
            ),
            'contributing_models': list(adjusted_weights.keys()),
            'weight_distribution': adjusted_weights
        }
```

### Reinforcement Learning Optimizer

```python
import gym
import numpy as np
from stable_baselines3 import PPO
from stable_baselines3.common.env_util import make_vec_env

class ForecastOptimizationEnv(gym.Env):
    """Custom RL environment for optimizing forecast model weights"""

    def __init__(self, historical_data: pd.DataFrame,
                 events_data: pd.DataFrame):
        super(ForecastOptimizationEnv, self).__init__()

        self.historical_data = historical_data
        self.events_data = events_data
        self.current_step = 0
        self.max_steps = len(historical_data) - 30  # 30 day forecast horizon

        # Action space: weights for each model (continuous, 0-1, sum to 1)
        self.action_space = gym.spaces.Box(
            low=0.0, high=1.0, shape=(6,), dtype=np.float32
        )  # arima, lstm, xgboost, bayesian, event_specific, ensemble

        # Observation space: market features + event indicators
        self.observation_space = gym.spaces.Box(
            low=-np.inf, high=np.inf, shape=(20,), dtype=np.float32
        )

    def reset(self):
        self.current_step = 0
        return self._get_observation()

    def step(self, action):
        # Normalize action to ensure weights sum to 1
        weights = action / np.sum(action)

        # Get current market state and events
        current_state = self._get_current_state()
        active_events = self._get_active_events()

        # Generate forecast using current weights
        forecast = self._generate_weighted_forecast(weights, current_state, active_events)

        # Calculate reward based on forecast accuracy
        actual_return = self._get_actual_return()
        forecast_error = abs(forecast - actual_return)

        # Reward function: negative error with bonus for confidence calibration
        reward = -forecast_error + self._calculate_confidence_bonus(forecast, actual_return)

        self.current_step += 1
        done = self.current_step >= self.max_steps

        return self._get_observation(), reward, done, {}

    def _calculate_confidence_bonus(self, forecast_result: Dict, actual: float) -> float:
        """Bonus for well-calibrated confidence intervals"""
        confidence_interval = forecast_result.get('confidence_interval', [actual, actual])
        lower, upper = confidence_interval

        # Bonus if actual falls within confidence interval
        if lower <= actual <= upper:
            interval_width = upper - lower
            # Prefer tighter intervals when correct
            return 0.1 / (1 + interval_width)
        else:
            # Penalty for miscalibrated confidence
            return -0.1

class ReinforcementLearningOptimizer:
    def __init__(self):
        self.model = None
        self.training_env = None
        self.performance_history = []

    def initialize_rl_optimizer(self, historical_data: pd.DataFrame,
                              events_data: pd.DataFrame):
        """Initialize RL environment and model"""
        self.training_env = ForecastOptimizationEnv(historical_data, events_data)

        # Use PPO for continuous action space
        self.model = PPO(
            "MlpPolicy",
            self.training_env,
            verbose=1,
            learning_rate=0.0003,
            n_steps=2048,
            batch_size=64,
            gamma=0.99,
            gae_lambda=0.95
        )

    def optimize_model_weights(self,
                             current_market_state: Dict,
                             active_events: List[MarketEvent]) -> Dict:
        """Use trained RL model to determine optimal model weights"""
        if self.model is None:
            # Return default weights if model not trained
            return self._get_default_weights(active_events)

        # Prepare observation for RL model
        observation = self._prepare_observation(current_market_state, active_events)

        # Get action (model weights) from RL model
        action, _ = self.model.predict(observation, deterministic=True)

        # Normalize to ensure weights sum to 1
        weights = action / np.sum(action)

        return {
            'arima': weights[0],
            'lstm': weights[1],
            'xgboost': weights[2],
            'bayesian': weights[3],
            'event_specific': weights[4],
            'ensemble_adjustment': weights[5]
        }

    def continuous_learning(self,
                          forecast_results: List[Dict],
                          actual_outcomes: List[float]):
        """Continuously update RL model based on recent performance"""
        # Create training episodes from recent forecast results
        training_episodes = self._create_training_episodes(
            forecast_results, actual_outcomes
        )

        # Update RL model with new experiences
        if len(training_episodes) > 100:  # Minimum episodes for update
            self.model.learn(total_timesteps=len(training_episodes) * 10)

        # Track performance metrics
        self._update_performance_metrics(forecast_results, actual_outcomes)
```

### AG-UI Event Intelligence Components

```typescript
interface EventIntelligenceAGUIWidget extends AGUIComponent {
  type:
    | "event_timeline"
    | "forecast_attribution"
    | "event_impact_matrix"
    | "model_performance"
    | "unified_briefing";
  eventComplexity: "simple" | "moderate" | "complex" | "extreme";
  forecastHorizon: "1H" | "1D" | "1W" | "1M";
  activeEventCount: number;
  intelligenceContext: EventIntelligenceContext;
}

interface EventIntelligenceContext {
  activeEvents: MarketEvent[];
  forecastAdjustments: ForecastAdjustment[];
  modelPerformance: ModelPerformanceMetrics;
  eventInteractions: EventInteraction[];
  uncertaintyMetrics: UncertaintyAnalysis;
  recommendedActions: ActionRecommendation[];
}

interface ForecastAdjustment {
  adjustmentType:
    | "model_weight"
    | "parameter_shift"
    | "regime_change"
    | "event_overlay";
  magnitude: number;
  confidence: number;
  timeHorizon: string;
  triggeringEvent: string;
  rationale: string;
}
```

### Real-Time Event Orchestration

```typescript
class EventDrivenForecastProcessor {
  private eventDetector: UnifiedEventDetector;
  private forecastingEngine: AdaptiveForecastingEngine;
  private rlOptimizer: ReinforcementLearningOptimizer;
  private agentCoordinator: AgentCoordinator;
  private aguiGenerator: EventIntelligenceAGUIGenerator;

  async processMarketUpdate(update: MarketDataUpdate): Promise<void> {
    // Detect and prioritize active events
    const activeEvents = await this.eventDetector.detectActiveEvents(update);

    // Coordinate specialized agents based on active events
    const agentOutputs = await this.agentCoordinator.coordinateAgents(
      activeEvents,
      update,
    );

    // Optimize model weights using RL
    const optimizedWeights = await this.rlOptimizer.optimizeWeights(
      update.marketState,
      activeEvents,
    );

    // Generate adaptive forecast
    const adaptiveForecast = await this.forecastingEngine.generateForecast(
      update.marketData,
      activeEvents,
      optimizedWeights,
    );

    // Analyze forecast attribution and uncertainty
    const forecastAnalysis = await this.analyzeForecastAttribution(
      adaptiveForecast,
      agentOutputs,
      activeEvents,
    );

    // Generate unified AG-UI components
    const aguiComponents =
      await this.aguiGenerator.createEventIntelligenceComponents({
        activeEvents,
        adaptiveForecast,
        forecastAnalysis,
        modelPerformance: await this.getModelPerformanceMetrics(),
        uncertaintyAnalysis: await this.analyzeUncertainty(adaptiveForecast),
      });

    // Update learning system with latest results
    await this.updateLearningSystem(adaptiveForecast, agentOutputs);

    // Broadcast unified intelligence updates
    await this.broadcastEventIntelligence(aguiComponents);
  }
}
```

### Voice-Activated Event Intelligence

```typescript
interface EventIntelligenceVoiceCommands {
  queries: {
    "What events are affecting my forecast today?": () => Promise<string>;
    "How confident is the model in current predictions?": () => Promise<string>;
    "Which agent is contributing most to the forecast?": () => Promise<string>;
    "Explain the forecast adjustments for this week": () => Promise<string>;
    "What's the biggest risk to my portfolio right now?": () => Promise<string>;
  };

  briefingMode: {
    activateUnifiedEventBriefing: () => Promise<void>;
    provideCrossEventAnalysis: () => Promise<void>;
    generateForecastAttributionReport: () => Promise<void>;
  };
}
```

### Performance Requirements

- **Event Coordination**: <10 seconds for multi-agent coordination and output synthesis
- **Forecast Generation**: <30 seconds for adaptive ensemble forecast creation
- **RL Optimization**: <5 seconds for real-time weight optimization
- **Voice Response**: <3 seconds for complex event intelligence queries
- **Model Updates**: <2 minutes for continuous learning model updates

### Integration Points

- **Specialized Agents**: Deep integration with FOMC, Earnings, and Witching agents
- **Market Data**: Real-time multi-asset market data for comprehensive analysis
- **Machine Learning**: Advanced ML frameworks for ensemble methods and RL
- **AG-UI System**: Dynamic interface generation for unified event intelligence
- **Performance Tracking**: Comprehensive forecast performance monitoring and attribution

## Testing Requirements

### Unit Testing

- Event detection and prioritization accuracy
- Ensemble forecast generation validation
- RL optimization convergence testing
- AG-UI event intelligence widget generation

### Integration Testing

- Multi-agent coordination and output synthesis
- Real-time adaptive forecasting under various event scenarios
- Cross-event impact analysis accuracy
- Voice command recognition and complex query responses

### Performance Testing

- Scalability under multiple simultaneous events
- Real-time processing latency under high market volatility
- Memory usage optimization for long-running ensemble models
- RL training efficiency and convergence speed

### Validation Testing

- Historical backtesting across different market regimes and event types
- Forecast accuracy improvement measurement vs. individual agents
- Model attribution accuracy and explanation quality
- Event impact prediction validation against actual market moves

## Definition of Done

- [ ] Unified event detection and coordination across all specialized agents
- [ ] Adaptive forecasting engine with dynamic model selection and weighting
- [ ] Reinforcement learning optimization for continuous model improvement
- [ ] AG-UI unified event intelligence dashboard with voice integration
- [ ] Real-time cross-event impact analysis and forecast attribution
- [ ] Conversational explanations of complex forecast adjustments
- [ ] Historical validation showing improved accuracy vs. individual models
- [ ] Performance benchmarks meeting real-time processing requirements
- [ ] Comprehensive documentation including model architecture and decision explanations
- [ ] Continuous learning framework for ongoing performance optimization

## Business Value

- **Unified Intelligence**: Single source of truth for all market event intelligence
- **Improved Accuracy**: Ensemble approach leveraging specialized agents for better predictions
- **Adaptive Learning**: Self-improving system that gets better over time
- **Risk Management**: Comprehensive event impact analysis for better risk assessment
- **Competitive Edge**: Institutional-level event-driven forecasting for sophisticated users

## Technical Risks

- **Complexity Management**: Ensuring system remains manageable as agents and events multiply
- **Performance Scaling**: Maintaining real-time performance with growing computational requirements
- **Model Stability**: Preventing ensemble instability when agent outputs conflict
- **Learning Efficiency**: Ensuring RL optimization converges reliably across market regimes

## Success Metrics

- Forecast accuracy improvement >15% vs. best individual agent across all event types
- Event detection completeness >95% for major market events
- Real-time processing <30 seconds for comprehensive event analysis
- Model attribution accuracy >90% for explaining forecast adjustments
- Successful demonstration of continuous learning and performance improvement over time
