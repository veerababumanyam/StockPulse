# Dynamic AG-UI Implementation Guide for StockPulse

## Overview

This guide provides a comprehensive implementation strategy for integrating Dynamic AG-UI (Agent-Generated User Interface) capabilities into the existing StockPulse React/TypeScript architecture without disrupting current functionality.

## Architecture Integration Strategy

### Current Stack Compatibility

- **Frontend**: React + TypeScript + Vite ✓
- **State Management**: Adding Zustand (lightweight, perfect for AG-UI) ✓
- **Real-time**: Socket.io for WebSocket communication ✓
- **Styling**: Tailwind CSS (compatible with dynamic styling) ✓
- **Backend**: FastAPI (already in place) ✓

### Key Integration Points

1. AG-UI components will be implemented as a new module within the existing component structure
2. Zustand will manage AG-UI state alongside existing React Context
3. Socket.io will be added for real-time agent communication
4. Existing API client will be extended to handle AG-UI payloads

## 1. AG-UI Schema Definition

### Core Schema Structure

```typescript
// src/types/ag-ui.ts

export interface AGUISchema {
  id: string;
  agentId: string;
  timestamp: number;
  components: AGUIComponent[];
  layout?: AGUILayout;
  metadata?: AGUIMetadata;
}

export interface AGUIComponent {
  id: string;
  componentType: AGUIComponentType;
  dataSource: string | AGUIDataBinding;
  props?: Record<string, any>;
  interactionHandlers?: AGUIInteraction[];
  visibility?: AGUIVisibility;
  styling?: AGUIStyling;
  children?: AGUIComponent[];
}

export type AGUIComponentType =
  | "chart"
  | "table"
  | "alert"
  | "form"
  | "text"
  | "panel"
  | "heatmap"
  | "gauge"
  | "timeline"
  | "correlation-matrix";

export interface AGUIDataBinding {
  source: string;
  path: string;
  transform?: string;
  refresh?: number;
}

export interface AGUIInteraction {
  type: "click" | "hover" | "toggle" | "adjust" | "submit";
  parameter: string;
  handler: string;
  options?: any[];
}

export interface AGUIVisibility {
  condition: "always" | "conditional" | "user-triggered";
  rules?: AGUIRule[];
}

export interface AGUIStyling {
  theme?: "default" | "dark" | "custom";
  size?: "sm" | "md" | "lg" | "auto";
  position?: AGUIPosition;
  animation?: AGUIAnimation;
}
```

### Example AG-UI Payload

```json
{
  "id": "agui-breakout-alert-001",
  "agentId": "technical-analysis-agent",
  "timestamp": 1703123456789,
  "components": [
    {
      "id": "breakout-chart",
      "componentType": "chart",
      "dataSource": {
        "source": "market-data",
        "path": "AAPL.price_volume",
        "refresh": 1000
      },
      "props": {
        "chartType": "candlestick",
        "indicators": ["volume", "breakout-line"],
        "timeframe": "5m"
      },
      "interactionHandlers": [
        {
          "type": "adjust",
          "parameter": "timeframe",
          "options": ["1m", "5m", "15m", "1h"]
        },
        {
          "type": "toggle",
          "parameter": "indicators.bollinger"
        }
      ],
      "visibility": {
        "condition": "conditional",
        "rules": [
          {
            "field": "breakout.detected",
            "operator": "equals",
            "value": true
          }
        ]
      }
    }
  ]
}
```

## 2. Frontend Implementation

### 2.1 Zustand Store for AG-UI State

