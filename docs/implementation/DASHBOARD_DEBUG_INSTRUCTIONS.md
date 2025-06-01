# Dashboard Debug Instructions - StockPulse v2.0.0

## Current Status

We've implemented the dashboard API endpoint and updated the backend configuration to match frontend expectations. However, the dashboard is still showing as empty. Let's debug this step by step.

## What We've Fixed So Far

### ✅ Backend API Endpoint

- **Fixed**: Dashboard endpoint now available at `/api/v1/dashboards/default-dashboard`
- **Fixed**: Backend configuration matches frontend type expectations
- **Fixed**: Added all required breakpoints (lg, md, sm, xs, xxs, xl)
- **Fixed**: Added `version` field and proper structure

### ✅ Frontend Configuration

- **Fixed**: Environment variable issues (`process.env` → `import.meta.env`)
- **Fixed**: TypeScript compilation errors
- **Fixed**: CSS design tokens

## Debug Steps to Follow

### Step 1: Check Browser Console

**Open your browser's Developer Tools (F12) and look for:**

1. **Network Tab**: Check if the API call to `/api/v1/dashboards/default-dashboard` is successful

   - Should return status 200
   - Response should contain dashboard configuration

2. **Console Tab**: Look for these specific log messages:

   ```
   [DashboardService] Initializing dashboard...
   [DashboardService] User default dashboard ID: default-dashboard
   [DashboardService] Fetching dashboard config for ID: default-dashboard
   [DashboardService] API Response: {success: true, data: {...}}
   [DashboardService] Successfully fetched dashboard config: {...}
   [DashboardService] Successfully loaded dashboard from API
   ```

3. **Look for Errors**: Any red error messages, especially:
   - Widget component import errors
   - React Grid Layout errors
   - Authentication errors

### Step 2: Check Debug Information

**On the dashboard page, you should now see a debug section showing:**

- Dashboard ID: default-dashboard
- Dashboard Name: My Dashboard
- Current Breakpoint: lg (or md/sm depending on screen size)
- Widgets in current layout: 4
- Layout exists: Yes
- List of 4 widgets (portfolio-overview-1, market-summary-1, watchlist-1, news-feed-1)

### Step 3: Verify Authentication

**Check that you're properly authenticated:**

- Look for "Authentication status verified: admin@sp.com" in console
- Verify the auth endpoints are working

## Possible Issues and Solutions

### Issue 1: API Call Failing

**Symptoms**: Network error in console, 404 or 401 response
**Solution**:

- Check if backend server is running on port 8000
- Verify authentication cookies are being sent
- Check CORS configuration

### Issue 2: Widget Components Not Loading

**Symptoms**: "Loading widget..." or component errors
**Solution**:

- Check if all widget components exist in `src/components/widgets/`
- Look for React Suspense or lazy loading errors

### Issue 3: React Grid Layout Issues

**Symptoms**: Layout not rendering, grid errors
**Solution**:

- Check if `react-grid-layout` is properly installed
- Verify layout configuration format

### Issue 4: Type Mismatch

**Symptoms**: Dashboard loads but widgets don't appear
**Solution**:

- Check if backend response matches frontend types
- Verify widget configuration structure

## Manual Testing Commands

### Test Backend Endpoint (PowerShell)

```powershell
# Test if endpoint is accessible (will show auth error but confirms endpoint exists)
Invoke-WebRequest -Uri "http://localhost:8000/api/v1/dashboards/default-dashboard" -Method GET
```

### Check Running Services

```powershell
# Check if frontend is running
netstat -ano | findstr :3000

# Check if backend is running
netstat -ano | findstr :8000
```

## Expected Behavior

### What Should Happen:

1. **Page Load**: Dashboard page loads with "My Dashboard" title
2. **API Call**: Successful fetch of dashboard configuration
3. **Debug Info**: Shows 4 widgets in current layout
4. **Widget Rendering**: 4 widgets appear in grid layout:
   - Portfolio Overview (top-left)
   - Market Summary (top-right)
   - Watchlist (bottom-left)
   - News Feed (bottom-right)

### What You Should See:

```
Debug Info:
Dashboard ID: default-dashboard
Dashboard Name: My Dashboard
Current Breakpoint: lg
Widgets in current layout: 4
Layout exists: Yes
Widget: portfolio-overview-1 (portfolio-overview) - Visible: Yes
Widget: market-summary-1 (market-summary) - Visible: Yes
Widget: watchlist-1 (watchlist) - Visible: Yes
Widget: news-feed-1 (news-feed) - Visible: Yes
```

## Next Steps Based on Debug Results

### If Debug Shows 0 Widgets:

- API call is failing or returning wrong data
- Check network tab and console for errors

### If Debug Shows 4 Widgets But No Visual Widgets:

- Widget components have rendering issues
- Check for React errors in console
- Verify widget component imports

### If Debug Section Doesn't Appear:

- Dashboard configuration is not loading at all
- Check for JavaScript errors preventing page load

## Quick Fixes to Try

### 1. Clear Browser Cache

- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Clear localStorage: Open DevTools → Application → Local Storage → Clear

### 2. Restart Services

```powershell
# Stop and restart frontend
# Ctrl+C in terminal running npm run dev, then:
npm run dev

# Backend should auto-reload, but if needed:
# Restart the FastAPI server
```

### 3. Check Widget Component Imports

If widgets aren't rendering, the issue might be in the lazy loading. Check console for import errors.

## Report Back

Please share:

1. **Console logs** (especially the DashboardService messages)
2. **Network tab** results for the dashboard API call
3. **Debug section** content from the dashboard page
4. **Any error messages** in red in the console

This will help identify the exact issue and provide a targeted fix.

---

**Status**: 🔍 **DEBUGGING** - Comprehensive debug tools added
**Next**: Analyze debug output to identify root cause
**Goal**: Get 4 default widgets displaying on dashboard

🚀
