-- Migration: Add user approval fields
-- Version: 0.1.0
-- Date: 2025-01-XX

-- Add user status enum type
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN status user_status DEFAULT 'pending' NOT NULL,
ADD COLUMN approved_at TIMESTAMP,
ADD COLUMN approved_by UUID,
ADD COLUMN rejection_reason TEXT;

-- Update existing users to approved status (for backward compatibility)
UPDATE users SET status = 'approved', approved_at = created_at WHERE status = 'pending';

-- Add foreign key constraint for approved_by
ALTER TABLE users 
ADD CONSTRAINT fk_users_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id);

-- Add indexes for performance
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_approved_at ON users(approved_at);

-- Add comments for documentation
COMMENT ON COLUMN users.status IS 'User approval status: pending, approved, rejected, suspended';
COMMENT ON COLUMN users.approved_at IS 'Timestamp when user was approved by admin';
COMMENT ON COLUMN users.approved_by IS 'ID of admin who approved/rejected the user';
COMMENT ON COLUMN users.rejection_reason IS 'Reason provided when user registration is rejected'; 