```typescript
// src/stores/agUIStore.ts

import { create } from "zustand";
import { AGUISchema, AGUIComponent } from "@/types/ag-ui";

interface AGUIState {
  activeSchemas: Map<string, AGUISchema>;
  componentRegistry: Map<string, AGUIComponent>;
  userPreferences: AGUIUserPreferences;

  // Actions
  addSchema: (schema: AGUISchema) => void;
  updateComponent: (
    componentId: string,
    updates: Partial<AGUIComponent>,
  ) => void;
  removeSchema: (schemaId: string) => void;
  setUserPreference: (key: string, value: any) => void;
}

export const useAGUIStore = create<AGUIState>((set, get) => ({
  activeSchemas: new Map(),
  componentRegistry: new Map(),
  userPreferences: loadUserPreferences(),

  addSchema: (schema) =>
    set((state) => {
      const newSchemas = new Map(state.activeSchemas);
      newSchemas.set(schema.id, schema);

      // Register components
      const newRegistry = new Map(state.componentRegistry);
      schema.components.forEach((comp) => {
        newRegistry.set(comp.id, comp);
      });

      return {
        activeSchemas: newSchemas,
        componentRegistry: newRegistry,
      };
    }),

  updateComponent: (componentId, updates) =>
    set((state) => {
      const component = state.componentRegistry.get(componentId);
      if (component) {
        const updatedComponent = { ...component, ...updates };
        const newRegistry = new Map(state.componentRegistry);
        newRegistry.set(componentId, updatedComponent);
        return { componentRegistry: newRegistry };
      }
      return state;
    }),

  removeSchema: (schemaId) =>
    set((state) => {
      const newSchemas = new Map(state.activeSchemas);
      const schema = newSchemas.get(schemaId);

      if (schema) {
        newSchemas.delete(schemaId);

        // Remove components from registry
        const newRegistry = new Map(state.componentRegistry);
        schema.components.forEach((comp) => {
          newRegistry.delete(comp.id);
        });

        return {
          activeSchemas: newSchemas,
          componentRegistry: newRegistry,
        };
      }
      return state;
    }),

  setUserPreference: (key, value) =>
    set((state) => ({
      userPreferences: { ...state.userPreferences, [key]: value },
    })),
}));
```

### 2.2 Socket.io Integration

```typescript
// src/services/agUISocket.ts

import { io, Socket } from "socket.io-client";
import { AGUISchema } from "@/types/ag-ui";
import { useAGUIStore } from "@/stores/agUIStore";

class AGUISocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string = process.env.REACT_APP_WS_URL || "ws://localhost:8001") {
    this.socket = io(url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
    return this.socket;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("AG-UI WebSocket connected");
      this.reconnectAttempts = 0;
      this.subscribeToAgents();
    });

    this.socket.on("disconnect", (reason) => {
      console.log("AG-UI WebSocket disconnected:", reason);
    });

    // AG-UI events
    this.socket.on("agui:update", (schema: AGUISchema) => {
      useAGUIStore.getState().addSchema(schema);
    });

    this.socket.on("agui:remove", (schemaId: string) => {
      useAGUIStore.getState().removeSchema(schemaId);
    });

    this.socket.on(
      "agui:component:update",
      (data: { componentId: string; updates: Partial<AGUIComponent> }) => {
        useAGUIStore.getState().updateComponent(data.componentId, data.updates);
      },
    );
  }

  private subscribeToAgents() {
    if (!this.socket) return;

    // Subscribe to relevant agent channels based on user preferences
    const userAgents = [
      "technical-analysis",
      "portfolio-optimizer",
      "risk-manager",
    ];

    this.socket.emit("agui:subscribe", {
      agents: userAgents,
      userId: getUserId(), // From auth context
    });
  }

  sendInteraction(componentId: string, interaction: any) {
    if (!this.socket) return;

    this.socket.emit("agui:interaction", {
      componentId,
      interaction,
      timestamp: Date.now(),
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const agUISocket = new AGUISocketService();
```

### 2.3 Dynamic Component Renderer

