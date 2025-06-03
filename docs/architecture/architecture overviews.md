graph TD
    A[AIInsightsWidget] --> B[aiAgentService]
    B --> C[Market Insights AI Agent:9003]
    C --> D[Graphiti Knowledge Graph]
    C --> E[StockPulse_VectorDB]
    C --> F[LightRAG Framework]
    A --> G[WebSocket Client]
    G --> H[Real-time Insights Stream]
    A --> I[AG-UI Renderer]
