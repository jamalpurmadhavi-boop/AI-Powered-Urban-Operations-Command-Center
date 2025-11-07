/*
  # AI Urban Ops Database Schema

  1. New Tables
    - `incidents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text)
      - `severity` (text)
      - `type` (text)
      - `location` (jsonb) - stores lat, lng, address
      - `reported_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)
      - `assigned_to` (text, nullable)
      - `tags` (text[])
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sensors`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `status` (text)
      - `location` (jsonb)
      - `last_reading` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `sensor_readings`
      - `id` (uuid, primary key)
      - `sensor_id` (uuid, foreign key)
      - `value` (numeric)
      - `timestamp` (timestamptz)
      - `metadata` (jsonb, nullable)
    
    - `cctv_cameras`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location` (jsonb)
      - `status` (text)
      - `stream_url` (text)
      - `last_snapshot` (text, nullable)
      - `recording_enabled` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write data
*/

CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  severity text NOT NULL DEFAULT 'medium',
  type text NOT NULL,
  location jsonb NOT NULL,
  reported_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  assigned_to text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'online',
  location jsonb NOT NULL,
  last_reading jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS cctv_cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location jsonb NOT NULL,
  status text NOT NULL DEFAULT 'online',
  stream_url text NOT NULL,
  last_snapshot text,
  recording_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_reported_at ON incidents(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensors_type ON sensors(type);
CREATE INDEX IF NOT EXISTS idx_sensors_status ON sensors(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_cctv_cameras_status ON cctv_cameras(status);

ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cctv_cameras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view incidents"
  ON incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create incidents"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update incidents"
  ON incidents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view sensors"
  ON sensors FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sensors"
  ON sensors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sensors"
  ON sensors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view sensor readings"
  ON sensor_readings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sensor readings"
  ON sensor_readings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view CCTV cameras"
  ON cctv_cameras FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create CCTV cameras"
  ON cctv_cameras FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update CCTV cameras"
  ON cctv_cameras FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
