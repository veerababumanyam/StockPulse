-- Create test user directly in database
-- This SQL script creates a test user for StockPulse

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    status,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'testuser@stockpulse.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6BAdBN6TK.', -- password: test123
    'Test',
    'User',
    'USER',
    'APPROVED',
    true,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT id, email, first_name, last_name, role, status, is_active, created_at
FROM users
WHERE email = 'testuser@stockpulse.com';
