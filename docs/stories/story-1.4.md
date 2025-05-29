# Story 1.4: MCP Agent Integration for Authentication

**Epic:** [Core User Authentication and Account Setup](../epic-1.md)
**Status:** Draft
**Priority:** Medium
**Points:** 13
**Assigned To:**
**Sprint:** 3
**Dependencies:** Story 1.2 (Backend Auth), Story 1.3 (Frontend AuthContext)

## 1. User Story

> As a StockPulse user,
> I want my authentication events to automatically notify and configure the AI agent ecosystem with my preferences and context,
> So that the agents can provide personalized analysis and trading recommendations from the moment I log in.

## 2. Requirements

*   Integrate FastAPI-MCP to enable agent communication from the authentication system
*   Notify relevant agents when users authenticate successfully
*   Propagate user context (preferences, portfolio settings, risk profile) to agents
*   Handle user logout events to clean up agent contexts
*   Implement secure agent-to-agent authentication for user-specific operations
*   Create user context management system for agent ecosystem
*   Support dynamic agent discovery and context propagation
*   Implement audit trail for agent authentication events

## 3. Acceptance Criteria (ACs)

1.  **AC1:** Given a user successfully logs in, when the authentication event occurs, then relevant agents are notified via MCP with user context information.
2.  **AC2:** Given user context is propagated to agents, when agents receive the context, then they update their internal state to provide personalized recommendations.
3.  **AC3:** Given a user logs out, when the logout event occurs, then all agents are notified to clear user-specific contexts and data.
4.  **AC4:** Given an agent needs to perform user-specific operations, when it validates user context, then it can securely access user permissions and preferences.
5.  **AC5:** Given multiple agents require user context, when context is propagated, then all relevant agents receive consistent user information.
6.  **AC6:** Given authentication events occur, when they are processed, then all events are logged for audit and debugging purposes.
7.  **AC7:** Given the MCP system is unavailable, when authentication occurs, then the authentication process continues without blocking user access.
8.  **AC8:** Given user preferences change, when preference updates occur, then affected agents are notified of the changes.

## 4. Technical Guidance for Developer Agent

### 4.1 FastAPI-MCP Integration Architecture

*   **MCP Setup:**
    ```python
    from fastapi import FastAPI
    from fastapi_mcp import FastApiMCP
    from src.services.mcp.agent_notifier import AgentNotificationService
    
    app = FastAPI()
    mcp = FastApiMCP(app)
    agent_notifier = AgentNotificationService(mcp)
    ```

*   **Agent Registration:**
    ```python
    # Register agents that need authentication context
    AUTHENTICATION_AGENTS = [
        "technical_analysis_agent",
        "portfolio_optimization_agent",
        "risk_management_agent",
        "news_analysis_agent",
        "user_preference_agent"
    ]
    ```

### 4.2 User Context Model

*   **UserContext Schema:**
    ```python
    class UserContext(BaseModel):
        user_id: str
        email: str
        preferences: Dict[str, Any]
        portfolio_settings: Dict[str, Any]
        active_strategies: List[str]
        risk_profile: str
        agent_permissions: Dict[str, bool]
        session_id: str
        created_at: datetime
        last_updated: datetime
    ```

*   **Agent Context Message:**
    ```python
    class AgentContextMessage(BaseModel):
        event_type: str  # "user_authenticated", "user_logged_out", "context_updated"
        user_context: UserContext
        timestamp: datetime
        session_info: Dict[str, Any]
    ```

### 4.3 Agent Notification Service

*   **Core Service Methods:**
    ```python
    class AgentNotificationService:
        async def notify_user_login(self, user_context: UserContext)
        async def notify_user_logout(self, user_id: str)
        async def propagate_user_context(self, user_context: UserContext)
        async def update_user_preferences(self, user_id: str, preferences: Dict)
        async def validate_agent_permissions(self, user_id: str, agent_name: str)
    ```

### 4.4 Authentication Event Integration

*   **Login Event Handler:**
    ```python
    @app.post("/api/v1/auth/login")
    async def login(credentials: LoginRequest, response: Response):
        # Existing authentication logic
        user = await authenticate_user(credentials)
        
        # Create user context for agents
        user_context = await create_user_context(user)
        
        # Notify agents (non-blocking)
        asyncio.create_task(
            agent_notifier.notify_user_login(user_context)
        )
        
        return {"user": user.dict(), "message": "Login successful"}
    ```

### 4.5 Agent Context Management

*   **Context Repository:**
    ```python
    class AgentContextRepository:
        async def store_user_context(self, user_context: UserContext)
        async def get_user_context(self, user_id: str) -> UserContext
        async def update_user_context(self, user_id: str, updates: Dict)
        async def delete_user_context(self, user_id: str)
        async def get_agent_permissions(self, user_id: str, agent_name: str)
    ```

### 4.6 Agent Security Framework

*   **Agent Authentication:**
    ```python
    class AgentAuthenticationMiddleware:
        async def validate_agent_request(self, request: AgentRequest) -> bool
        async def verify_user_permissions(self, user_id: str, agent_name: str) -> bool
        async def create_agent_session(self, user_id: str, agent_name: str) -> str
    ```