```typescript
// src/components/ag-ui/AGUIRenderer.tsx

import React, { Suspense, lazy } from 'react';
import { AGUIComponent } from '@/types/ag-ui';
import { useAGUIStore } from '@/stores/agUIStore';

// Lazy load AG-UI components for better performance
const componentMap = {
  chart: lazy(() => import('./components/AGUIChart')),
  table: lazy(() => import('./components/AGUITable')),
  alert: lazy(() => import('./components/AGUIAlert')),
  panel: lazy(() => import('./components/AGUIPanel')),
  heatmap: lazy(() => import('./components/AGUIHeatmap')),
  gauge: lazy(() => import('./components/AGUIGauge')),
  timeline: lazy(() => import('./components/AGUITimeline')),
  'correlation-matrix': lazy(() => import('./components/AGUICorrelationMatrix')),
};

interface AGUIRendererProps {
  component: AGUIComponent;
  depth?: number;
}

export const AGUIRenderer: React.FC<AGUIRendererProps> = ({
  component,
  depth = 0
}) => {
  const { componentRegistry } = useAGUIStore();

  // Check visibility rules
  if (!isComponentVisible(component)) {
    return null;
  }

  const Component = componentMap[component.componentType];

  if (!Component) {
    console.warn(`Unknown AG-UI component type: ${component.componentType}`);
    return null;
  }

  return (
    <Suspense fallback={<AGUILoadingPlaceholder />}>
      <div
        className={`agui-component agui-${component.componentType}`}
        data-component-id={component.id}
        style={generateComponentStyles(component.styling)}
      >
        <Component
          {...component.props}
          dataSource={component.dataSource}
          interactions={component.interactionHandlers}
          componentId={component.id}
        />

        {/* Render children recursively */}
        {component.children?.map((child) => (
          <AGUIRenderer
            key={child.id}
            component={child}
            depth={depth + 1}
          />
        ))}
      </div>
    </Suspense>
  );
};

// Helper functions
function isComponentVisible(component: AGUIComponent): boolean {
  if (!component.visibility) return true;

  if (component.visibility.condition === 'always') return true;

  if (component.visibility.condition === 'conditional' && component.visibility.rules) {
    // Evaluate visibility rules
    return component.visibility.rules.every(rule => evaluateRule(rule));
  }

  return false;
}

function evaluateRule(rule: AGUIRule): boolean {
  // Implement rule evaluation logic
  // This would check against current data state
  return true;
}

function generateComponentStyles(styling?: AGUIStyling): React.CSSProperties {
  if (!styling) return {};

  return {
    // Convert AG-UI styling to CSS properties
    ...(styling.position && {
      position: styling.position.type,
      top: styling.position.top,
      left: styling.position.left,
      right: styling.position.right,
      bottom: styling.position.bottom,
    }),
    // Add animation classes if specified
    ...(styling.animation && {
      animation: `${styling.animation.type} ${styling.animation.duration}ms ${styling.animation.easing}`
    })
  };
}
```

### 2.4 AG-UI Dashboard Container

```typescript
// src/components/ag-ui/AGUIDashboard.tsx

import React, { useEffect } from 'react';
import { useAGUIStore } from '@/stores/agUIStore';
import { AGUIRenderer } from './AGUIRenderer';
import { agUISocket } from '@/services/agUISocket';
import { useAuth } from '@/contexts/AuthContext';

export const AGUIDashboard: React.FC = () => {
  const { activeSchemas } = useAGUIStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Connect to AG-UI WebSocket when user is authenticated
      agUISocket.connect();

      return () => {
        agUISocket.disconnect();
      };
    }
  }, [user]);

  return (
    <div className="agui-dashboard grid grid-cols-12 gap-4 p-4">
      {Array.from(activeSchemas.values()).map((schema) => (
        <div
          key={schema.id}
          className={`agui-schema-container ${getLayoutClass(schema.layout)}`}
        >
          {schema.components.map((component) => (
            <AGUIRenderer key={component.id} component={component} />
          ))}
        </div>
      ))}
    </div>
  );
};

function getLayoutClass(layout?: AGUILayout): string {
  if (!layout) return 'col-span-12';

  // Convert layout configuration to Tailwind classes
  return `col-span-${layout.columns || 12} row-span-${layout.rows || 1}`;
}
```

## 3. Example AG-UI Components

### 3.1 Interactive Chart Component

