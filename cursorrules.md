# StockPulse Cursor Rules Guide

This document explains how to use the Cursor rules created for the StockPulse AI project. These rules help Cursor AI generate better code that follows the project's architecture, patterns, and best practices.

## Available Rules

The following rules have been created for the StockPulse project:

1. **stockpulse-general.mdc**: General architecture principles and code standards
2. **frontend-guidelines.mdc**: Frontend-specific development guidelines
3. **backend-guidelines.mdc**: Backend-specific development guidelines
4. **shared-package-guidelines.mdc**: Guidelines for the shared package
5. **ai-agent-guidelines.mdc**: Implementation guidelines for AI agents
6. **trading-modules.mdc**: Guidelines for trading module implementation
7. **api-development.mdc**: API development guidelines
8. **ai-tech-stack.mdc**: Specific AI technology stack standards to maintain consistency
9. **general-coding-standards.mdc**: Naming conventions, code quality, file structure, and architectural best practices

## How to Use These Rules

### In Cursor Chat

When working with Cursor AI in the chat, you can explicitly reference a rule:

```
@frontend-guidelines Please help me create a stock chart component
```

Or let the AI automatically apply relevant rules based on the files you're working with:

```
Help me implement a technical analysis agent
```

### Adding More Rules

To add new rules:

1. Create a new `.mdc` file in the `.cursor/rules` directory
2. Add appropriate metadata at the top of the file:
   ```
   ---
   description: Brief description of the rule
   globs: ["patterns/to/match/*.ts"]
   alwaysApply: false
   ---
   ```
3. Add the rule content in markdown format

## Rule Structure

Each rule contains:

1. **Metadata Header**: Description, file patterns, and application settings
2. **Guidelines**: Specific guidance for development
3. **Examples**: Code examples demonstrating best practices
4. **References**: Links to related rules or documentation

## Best Practices When Using Rules

1. **Be Specific**: When asking Cursor AI for help, be specific about what you're trying to accomplish
2. **Reference Appropriate Rules**: Explicitly mention relevant rules for complex tasks
3. **Use Global Context**: For project-wide patterns, reference the general rules
4. **Combine Rules**: For complex tasks, you can reference multiple rules

## Examples

### Creating a New Component

```
@frontend-guidelines I need to create a new Dashboard component for displaying stock performance metrics
```

### Adding a New API Endpoint

```
@api-development I need to add a new endpoint for fetching stock correlation data
```

### Implementing an Agent

```
@ai-agent-guidelines Help me implement a sentiment analysis agent for news articles
```

### Using the AI Tech Stack

```
@ai-tech-stack I need to implement RAG for stock information retrieval
```

### Applying General Coding Standards

```
@general-coding-standards Please review my code for adherence to our naming conventions and SOLID principles
```

## Maintenance

To keep these rules up-to-date:

1. Review and update rules as the architecture evolves
2. Add new examples based on successful implementations
3. Refine guidelines based on team feedback and experience
4. Update the AI tech stack rule as new technologies emerge
5. Ensure coding standards reflect the latest industry best practices

Remember that Cursor rules are most effective when they're kept current and aligned with the project's actual practices.