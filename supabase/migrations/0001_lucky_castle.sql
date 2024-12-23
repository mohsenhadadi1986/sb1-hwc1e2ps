/*
  # Initial Schema Setup for Currency Exchange Platform

  1. New Tables
    - `exchange_requests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text, 'buy' or 'sell')
      - `amount` (decimal)
      - `status` (text)
      - `matched_with` (uuid, references exchange_requests)
      - `created_at` (timestamp)
      - `matched_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to:
      - Create their own requests
      - Read their own requests
      - Read matched requests
      - Update their own requests
*/

CREATE TABLE exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type text NOT NULL CHECK (type IN ('buy', 'sell')),
  amount decimal NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'completed', 'cancelled')),
  matched_with uuid REFERENCES exchange_requests(id),
  created_at timestamptz DEFAULT now(),
  matched_at timestamptz
);

ALTER TABLE exchange_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own requests
CREATE POLICY "Users can create their own requests"
  ON exchange_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to read their own requests and matched requests
CREATE POLICY "Users can read their own and matched requests"
  ON exchange_requests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    id = ANY(
      SELECT matched_with 
      FROM exchange_requests 
      WHERE user_id = auth.uid()
    )
  );

-- Allow users to update their own requests
CREATE POLICY "Users can update their own requests"
  ON exchange_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);