```typescript
// src/components/ag-ui/components/AGUIChart.tsx

import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { AGUIDataBinding } from '@/types/ag-ui';
import { useMarketData } from '@/hooks/useMarketData';
import { agUISocket } from '@/services/agUISocket';

interface AGUIChartProps {
  componentId: string;
  dataSource: string | AGUIDataBinding;
  chartType: 'candlestick' | 'line' | 'area';
  indicators?: string[];
  timeframe?: string;
  interactions?: AGUIInteraction[];
}

export const AGUIChart: React.FC<AGUIChartProps> = ({
  componentId,
  dataSource,
  chartType,
  indicators = [],
  timeframe = '5m',
  interactions = []
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  // Get real-time data
  const { data, isLoading } = useMarketData(dataSource, selectedTimeframe);

  useEffect(() => {
    if (!chartContainerRef.current || !data) return;

    // Initialize chart
    if (!chartRef.current) {
      chartRef.current = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 400,
      });
    }

    // Update chart data
    const series = createSeries(chartRef.current, chartType);
    series.setData(data);

    // Add indicators
    indicators.forEach(indicator => {
      addIndicator(chartRef.current!, indicator, data);
    });

    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
    };
  }, [data, chartType, indicators]);

  // Handle interactions
  const handleTimeframeChange = (newTimeframe: string) => {
    setSelectedTimeframe(newTimeframe);

    // Notify agent of interaction
    agUISocket.sendInteraction(componentId, {
      type: 'adjust',
      parameter: 'timeframe',
      value: newTimeframe
    });
  };

  return (
    <div className="agui-chart-container">
      <div className="agui-chart-controls flex gap-2 mb-2">
        {interactions
          .filter(i => i.type === 'adjust' && i.parameter === 'timeframe')
          .map(interaction => (
            <div key={interaction.parameter} className="flex gap-1">
              {interaction.options?.map(option => (
                <button
                  key={option}
                  onClick={() => handleTimeframeChange(option)}
                  className={`px-2 py-1 text-sm rounded ${
                    selectedTimeframe === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ))}
      </div>

      <div ref={chartContainerRef} className="agui-chart" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white">Loading chart data...</div>
        </div>
      )}
    </div>
  );
};
```

### 3.2 Conversational Interface Component

```typescript
// src/components/ag-ui/components/AGUIConversational.tsx

import React, { useState, useRef, useEffect } from 'react';
import { AGUIRenderer } from '../AGUIRenderer';
import { parseAgentMessage } from '@/utils/ag-ui/messageParser';

interface ConversationalMessage {
  id: string;
  agentId: string;
  text: string;
  embeddedComponents?: AGUIComponent[];
  timestamp: number;
}

export const AGUIConversational: React.FC = () => {
  const [messages, setMessages] = useState<ConversationalMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to conversational updates
    const unsubscribe = agUISocket.on('agui:conversation', (message: any) => {
      const parsed = parseAgentMessage(message);
      setMessages(prev => [...prev, parsed]);
    });

    return unsubscribe;
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <div className="agui-conversational flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="agui-message">
            <div className="flex items-start gap-3">
              <div className="agui-agent-avatar w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm">
                {message.agentId.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <div className="agui-message-header text-sm text-gray-400 mb-1">
                  {message.agentId} • {formatTimestamp(message.timestamp)}
                </div>

                <div className="agui-message-content">
                  {renderMessageContent(message.text, message.embeddedComponents)}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

function renderMessageContent(
  text: string,
  components?: AGUIComponent[]
): React.ReactNode {
  if (!components || components.length === 0) {
    return <p className="text-gray-200">{text}</p>;
  }

  // Parse text for component insertion points
  const parts = text.split(/\{\{component:(\w+)\}\}/g);

  return (
    <div className="agui-rich-message">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          // Text part
          return <span key={index} className="text-gray-200">{part}</span>;
        } else {
          // Component placeholder
          const component = components.find(c => c.id === part);
          return component ? (
            <div key={index} className="my-2">
              <AGUIRenderer component={component} />
            </div>
          ) : null;
        }
      })}
    </div>
  );
}
```

## 4. Backend Integration (FastAPI)

### 4.1 AG-UI WebSocket Handler

```python
# services/backend/app/api/v1/agui_websocket.py

from fastapi import WebSocket, WebSocketDisconnect, Depends
from typing import Dict, List, Optional
import json
import asyncio
from datetime import datetime

from app.services.mcp.agent_orchestrator import AgentOrchestrator
from app.schemas.agui import AGUISchema, AGUIComponent
from app.core.auth import get_current_user_ws

class AGUIConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_subscriptions: Dict[str, List[str]] = {}
        self.agent_orchestrator = AgentOrchestrator()

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

        # Send initial AG-UI state
        await self.send_initial_state(websocket, user_id)

    async def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_subscriptions:
            del self.user_subscriptions[user_id]

    async def subscribe_to_agents(self, user_id: str, agent_ids: List[str]):
        self.user_subscriptions[user_id] = agent_ids

        # Notify agents of new subscriber
        for agent_id in agent_ids:
            await self.agent_orchestrator.notify_agent_subscription(
                agent_id, user_id
            )

    async def send_agui_update(self, user_id: str, schema: AGUISchema):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json({
                "type": "agui:update",
                "data": schema.dict()
            })

    async def broadcast_to_subscribers(
        self,
        agent_id: str,
        schema: AGUISchema
    ):
        # Find all users subscribed to this agent
        for user_id, subscriptions in self.user_subscriptions.items():
            if agent_id in subscriptions:
                await self.send_agui_update(user_id, schema)

    async def handle_interaction(
        self,
        user_id: str,
        component_id: str,
        interaction: dict
    ):
        # Forward interaction to the appropriate agent
        await self.agent_orchestrator.handle_user_interaction(
            user_id, component_id, interaction
        )

manager = AGUIConnectionManager()

@router.websocket("/ws/agui")
async def websocket_endpoint(
    websocket: WebSocket,
    current_user: dict = Depends(get_current_user_ws)
):
    user_id = current_user["sub"]
    await manager.connect(websocket, user_id)

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "agui:subscribe":
                await manager.subscribe_to_agents(
                    user_id,
                    data["agents"]
                )

            elif data["type"] == "agui:interaction":
                await manager.handle_interaction(
                    user_id,
                    data["componentId"],
                    data["interaction"]
                )

    except WebSocketDisconnect:
        await manager.disconnect(user_id)
```

### 4.2 Agent AG-UI Generator

```python
# services/backend/app/services/mcp/agui_generator.py

from typing import Dict, List, Any, Optional
from datetime import datetime
import uuid

from app.schemas.agui import (
    AGUISchema, AGUIComponent, AGUIComponentType,
    AGUIDataBinding, AGUIInteraction, AGUIVisibility
)

class AGUIGenerator:
    """Generates AG-UI schemas for different agent types"""

    def __init__(self, agent_id: str):
        self.agent_id = agent_id

    def create_breakout_alert(
        self,
        symbol: str,
        breakout_data: Dict[str, Any]
    ) -> AGUISchema:
        """Create an AG-UI schema for a breakout alert"""

        return AGUISchema(
            id=f"agui-breakout-{uuid.uuid4().hex[:8]}",
            agent_id=self.agent_id,
            timestamp=datetime.utcnow().timestamp(),
            components=[
                AGUIComponent(
                    id=f"chart-{symbol}-breakout",
                    component_type=AGUIComponentType.CHART,
                    data_source=AGUIDataBinding(
                        source="market-data",
                        path=f"{symbol}.ohlcv",
                        refresh=1000
                    ),
                    props={
                        "chartType": "candlestick",
                        "indicators": ["volume", "breakout-levels"],
                        "annotations": [
                            {
                                "type": "horizontal-line",
                                "y": breakout_data["resistance_level"],
                                "color": "red",
                                "label": "Resistance"
                            },
                            {
                                "type": "horizontal-line",
                                "y": breakout_data["support_level"],
                                "color": "green",
                                "label": "Support"
                            }
                        ]
                    },
                    interaction_handlers=[
                        AGUIInteraction(
                            type="adjust",
                            parameter="timeframe",
                            handler="updateTimeframe",
                            options=["1m", "5m", "15m", "1h", "1d"]
                        ),
                        AGUIInteraction(
                            type="toggle",
                            parameter="indicators.rsi",
                            handler="toggleIndicator"
                        )
                    ],
                    visibility=AGUIVisibility(
                        condition="always"
                    )
                ),
                AGUIComponent(
                    id=f"alert-{symbol}-breakout",
                    component_type=AGUIComponentType.ALERT,
                    data_source=symbol,
                    props={
                        "severity": "high",
                        "title": f"{symbol} Breakout Detected",
                        "message": breakout_data["analysis"],
                        "actions": [
                            {
                                "label": "View Details",
                                "action": "expandChart"
                            },
                            {
                                "label": "Set Alert",
                                "action": "createAlert"
                            }
                        ]
                    }
                )
            ]
        )

    def create_conversational_message(
        self,
        message: str,
        embedded_viz: Optional[Dict[str, Any]] = None
    ) -> AGUISchema:
        """Create a conversational AG-UI message with optional embedded visualization"""

        components = []

        if embedded_viz:
            # Create embedded component based on visualization type
            viz_component = self._create_embedded_visualization(embedded_viz)
            components.append(viz_component)

            # Update message to include component reference
            message = message.replace(
                embedded_viz.get("placeholder", ""),
                f"{{{{component:{viz_component.id}}}}}"
            )

        return AGUISchema(
            id=f"agui-conv-{uuid.uuid4().hex[:8]}",
            agent_id=self.agent_id,
            timestamp=datetime.utcnow().timestamp(),
            components=components,
            metadata={
                "type": "conversational",
                "message": message
            }
        )

    def _create_embedded_visualization(
        self,
        viz_config: Dict[str, Any]
    ) -> AGUIComponent:
        """Create an embedded visualization component"""

        viz_type = viz_config.get("type", "chart")

        if viz_type == "heatmap":
            return AGUIComponent(
                id=f"viz-{uuid.uuid4().hex[:8]}",
                component_type=AGUIComponentType.HEATMAP,
                data_source=viz_config["data_source"],
                props={
                    "colorScale": viz_config.get("colorScale", "viridis"),
                    "showValues": viz_config.get("showValues", True),
                    "interactive": True
                }
            )

        # Default to chart
        return AGUIComponent(
            id=f"viz-{uuid.uuid4().hex[:8]}",
            component_type=AGUIComponentType.CHART,
            data_source=viz_config["data_source"],
            props=viz_config.get("props", {})
        )
