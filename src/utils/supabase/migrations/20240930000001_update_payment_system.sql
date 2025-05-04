-- Update payment system structures to ensure alignment with code implementation

-- Ensure payments table has all required fields
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);

-- Ensure coach_sessions table has price column with default value
ALTER TABLE coach_sessions ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 150.00;

-- Create or replace function to handle expired reservations
CREATE OR REPLACE FUNCTION handle_expired_reservations() RETURNS TRIGGER AS $$
BEGIN
  -- Update payment status to expired
  UPDATE payments 
  SET status = 'expired', 
      updated_at = NOW()
  WHERE id = OLD.id AND status = 'pending' AND expires_at < NOW();
  
  -- Release the session reservation
  UPDATE coach_sessions
  SET status = 'available',
      user_id = NULL,
      reserved_at = NULL,
      reservation_expires_at = NULL
  WHERE id = OLD.session_id AND status = 'reserved';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for handling expired reservations
DROP TRIGGER IF EXISTS check_payment_expiration ON payments;
CREATE TRIGGER check_payment_expiration
AFTER UPDATE ON payments
FOR EACH ROW
WHEN (NEW.status = 'pending' AND NEW.expires_at < NOW())
EXECUTE FUNCTION handle_expired_reservations();

-- Add RLS policies for the payment tables
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policies for bookings table
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

CREATE POLICY "Coaches can view their session bookings"
ON bookings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM coach_sessions
    JOIN auth.users ON auth.users.id = auth.uid()
    WHERE coach_sessions.id = bookings.session_id
    AND coach_sessions.coach_id = auth.uid()
    AND auth.users.role = 'coach'
  )
); 