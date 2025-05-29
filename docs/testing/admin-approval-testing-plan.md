# Admin Approval Workflow - Testing Plan

## 🧪 Pre-Testing Setup

### 1. Database Migration
```bash
# Apply the database migration (if using direct SQL)
psql -d stockpulse -f services/backend/migrations/add_user_approval_fields.sql

# OR if using Alembic migrations, create and run migration
cd services/backend
alembic revision --autogenerate -m "Add user approval fields"
alembic upgrade head
```

### 2. Create Admin User
```bash
# Run the admin creation script
cd StockPulse
python scripts/create_admin_user.py
```

Expected output:
```
🚀 StockPulse Admin User Creation Script
==================================================
🔧 Creating admin user: admin@stockpulse.com
✅ Admin user created successfully!
📧 Email: admin@stockpulse.com
🔑 Password: AdminPass123!
🛡️ Role: admin
✅ Status: approved
🆔 ID: [some-uuid]
```

### 3. Start Services
```bash
# Terminal 1: Start Backend
cd services/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Start Frontend  
cd StockPulse
npm start
```

## 🧪 Test Cases

### Test Case 1: User Registration (Creates Pending User)

**Steps:**
1. Navigate to `http://localhost:3000/auth/register`
2. Fill out registration form:
   - Name: `Test User`
   - Email: `testuser@example.com`
   - Password: `TestPass123!`
   - Confirm Password: `TestPass123!`
3. Complete all 3 steps
4. Submit registration

**Expected Results:**
- ✅ Registration shows "Step 4: Registration Submitted"
- ✅ Message: "Your account is pending admin approval"
- ✅ No automatic login/redirect to dashboard
- ✅ Shows links to login page and home

**Backend Verification:**
```bash
# Check user was created with pending status
curl -X GET "http://localhost:8000/auth/admin/pending-users" \
  -H "Authorization: Bearer [admin-token]"
```

### Test Case 2: Pending User Cannot Login

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Try to login with pending user:
   - Email: `testuser@example.com`
   - Password: `TestPass123!`

**Expected Results:**
- ❌ Login fails with specific error message
- ❌ Error: "Your account is pending admin approval. Please wait for approval before logging in."
- ❌ No session created

### Test Case 3: Admin Login and Access Dashboard

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Login as admin:
   - Email: `admin@stockpulse.com`
   - Password: `AdminPass123!`

**Expected Results:**
- ✅ Admin login successful
- ✅ Redirected to dashboard
- ✅ Can access `/admin/user-approval` page

**Steps for Admin Dashboard:**
1. Navigate to `http://localhost:3000/admin/user-approval`
2. Verify pending user appears in list

**Expected Results:**
- ✅ Shows "Test User" with email `testuser@example.com`
- ✅ Status shows "pending"
- ✅ Approve/Reject buttons available
- ✅ Search functionality works

### Test Case 4: Admin Approves User

**Steps:**
1. In admin dashboard, find the pending user
2. Click "Approve" button

**Expected Results:**
- ✅ User disappears from pending list
- ✅ Success message or console log
- ✅ No errors in browser console

**Backend Verification:**
```bash
# Check user status changed to approved
curl -X GET "http://localhost:8000/auth/me" \
  -H "Cookie: access_token=Bearer [user-token]"
```

### Test Case 5: Approved User Can Login

**Steps:**
1. Navigate to `http://localhost:3000/auth/login`
2. Login with approved user:
   - Email: `testuser@example.com`
   - Password: `TestPass123!`

**Expected Results:**
- ✅ Login successful
- ✅ User redirected to dashboard
- ✅ Can access protected routes

### Test Case 6: Admin Rejects User

**Steps:**
1. Register another test user: `rejected@example.com`
2. Login as admin and go to user approval page
3. Click "Reject" for the new user
4. Provide rejection reason: "Test rejection"

**Expected Results:**
- ✅ User disappears from pending list
- ✅ Rejection reason recorded

### Test Case 7: Rejected User Cannot Login

**Steps:**
1. Try to login with rejected user:
   - Email: `rejected@example.com`
   - Password: `TestPass123!`

**Expected Results:**
- ❌ Login fails
- ❌ Error: "Your account registration was rejected. Please contact support for more information."