### 4.7 Error Handling and Resilience

*   **Circuit Breaker Pattern:** Prevent MCP failures from blocking authentication
*   **Retry Logic:** Automatic retry for transient MCP communication failures
*   **Fallback Mechanisms:** Continue authentication if agent notification fails
*   **Monitoring:** Track agent notification success/failure rates

## 5. Tasks / Subtasks

1.  **Task 1 (AC1):** Set up FastAPI-MCP integration
    *   Configure fastapi-mcp in the authentication service
    *   Register authentication-relevant agents
    *   Create basic agent discovery mechanism

2.  **Task 2 (AC1, AC2):** Implement user context creation and propagation
    *   Create UserContext data model
    *   Implement context creation from user data
    *   Build context propagation service

3.  **Task 3 (AC1, AC5):** Create agent notification service
    *   Implement AgentNotificationService class
    *   Create event publishing for authentication events
    *   Handle agent context message routing

4.  **Task 4 (AC3):** Implement logout event handling
    *   Create logout event notifications
    *   Implement agent context cleanup
    *   Handle session termination events

5.  **Task 5 (AC4):** Implement agent authentication framework
    *   Create agent permission validation
    *   Implement secure agent session management
    *   Build agent-to-agent authentication

6.  **Task 6 (AC6):** Create authentication audit system
    *   Implement audit logging for agent events
    *   Create audit trail for context propagation
    *   Build monitoring for agent communication

7.  **Task 7 (AC7):** Implement error handling and resilience
    *   Add circuit breaker for MCP communication
    *   Implement retry logic for failed notifications
    *   Create fallback mechanisms

8.  **Task 8 (AC8):** Create preference update mechanism
    *   Implement preference change notifications
    *   Create selective agent updates
    *   Handle incremental context updates

9.  **Task 9:** Integrate with existing authentication endpoints
    *   Modify login endpoint to trigger agent notifications
    *   Update logout endpoint for agent cleanup
    *   Integrate with session management

10. **Task 10:** Create agent context management API
    *   Build admin endpoints for context management
    *   Create debugging tools for agent contexts
    *   Implement context synchronization endpoints

11. **Task 11:** Write comprehensive tests
    *   Unit tests for agent notification service
    *   Integration tests with mocked agents
    *   End-to-end authentication flow tests

12. **Task 12:** Create monitoring and alerting
    *   Implement metrics for agent communication
    *   Create alerts for agent notification failures
    *   Build dashboards for agent context health

## 6. Definition of Done (DoD)

*   All Acceptance Criteria (AC1-AC8) met.
*   FastAPI-MCP integration configured and functional.
*   Agent notification service implemented and tested.
*   User context propagation working for all relevant agents.
*   Authentication events triggering appropriate agent notifications.
*   Logout events properly cleaning up agent contexts.
*   Agent permission validation implemented and secure.
*   Error handling and resilience mechanisms in place.
*   Audit logging for all authentication-agent interactions.
*   Unit tests written with >80% coverage for new code.
*   Integration tests with mocked MCP agents.
*   Performance testing for agent notification overhead.
*   No authentication delays due to agent communication.
*   Circuit breaker and fallback mechanisms tested.
*   Monitoring and alerting configured.
*   Documentation updated with agent integration details.
*   Security review completed for agent authentication.

## 7. Notes / Questions

*   **DEPENDENCY:** Requires Stories 1.2 and 1.3 to be completed
*   **PERFORMANCE:** Agent notifications should not block authentication flow
*   **SECURITY:** Ensure agent permissions are properly validated
*   **SCALABILITY:** Design for handling multiple concurrent user authentications
*   **MONITORING:** Need comprehensive monitoring for agent communication health
*   **TESTING:** Will require mocked agents for testing scenarios
*   **FALLBACK:** Authentication must work even if agent system is down

## 8. Design / UI Mockup Links (If Applicable)

*   No direct UI components
*   Agent notification events are backend system integrations
*   Consider admin dashboard for monitoring agent contexts (future story)

## Story Progress Notes

### Agent Model Used: `Claude Sonnet 4 (Architect Agent - Timmy)`

### Architecture Decisions Made:
- FastAPI-MCP integration for agent communication
- Event-driven agent notification system
- Comprehensive user context model for agent personalization
- Secure agent authentication and permission framework
- Circuit breaker pattern for resilience
- Audit trail for all agent authentication events

### Dependencies:
- Story 1.2: Backend authentication infrastructure
- Story 1.3: Frontend AuthContext implementation
- MCP agent ecosystem framework
- Agent registry and discovery system

### Agent Integration Points:
- Technical Analysis Agent: Receives user trading preferences
- Portfolio Optimization Agent: Gets risk profile and constraints
- Risk Management Agent: Receives risk tolerance settings
- News Analysis Agent: Gets sector and company preferences
- User Preference Agent: Manages user-specific configurations

### Completion Notes List

{Implementation progress will be tracked here}

### Change Log

**2024-01-XX - Story Creation (Timmy):**
- Created comprehensive MCP agent integration story
- Defined user context model and agent notification framework
- Specified security and resilience requirements
- Outlined agent authentication and permission system
- Integrated with existing authentication architecture 