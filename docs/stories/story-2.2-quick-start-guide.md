# Widget System Quick Start Guide

## Getting Started

This guide will help you quickly get up and running with the StockPulse Widget System.

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+ and pip
- Docker and Docker Compose
- Git

## Installation

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd StockPulse

# Install frontend dependencies
npm install

# Install backend dependencies
cd services/backend
pip install -r requirements.txt
cd ../..
```

### 2. Start Development Environment

```bash
# Start all services with Docker Compose
docker-compose -f docker-compose.dev.yml up -d

# Start frontend development server
npm run dev

# Start backend development server (in another terminal)
cd services/backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Initialize Widget System

```bash
# Register all widgets (run once)
npm run widgets:register

# Verify widget registration
npm run widgets:list
```

## Basic Usage

### Adding the Widget System to Your Dashboard

```typescript
// src/pages/dashboard.tsx
import React from 'react';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';
import { useGridLayout } from '@/hooks/useGridLayout';

const Dashboard: React.FC = () => {
  const {
    layout,
    widgets,
    isEditMode,
    toggleEditMode,
    addWidget,
    removeWidget,
    saveLayout
  } = useGridLayout();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={toggleEditMode}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isEditMode ? 'Exit Edit' : 'Edit Dashboard'}
        </button>
      </div>

      <DashboardGrid
        layout={layout}
        widgets={widgets}
        isEditMode={isEditMode}
        onLayoutChange={saveLayout}
        onAddWidget={addWidget}
        onRemoveWidget={removeWidget}
      />
    </div>
  );
};

export default Dashboard;
```

### Creating a Simple Widget

```typescript
// src/components/widgets/SimpleWidget.tsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { WidgetProps } from '@/types/dashboard';

const SimpleWidget: React.FC<WidgetProps> = ({
  config,
  data,
  isLoading,
  error,
  className
}) => {
  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-4 text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <h3 className="font-semibold">{config.title}</h3>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          <div>
            <p>Data: {JSON.stringify(data)}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleWidget;
```

### Registering Your Widget

```typescript
// Add to src/services/widget-registration.ts
import SimpleWidget from "../components/widgets/SimpleWidget";

const WIDGET_DEFINITIONS = [
  // ... existing widgets
  {
    type: "simple-widget",
    metadata: {
      type: "simple-widget",
      config: {
        id: "simple-widget",
        type: "simple-widget",
        title: "Simple Widget",
        description: "A simple example widget",
        icon: "Square",
        category: "portfolio",
        isEnabled: true,
      },
      libraryItem: {
        type: "simple-widget",
        title: "Simple Widget",
        description: "A simple widget for demonstration",
        category: "portfolio",
        icon: Square,
        isAvailable: true,
        isPremium: false,
        tags: ["simple", "example"],
      },
      component: SimpleWidget,
      previewComponent: SimpleWidget,
      permissions: ["portfolio.read"],
      dataRequirements: ["simple_data"],
    },
    factory: {
      create: (config) => SimpleWidget,
      validate: () => true,
      getDefaultConfig: () => ({ refreshInterval: 30000 }),
    },
  },
];
```

## Common Tasks

### 1. Fetching Widget Data

```typescript
// Using the widget data service
import { widgetDataService } from "@/services/widget-data-service";

const MyWidget: React.FC<WidgetProps> = ({ config }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = widgetDataService.subscribe(
      config.type,
      (newData) => {
        setData(newData);
        setLoading(false);
      },
      (error) => {
        console.error("Widget data error:", error);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [config.type]);

  // ... render logic
};
```

### 2. Adding Edit Mode Controls

```typescript
const EditableWidget: React.FC<WidgetProps> = ({
  config,
  isEditMode,
  onRemove,
  onConfigure
}) => {
  return (
    <Card className="relative">
      {isEditMode && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={onConfigure}
            className="p-1 bg-blue-500 text-white rounded"
          >
            ⚙️
          </button>
          <button
            onClick={onRemove}
            className="p-1 bg-red-500 text-white rounded"
          >
            ❌
          </button>
        </div>
      )}
      {/* Widget content */}
    </Card>
  );
};
```