```

## 5. Integration with Existing Components

### 5.1 Dashboard Integration

```typescript
// src/pages/DashboardPage.tsx (modified)

import React from 'react';
import { Dashboard } from '@/components/layout/Dashboard';
import { AGUIDashboard } from '@/components/ag-ui/AGUIDashboard';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

export const DashboardPage: React.FC = () => {
  const isAGUIEnabled = useFeatureFlag('AGUI_ENABLED');

  return (
    <Dashboard>
      {/* Existing dashboard content */}
      <div className="existing-widgets">
        {/* Current widgets remain unchanged */}
      </div>

      {/* AG-UI Dynamic Content */}
      {isAGUIEnabled && (
        <div className="mt-6">
          <AGUIDashboard />
        </div>
      )}
    </Dashboard>
  );
};
```

### 5.2 Feature Flag System

```typescript
// src/hooks/useFeatureFlag.ts

export const useFeatureFlag = (flag: string): boolean => {
  // This allows gradual rollout of AG-UI features
  const flags = {
    AGUI_ENABLED: process.env.REACT_APP_AGUI_ENABLED === "true",
    AGUI_VOICE_CONTROL: false, // Enable later
    AGUI_GESTURE_CONTROL: false, // Enable later
    AGUI_THIRD_PARTY_PLUGINS: false, // Enable later
  };

  return flags[flag] || false;
};
```

## 6. Performance Optimizations

### 6.1 Component Lazy Loading

```typescript
// src/components/ag-ui/utils/componentLoader.ts

const componentCache = new Map<string, React.ComponentType<any>>();

export async function loadAGUIComponent(
  componentType: AGUIComponentType,
): Promise<React.ComponentType<any>> {
  // Check cache first
  if (componentCache.has(componentType)) {
    return componentCache.get(componentType)!;
  }

  // Lazy load component
  const module = await import(`../components/AGUI${capitalize(componentType)}`);
  const Component = module.default;

  // Cache for future use
  componentCache.set(componentType, Component);

  return Component;
}
```

### 6.2 WebSocket Message Debouncing

```typescript
// src/services/agUISocket.ts (addition)

class AGUISocketService {
  private updateQueue = new Map<string, AGUISchema>();
  private updateTimer: NodeJS.Timeout | null = null;

  private queueUpdate(schema: AGUISchema) {
    this.updateQueue.set(schema.id, schema);

    // Debounce updates
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }

    this.updateTimer = setTimeout(() => {
      this.flushUpdateQueue();
    }, 50); // 50ms debounce
  }

  private flushUpdateQueue() {
    const updates = Array.from(this.updateQueue.values());
    this.updateQueue.clear();

    // Batch update the store
    const store = useAGUIStore.getState();
    updates.forEach((schema) => store.addSchema(schema));
  }
}
```

## 7. Testing Strategy

### 7.1 Unit Tests

```typescript
// src/components/ag-ui/__tests__/AGUIRenderer.test.tsx

