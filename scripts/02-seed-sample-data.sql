-- Sample data for Real Time Vehicle Tracking System
-- This script populates the database with sample data for testing

-- Insert sample cities
INSERT INTO cities (name, state, latitude, longitude) VALUES
('Pune', 'Maharashtra', 18.5204, 73.8567),
('Nashik', 'Maharashtra', 19.9975, 73.7898),
('Aurangabad', 'Maharashtra', 19.8762, 75.3433),
('Nagpur', 'Maharashtra', 21.1458, 79.0882);

-- Insert sample admin user
INSERT INTO users (email, password_hash, full_name, role) VALUES
('admin@vehicletracking.com', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu', 'System Administrator', 'admin'),
('operator@vehicletracking.com', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu', 'Fleet Operator', 'operator'),
('user@example.com', '$2b$10$rQZ9QmZ9QmZ9QmZ9QmZ9Qu', 'Test User', 'user');

-- Insert sample bus stops for Pune
INSERT INTO stops (city_id, stop_name, stop_code, latitude, longitude, address, amenities, is_accessible) VALUES
(1, 'Pune Railway Station', 'PUN001', 18.5285, 73.8742, 'Railway Station Road, Pune', '["shelter", "seating", "lighting"]', true),
(1, 'Shivajinagar', 'PUN002', 18.5309, 73.8475, 'Shivajinagar, Pune', '["shelter", "seating"]', true),
(1, 'Deccan Gymkhana', 'PUN003', 18.5158, 73.8449, 'Deccan Gymkhana, Pune', '["shelter"]', false),
(1, 'Fergusson College', 'PUN004', 18.5089, 73.8343, 'Fergusson College Road, Pune', '["shelter", "seating", "lighting"]', true),
(1, 'Swargate', 'PUN005', 18.5018, 73.8636, 'Swargate, Pune', '["shelter", "seating", "lighting", "restroom"]', true),
(1, 'Katraj', 'PUN006', 18.4486, 73.8594, 'Katraj, Pune', '["shelter", "seating"]', false),
(1, 'Hadapsar', 'PUN007', 18.5089, 73.9260, 'Hadapsar, Pune', '["shelter", "lighting"]', true),
(1, 'Kothrud', 'PUN008', 18.5074, 73.8077, 'Kothrud, Pune', '["shelter", "seating", "lighting"]', true);

-- Insert sample routes
INSERT INTO routes (city_id, route_number, route_name, description, distance_km, estimated_duration_minutes, fare) VALUES
(1, '1A', 'Railway Station to Katraj', 'Main route connecting Railway Station to Katraj via city center', 15.2, 45, 25.00),
(1, '2B', 'Shivajinagar to Hadapsar', 'Route connecting Shivajinagar to IT hub Hadapsar', 18.7, 55, 30.00),
(1, '3C', 'Deccan to Kothrud', 'Short route connecting Deccan area to Kothrud', 8.5, 25, 15.00);

-- Insert route stops (defining the sequence)
-- Route 1A: Railway Station to Katraj
INSERT INTO route_stops (route_id, stop_id, sequence_number, distance_from_start_km, estimated_travel_time_minutes) VALUES
(1, 1, 1, 0.0, 0),    -- Pune Railway Station
(1, 2, 2, 2.1, 8),    -- Shivajinagar
(1, 3, 3, 4.5, 15),   -- Deccan Gymkhana
(1, 4, 4, 6.2, 22),   -- Fergusson College
(1, 5, 5, 9.8, 32),   -- Swargate
(1, 6, 6, 15.2, 45);  -- Katraj

-- Route 2B: Shivajinagar to Hadapsar
INSERT INTO route_stops (route_id, stop_id, sequence_number, distance_from_start_km, estimated_travel_time_minutes) VALUES
(2, 2, 1, 0.0, 0),    -- Shivajinagar
(2, 3, 2, 2.4, 10),   -- Deccan Gymkhana
(2, 5, 3, 8.1, 28),   -- Swargate
(2, 7, 4, 18.7, 55);  -- Hadapsar

-- Route 3C: Deccan to Kothrud
INSERT INTO route_stops (route_id, stop_id, sequence_number, distance_from_start_km, estimated_travel_time_minutes) VALUES
(3, 3, 1, 0.0, 0),    -- Deccan Gymkhana
(3, 4, 2, 2.1, 8),    -- Fergusson College
(3, 8, 3, 8.5, 25);   -- Kothrud

-- Insert sample vehicles
INSERT INTO vehicles (city_id, vehicle_number, capacity, model, year_manufactured, is_accessible, has_ac, status) VALUES
(1, 'MH-12-AB-1234', 45, 'Tata Starbus', 2020, true, true, 'active'),
(1, 'MH-12-CD-5678', 50, 'Ashok Leyland Viking', 2019, false, false, 'active'),
(1, 'MH-12-EF-9012', 40, 'Force Traveller', 2021, true, true, 'active'),
(1, 'MH-12-GH-3456', 45, 'Tata Starbus', 2018, false, true, 'maintenance');

-- Insert vehicle assignments
INSERT INTO vehicle_assignments (vehicle_id, route_id, driver_name, driver_phone, shift_start_time, shift_end_time) VALUES
(1, 1, 'Rajesh Kumar', '+91-9876543210', '06:00:00', '14:00:00'),
(2, 2, 'Suresh Patil', '+91-9876543211', '14:00:00', '22:00:00'),
(3, 3, 'Mahesh Singh', '+91-9876543212', '06:00:00', '14:00:00');

-- Insert sample route schedules
INSERT INTO route_schedules (route_id, vehicle_id, departure_time, arrival_time, frequency_minutes) VALUES
(1, 1, '06:00:00', '06:45:00', 30),
(1, 1, '06:30:00', '07:15:00', 30),
(2, 2, '14:00:00', '14:55:00', 45),
(3, 3, '06:00:00', '06:25:00', 20);

-- Insert sample vehicle locations (current positions)
INSERT INTO vehicle_locations (vehicle_id, latitude, longitude, speed_kmh, heading) VALUES
(1, 18.5285, 73.8742, 25.5, 180),  -- Near Railway Station
(2, 18.5158, 73.8449, 30.2, 90),   -- Near Deccan Gymkhana
(3, 18.5089, 73.8343, 15.8, 270);  -- Near Fergusson College

-- Insert sample ETA predictions
INSERT INTO eta_predictions (vehicle_id, stop_id, predicted_arrival_time, confidence_level, delay_minutes) VALUES
(1, 2, CURRENT_TIMESTAMP + INTERVAL '8 minutes', 0.85, 2),
(1, 3, CURRENT_TIMESTAMP + INTERVAL '18 minutes', 0.78, 3),
(2, 5, CURRENT_TIMESTAMP + INTERVAL '25 minutes', 0.92, -1),
(3, 8, CURRENT_TIMESTAMP + INTERVAL '12 minutes', 0.88, 0);

-- Insert sample service alerts
INSERT INTO service_alerts (city_id, route_id, alert_type, severity, title, message, created_by) VALUES
(1, 1, 'delay', 'medium', 'Route 1A Delayed', 'Route 1A is experiencing 10-minute delays due to heavy traffic on FC Road.', 1),
(1, NULL, 'maintenance', 'low', 'Scheduled Maintenance', 'Bus stop maintenance at Swargate from 2 AM to 5 AM tomorrow.', 1);
