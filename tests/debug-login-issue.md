# 🔧 StockPulse Login Issue Debug Guide

## Issue Summary

Login form at `/auth/login` is not redirecting to dashboard after entering credentials `admin@sp.com / admin@123`.

## ✅ What's Working (Confirmed by Tests)

- Frontend authentication logic ✅
- Form validation and submission ✅
- Error handling and display ✅
- Routing configuration ✅
- AuthContext state management ✅

## 🔍 Debugging Steps

### Step 1: Check Backend Server Status

```bash
# Check if backend is running on port 8000
netstat -tulpn | grep :8000
# or
lsof -i :8000
```

### Step 2: Test API Endpoint Manually

```bash
# Test login endpoint directly
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sp.com","password":"admin@123"}'
```

### Step 3: Check Browser Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try logging in
4. Look for:
   - POST request to `/api/v1/auth/login`
   - Response status (200, 401, 404, 500)
   - Response body content

### Step 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for JavaScript errors
4. Check for CORS errors

## 🚨 Common Issues & Solutions

### Issue 1: Backend Server Not Running

**Symptoms:** Network error, connection refused
**Solution:**

```bash
# Start backend server
cd services/backend
python -m uvicorn app.main:app --reload --port 8000
```

### Issue 2: API Endpoint Not Found (404)

**Symptoms:** 404 Not Found error
**Solution:** Check if the backend has the login endpoint implemented

### Issue 3: CORS Issues

**Symptoms:** CORS policy error in console
**Solution:** Configure CORS in backend to allow frontend origin

### Issue 4: Invalid Credentials (401)

**Symptoms:** 401 Unauthorized error
**Solution:**

- Check if user exists in database
- Verify password hashing/comparison
- Create test user if needed

### Issue 5: Database Connection Issues

**Symptoms:** 500 Internal Server Error
**Solution:** Check database connection and user table

## 🧪 Test Commands

### Run Authentication Tests

```bash
# Run all auth tests
npm test -- tests/auth/

# Run specific debug test
npm test -- tests/auth/debug-auth.test.tsx

# Run Playwright E2E tests (requires server running)
npx playwright test tests/e2e/auth-flow.spec.ts
```

### Manual Testing Script

```bash
# 1. Start frontend
npm run dev

# 2. Start backend (in separate terminal)
cd services/backend
python -m uvicorn app.main:app --reload

# 3. Test login flow
# Navigate to http://localhost:3000/auth/login
# Enter: admin@sp.com / admin@123
# Check if redirects to /dashboard
```

## 📋 Checklist for Resolution

- [ ] Backend server is running on port 8000
- [ ] `/api/v1/auth/login` endpoint exists and responds
- [ ] User `admin@sp.com` exists in database
- [ ] Password `admin@123` is correctly hashed/stored
- [ ] CORS is configured to allow frontend requests
- [ ] No JavaScript errors in browser console
- [ ] Network requests are successful (200 status)

## 🔧 Quick Fix Commands

### Create Test User (if backend supports it)

```bash
# Example SQL to create test user
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@sp.com', '$hashed_password', 'Admin User', 'ADMIN');
```

### Test Backend Health

```bash
curl http://localhost:8000/api/v1/health
```

## 📊 Expected Behavior

1. User enters credentials on `/auth/login`
2. Form submits POST to `/api/v1/auth/login`
3. Backend validates credentials
4. Backend returns user data and sets auth cookie
5. Frontend receives response and redirects to `/dashboard`
6. User sees dashboard page

## 🎯 Next Steps

1. Follow debugging steps above
2. Identify which step is failing
3. Apply appropriate solution
4. Re-test login flow
5. Run E2E tests to confirm fix
