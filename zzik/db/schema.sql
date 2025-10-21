-- ============================================
-- ZZMUK PostgreSQL Schema with PostGIS
-- ============================================
--
-- Purpose: Geographic matching (3km radius) + settlement tracking
-- Extensions: PostGIS for native geo-queries
-- Performance: Spatial indexes for <200ms p95
--
-- ============================================

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- Users Table (Core)
-- ============================================

CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE,
  email_verified TIMESTAMPTZ,
  name TEXT,
  image TEXT,

  -- User metadata
  username TEXT UNIQUE,
  bio TEXT,
  phone TEXT,

  -- ZZMUK: Role and location
  role TEXT DEFAULT 'creator' CHECK (role IN ('creator', 'shop', 'admin')),
  location GEOGRAPHY(POINT, 4326), -- PostGIS geography type (lat/lon)
  address TEXT,

  -- Business metadata
  category TEXT, -- 'beauty', 'food', 'fashion', 'tech'
  verified BOOLEAN DEFAULT FALSE,

  -- Stripe
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  stripe_current_period_end TIMESTAMPTZ,

  -- Stripe Connect (marketplace settlement)
  stripe_connect_account_id TEXT UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT FALSE,

  -- System fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast geographic queries (critical for p95 < 200ms)
CREATE INDEX idx_users_location ON users USING GIST(location);

-- Role and category indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_category ON users(category);
CREATE INDEX idx_users_verified ON users(verified);

-- ============================================
-- Accounts Table (SNS connections)
-- ============================================

CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'oauth', 'email', 'credentials'
  provider TEXT NOT NULL, -- 'facebook', 'instagram', 'tiktok', 'google'
  provider_account_id TEXT NOT NULL,

  -- OAuth tokens
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,

  -- SNS profile data
  profile_picture TEXT,
  profile_username TEXT,
  follower_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(provider, provider_account_id)
);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);

-- ============================================
-- Sessions Table
-- ============================================

CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_token TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);

-- ============================================
-- Match Requests Table
-- ============================================

CREATE TABLE match_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL CHECK (target_role IN ('creator', 'shop')),

  -- Search filters
  max_distance NUMERIC(5,2) DEFAULT 3.0, -- km
  category TEXT,
  min_followers INTEGER,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'expired')),
  results_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_match_requests_user_id ON match_requests(user_id);
CREATE INDEX idx_match_requests_status ON match_requests(status);
CREATE INDEX idx_match_requests_created_at ON match_requests(created_at);

-- ============================================
-- Match Results Table
-- ============================================

CREATE TABLE match_results (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  match_request_id TEXT NOT NULL REFERENCES match_requests(id) ON DELETE CASCADE,
  target_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Matching metrics
  distance NUMERIC(6,2) NOT NULL, -- km
  relevance_score NUMERIC(3,2) NOT NULL, -- 0.00 to 1.00
  match_reason JSONB, -- {categoryMatch: true, verified: true, ...}

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_match_results_request_id ON match_results(match_request_id);
CREATE INDEX idx_match_results_target_user ON match_results(target_user_id);
CREATE INDEX idx_match_results_status ON match_results(status);

-- ============================================
-- Transactions Table
-- ============================================

CREATE TABLE transactions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  match_result_id TEXT UNIQUE REFERENCES match_results(id),

  -- Parties
  buyer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Amounts (KRW in smallest unit: won)
  amount INTEGER NOT NULL, -- Total transaction amount
  platform_fee INTEGER NOT NULL, -- Platform commission
  seller_amount INTEGER NOT NULL, -- Amount to seller

  -- Payment info
  payment_method TEXT NOT NULL, -- 'stripe', 'card', 'bank_transfer'
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT UNIQUE,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),

  -- Metadata
  description TEXT,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================
-- Settlements Table (T+0 instant settlement)
-- ============================================

CREATE TABLE settlements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  transaction_id TEXT UNIQUE NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Amount (KRW)
  amount INTEGER NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- T+0 tracking
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,

  -- Retry logic
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ
);

CREATE INDEX idx_settlements_receiver_id ON settlements(receiver_id);
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_initiated_at ON settlements(initiated_at);

-- ============================================
-- Payouts Table (Stripe Connect payouts)
-- ============================================

CREATE TABLE payouts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  settlement_id TEXT UNIQUE NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,

  -- Stripe Connect info
  stripe_payout_id TEXT UNIQUE,
  stripe_transfer_id TEXT UNIQUE,

  -- Amount (KRW)
  amount INTEGER NOT NULL,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'paid', 'failed', 'canceled')),

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expected_arrival TIMESTAMPTZ,
  arrived_at TIMESTAMPTZ,

  -- Failure handling
  failure_code TEXT,
  failure_message TEXT
);

CREATE INDEX idx_payouts_status ON payouts(status);
CREATE INDEX idx_payouts_created_at ON payouts(created_at);

-- ============================================
-- User Activities Table (Audit log)
-- ============================================

CREATE TABLE user_activities (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'login', 'logout', 'match_request', 'transaction', etc.
  provider TEXT, -- SNS provider if applicable
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- ============================================
-- Helper Functions
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Sample Data for Testing
-- ============================================

-- Insert test users with locations (Seoul area)
INSERT INTO users (id, email, name, role, location, category, verified) VALUES
  ('test-creator-1', 'creator1@test.com', 'Test Creator 1', 'creator', ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography, 'beauty', true),
  ('test-creator-2', 'creator2@test.com', 'Test Creator 2', 'creator', ST_SetSRID(ST_MakePoint(126.9850, 37.5651), 4326)::geography, 'fashion', false),
  ('test-shop-1', 'shop1@test.com', 'Test Shop 1', 'shop', ST_SetSRID(ST_MakePoint(126.9800, 37.5660), 4326)::geography, 'beauty', true),
  ('test-shop-2', 'shop2@test.com', 'Test Shop 2', 'shop', ST_SetSRID(ST_MakePoint(127.0000, 37.5700), 4326)::geography, 'food', false);

-- Insert test accounts with follower counts
INSERT INTO accounts (user_id, type, provider, provider_account_id, follower_count) VALUES
  ('test-creator-1', 'oauth', 'instagram', 'ig_123456', 5000),
  ('test-creator-2', 'oauth', 'tiktok', 'tt_789012', 15000),
  ('test-shop-1', 'oauth', 'instagram', 'ig_shop1', 500),
  ('test-shop-2', 'oauth', 'facebook', 'fb_shop2', 1200);

-- ============================================
-- Performance Notes:
-- ============================================
--
-- PostGIS Geography Type:
-- - Automatically handles spherical distance calculations
-- - More accurate than Haversine for short distances
-- - GIST index enables <200ms queries even with millions of rows
--
-- Query Pattern:
-- SELECT * FROM users
-- WHERE role = 'shop'
--   AND ST_DWithin(location, ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography, 3000)
-- ORDER BY ST_Distance(location, ST_SetSRID(ST_MakePoint(126.9780, 37.5665), 4326)::geography)
-- LIMIT 20;
--
-- ST_DWithin uses meters for geography type (3000 = 3km)
-- ============================================
