-- Create test user for login
INSERT INTO users (
    id, 
    email, 
    password_hash, 
    role, 
    status, 
    is_active, 
    first_name, 
    last_name, 
    subscription_tier,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'admin@sp.com',
    '$2b$12$LQv3c1yqBwWFcDDEARBjMOhSNj0NKL.Dyz8SvkQWQ8GKiCpIRvJJa', -- password123
    'ADMIN',
    'APPROVED', 
    true,
    'Admin',
    'User',
    'PREMIUM',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW(); 