import { render, screen } from '@testing-library/react';
import { AGUIRenderer } from '../AGUIRenderer';
import { AGUIComponent } from '@/types/ag-ui';

describe('AGUIRenderer', () => {
  it('renders chart component correctly', () => {
    const component: AGUIComponent = {
      id: 'test-chart',
      componentType: 'chart',
      dataSource: 'AAPL',
      props: {
        chartType: 'candlestick'
      }
    };

    render(<AGUIRenderer component={component} />);

    expect(screen.getByTestId('agui-chart')).toBeInTheDocument();
  });

  it('handles visibility rules correctly', () => {
    const component: AGUIComponent = {
      id: 'conditional-component',
      componentType: 'alert',
      dataSource: 'test',
      visibility: {
        condition: 'conditional',
        rules: [
          {
            field: 'market.isOpen',
            operator: 'equals',
            value: false
          }
        ]
      }
    };

    render(<AGUIRenderer component={component} />);

    expect(screen.queryByTestId('agui-alert')).not.toBeInTheDocument();
  });
});
```

### 7.2 Integration Tests

```typescript
// src/services/__tests__/agUISocket.test.ts

import { agUISocket } from "../agUISocket";
import { io } from "socket.io-client";

jest.mock("socket.io-client");

describe("AGUISocketService", () => {
  it("connects to WebSocket server", () => {
    const mockSocket = {
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    (io as jest.Mock).mockReturnValue(mockSocket);

    agUISocket.connect("ws://test-server");

    expect(io).toHaveBeenCalledWith("ws://test-server", expect.any(Object));
    expect(mockSocket.on).toHaveBeenCalledWith("connect", expect.any(Function));
  });
});
```

## 8. Migration Strategy

### Phase 1: Foundation (Week 1-2)

1. Implement AG-UI types and schemas
2. Set up Zustand store
3. Create basic Socket.io integration
4. Build AGUIRenderer component

### Phase 2: Core Components (Week 3-4)

1. Implement chart, table, and alert components
2. Add conversational interface
3. Create data binding system
4. Test with mock agents

### Phase 3: Agent Integration (Week 5-6)

1. Connect to real MCP agents
2. Implement interaction handlers
3. Add real-time data updates
4. Performance optimization

### Phase 4: Advanced Features (Week 7-8)

1. Voice control integration
2. Gesture support
3. Third-party plugin system
4. Production deployment

## 9. Monitoring and Analytics

```typescript
// src/utils/ag-ui/analytics.ts

export class AGUIAnalytics {
  static trackComponentRender(component: AGUIComponent) {
    // Track which components are being rendered
    analytics.track("agui_component_rendered", {
      componentType: component.componentType,
      agentId: component.agentId,
      hasInteractions: component.interactionHandlers?.length > 0,
    });
  }

  static trackInteraction(componentId: string, interaction: any) {
    analytics.track("agui_interaction", {
      componentId,
      interactionType: interaction.type,
      parameter: interaction.parameter,
    });
  }

  static trackPerformance(componentId: string, renderTime: number) {
    analytics.track("agui_performance", {
      componentId,
      renderTime,
      timestamp: Date.now(),
    });
  }
}
```

## 10. Security Considerations

1. **Input Validation**: All AG-UI schemas must be validated before rendering
2. **XSS Prevention**: Sanitize any user-generated content in AG-UI components
3. **WebSocket Security**: Authenticate WebSocket connections using JWT
4. **Rate Limiting**: Implement rate limiting for AG-UI updates per user
5. **Content Security Policy**: Update CSP headers to allow AG-UI resources

## Conclusion

This implementation guide provides a comprehensive approach to integrating Dynamic AG-UI capabilities into StockPulse without disrupting the existing architecture. The modular design allows for gradual rollout using feature flags, while the performance optimizations ensure smooth operation even with complex, real-time visualizations.

The AG-UI system will transform StockPulse into a truly adaptive, AI-driven platform where the interface itself becomes an intelligent participant in the trading experience.