### 3. Implementing Real-time Updates

```typescript
// Backend endpoint for real-time data
// services/backend/app/api/v1/widgets.py

@router.get("/data/my-widget")
async def get_my_widget_data(current_user: CurrentUser = Depends(get_current_user)):
    return {
        "value": random.randint(100, 1000),
        "timestamp": datetime.utcnow().isoformat(),
        "trend": random.choice(["up", "down", "stable"])
    }
```

## Testing Your Widgets

### Unit Tests

```typescript
// tests/story-2.2/unit/test-simple-widget.test.tsx
import { render, screen } from '@testing-library/react';
import SimpleWidget from '@/components/widgets/SimpleWidget';

describe('SimpleWidget', () => {
  it('renders widget title', () => {
    const config = {
      id: 'test',
      type: 'simple-widget',
      title: 'Test Widget',
      category: 'portfolio',
      isEnabled: true
    };

    render(<SimpleWidget config={config} />);

    expect(screen.getByText('Test Widget')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    const config = { /* ... */ };

    render(<SimpleWidget config={config} isLoading={true} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// tests/story-2.2/integration/test-widget-integration.test.ts
import { TestClient } from "fastapi.testclient";
import { app } from "services/backend/app/main";

describe("Widget API Integration", () => {
  const client = new TestClient(app);

  it("fetches widget data", async () => {
    const response = await client.get("/widgets/data/simple-widget");

    expect(response.status_code).toBe(200);
    expect(response.json()).toHaveProperty("widget_type", "simple-widget");
    expect(response.json()).toHaveProperty("data");
  });
});
```

## Debugging

### Enable Debug Mode

```bash
# Frontend debugging
VITE_DEBUG_WIDGETS=true npm run dev

# Backend debugging
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

### Common Debug Commands

```typescript
// Check widget registry
console.log(widgetRegistry.getAll());

// Check widget data service status
console.log(widgetDataService.getConnectionStatus());

// Force refresh widget data
widgetDataService.refreshWidget("widget-id");

// Clear widget cache
widgetDataService.clearCache();
```

## Performance Tips

1. **Use React.memo for expensive widgets**

   ```typescript
   export default React.memo(MyWidget);
   ```

2. **Optimize data fetching intervals**

   ```typescript
   // Longer intervals for less critical data
   const config = { refreshInterval: 60000 }; // 1 minute
   ```

3. **Implement proper loading states**

   ```typescript
   if (isLoading) return <WidgetSkeleton />;
   ```

4. **Use bulk data fetching when possible**
   ```typescript
   // Fetch multiple widgets at once
   const data = await widgetDataService.getBulkData([
     "portfolio-overview",
     "market-summary",
   ]);
   ```

## Next Steps

1. **Read the full documentation**: [Widget System Documentation](./story-2.2-widget-system-documentation.md)
2. **Explore existing widgets**: Check `src/components/widgets/` for examples
3. **Review the API**: See `services/backend/app/api/v1/widgets.py`
4. **Run the test suite**: `npm run test`
5. **Join the development chat**: Contact the team for support

## Troubleshooting

### Widget Not Appearing

- Check if widget is registered: `widgetRegistry.has('your-widget-type')`
- Verify permissions: `widgetRegistry.checkPermissions('your-widget-type', userPermissions)`
- Check console for errors

### Data Not Loading

- Verify API endpoint is running
- Check network tab in browser dev tools
- Ensure authentication is working

### Layout Issues

- Check React Grid Layout props
- Verify responsive breakpoints
- Test on different screen sizes

## Support

- **Documentation**: `/docs/stories/`
- **Issues**: Submit to project repository
- **Team Chat**: Contact development team
- **API Reference**: `/docs/api/`

---

Happy coding! 🚀