## 🔍 Security Testing

### Test Case 8: Non-Admin Cannot Access Admin Endpoints

**Steps:**
1. Login as regular approved user
2. Try to access `http://localhost:3000/admin/user-approval`

**Expected Results:**
- ❌ Access denied or 403 error
- ❌ Cannot see admin interface

### Test Case 9: Rate Limiting Works

**Steps:**
1. Try to register 4+ users rapidly from same IP

**Expected Results:**
- ❌ After 3 attempts, rate limit kicks in
- ❌ Error: "IP address temporarily blocked"

### Test Case 10: Registration Validation

**Steps:**
1. Try to register with:
   - Weak password: `weak`
   - Mismatched passwords
   - Invalid email format
   - Duplicate email

**Expected Results:**
- ❌ Appropriate validation errors for each case
- ❌ No user created in database

## 🐛 Error Scenarios

### Test Case 11: Backend Down During Registration

**Steps:**
1. Stop backend server
2. Try to register new user

**Expected Results:**
- ❌ Appropriate error message
- ❌ No infinite loading states

### Test Case 12: Database Connection Issues

**Steps:**
1. Simulate database connection failure
2. Try admin approval actions

**Expected Results:**
- ❌ Graceful error handling
- ❌ Clear error messages to admin

## 📊 Verification Checklist

### Database Checks
```sql
-- Check user table structure
\d users;

-- Check pending users
SELECT id, email, status, created_at FROM users WHERE status = 'pending';

-- Check approved users  
SELECT id, email, status, approved_at, approved_by FROM users WHERE status = 'approved';

-- Check rejected users
SELECT id, email, status, rejection_reason FROM users WHERE status = 'rejected';
```

### API Endpoint Tests
```bash
# Test registration endpoint
curl -X POST "http://localhost:8000/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"api-test@example.com","password":"TestPass123!","confirm_password":"TestPass123!","name":"API Test"}'

# Test admin endpoints (need admin token)
curl -X GET "http://localhost:8000/auth/admin/pending-users" \
  -H "Authorization: Bearer [admin-token]"

curl -X POST "http://localhost:8000/auth/admin/approve-user" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [admin-token]" \
  -d '{"user_id":"[user-id]","action":"approve"}'
```

### Frontend Console Checks
- ✅ No JavaScript errors in browser console
- ✅ API calls show correct URLs and responses
- ✅ Authentication state updates properly
- ✅ Loading states work correctly

## 🚨 Critical Issues to Watch For

1. **Registration creates approved users instead of pending**
2. **Pending users can login**
3. **Admin endpoints accessible to non-admins**
4. **Database migration not applied**
5. **CORS issues preventing API calls**
6. **Authentication state not updating**
7. **Infinite loading states**
8. **Missing error handling**

## 📝 Test Results Template

```
## Test Results - [Date]

### Environment
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Database: PostgreSQL

### Test Case Results
- [ ] Test Case 1: User Registration ✅/❌
- [ ] Test Case 2: Pending User Cannot Login ✅/❌
- [ ] Test Case 3: Admin Login ✅/❌
- [ ] Test Case 4: Admin Approves User ✅/❌
- [ ] Test Case 5: Approved User Can Login ✅/❌
- [ ] Test Case 6: Admin Rejects User ✅/❌
- [ ] Test Case 7: Rejected User Cannot Login ✅/❌
- [ ] Test Case 8: Non-Admin Access Denied ✅/❌
- [ ] Test Case 9: Rate Limiting ✅/❌
- [ ] Test Case 10: Registration Validation ✅/❌

### Issues Found
- [List any issues discovered]

### Notes
- [Any additional observations]
```

## 🎯 Success Criteria

The admin approval workflow is working correctly if:

1. ✅ New registrations create pending users (no auto-login)
2. ✅ Pending users cannot login with clear error messages
3. ✅ Admin can access user approval dashboard
4. ✅ Admin can approve/reject users with proper logging
5. ✅ Approved users can login normally
6. ✅ Rejected users cannot login
7. ✅ Non-admins cannot access admin endpoints
8. ✅ All security validations work properly
9. ✅ Error handling is graceful and user-friendly
10. ✅ Database constraints and indexes are working 