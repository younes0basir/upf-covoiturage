-- Add email verification columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_expiry TIMESTAMP WITH TIME ZONE;
