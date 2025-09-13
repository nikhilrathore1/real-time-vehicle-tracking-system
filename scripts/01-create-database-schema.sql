-- Real Time Vehicle Tracking System Database Schema
-- This script creates all necessary tables for the vehicle tracking system

-- Users table for authentication and user management
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'operator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cities table
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    country VARCHAR(255) DEFAULT 'India',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus routes table
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    route_number VARCHAR(50) NOT NULL,
    route_name VARCHAR(255) NOT NULL,
    description TEXT,
    distance_km DECIMAL(8, 2),
    estimated_duration_minutes INTEGER,
    fare DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bus stops table
CREATE TABLE IF NOT EXISTS stops (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    stop_name VARCHAR(255) NOT NULL,
    stop_code VARCHAR(50) UNIQUE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    address TEXT,
    amenities JSONB DEFAULT '[]',
    is_accessible BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route stops junction table (defines the sequence of stops for each route)
CREATE TABLE IF NOT EXISTS route_stops (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    sequence_number INTEGER NOT NULL,
    distance_from_start_km DECIMAL(8, 2),
    estimated_travel_time_minutes INTEGER,
    UNIQUE(route_id, sequence_number),
    UNIQUE(route_id, stop_id)
);

-- Vehicles/Buses table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) DEFAULT 'bus',
    capacity INTEGER DEFAULT 50,
    model VARCHAR(100),
    year_manufactured INTEGER,
    fuel_type VARCHAR(50) DEFAULT 'diesel',
    is_accessible BOOLEAN DEFAULT false,
    has_ac BOOLEAN DEFAULT false,
    has_wifi BOOLEAN DEFAULT false,
    gps_device_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance', 'breakdown')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicle assignments to routes
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    assigned_date DATE DEFAULT CURRENT_DATE,
    shift_start_time TIME,
    shift_end_time TIME,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Real-time vehicle locations
CREATE TABLE IF NOT EXISTS vehicle_locations (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed_kmh DECIMAL(5, 2) DEFAULT 0,
    heading INTEGER DEFAULT 0, -- Direction in degrees (0-359)
    accuracy_meters INTEGER,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Route schedules
CREATE TABLE IF NOT EXISTS route_schedules (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id),
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    frequency_minutes INTEGER DEFAULT 30,
    days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ETA predictions
CREATE TABLE IF NOT EXISTS eta_predictions (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    predicted_arrival_time TIMESTAMP NOT NULL,
    confidence_level DECIMAL(3, 2) DEFAULT 0.8, -- 0.0 to 1.0
    delay_minutes INTEGER DEFAULT 0,
    prediction_algorithm VARCHAR(50) DEFAULT 'ml_model',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service alerts and notifications
CREATE TABLE IF NOT EXISTS service_alerts (
    id SERIAL PRIMARY KEY,
    city_id INTEGER REFERENCES cities(id),
    route_id INTEGER REFERENCES routes(id),
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('delay', 'cancellation', 'diversion', 'maintenance', 'emergency')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User favorites (saved routes/stops)
CREATE TABLE IF NOT EXISTS user_favorites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    stop_id INTEGER REFERENCES stops(id) ON DELETE CASCADE,
    favorite_type VARCHAR(20) CHECK (favorite_type IN ('route', 'stop')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, route_id, stop_id)
);

-- Push notification subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh_key TEXT NOT NULL,
    auth_key TEXT NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, endpoint)
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    route_alerts BOOLEAN DEFAULT true,
    delay_notifications BOOLEAN DEFAULT true,
    arrival_reminders BOOLEAN DEFAULT false,
    service_updates BOOLEAN DEFAULT true,
    marketing_notifications BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_vehicle_timestamp ON vehicle_locations(vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_locations_timestamp ON vehicle_locations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_sequence ON route_stops(route_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_eta_predictions_vehicle_stop ON eta_predictions(vehicle_id, stop_id);
CREATE INDEX IF NOT EXISTS idx_service_alerts_active ON service_alerts(is_active, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
