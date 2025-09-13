-- Triggers and functions for automatic push notifications
-- This script sets up database triggers to automatically send notifications

-- Function to send ETA notifications when predictions are updated
CREATE OR REPLACE FUNCTION notify_eta_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify if ETA is within 10 minutes and confidence is high
    IF NEW.predicted_arrival_time <= NOW() + INTERVAL '10 minutes' 
       AND NEW.confidence_level >= 0.8 THEN
        
        -- This would typically call a background job or webhook
        -- For now, we'll just log it
        INSERT INTO notification_log (type, message, data, created_at)
        VALUES (
            'eta_notification',
            'ETA notification triggered',
            json_build_object(
                'vehicle_id', NEW.vehicle_id,
                'stop_id', NEW.stop_id,
                'eta_minutes', EXTRACT(EPOCH FROM (NEW.predicted_arrival_time - NOW()))/60
            ),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send service alert notifications
CREATE OR REPLACE FUNCTION notify_service_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only notify for new active alerts
    IF NEW.is_active = true AND (TG_OP = 'INSERT' OR OLD.is_active = false) THEN
        
        INSERT INTO notification_log (type, message, data, created_at)
        VALUES (
            'service_alert_notification',
            'Service alert notification triggered',
            json_build_object(
                'alert_id', NEW.id,
                'alert_type', NEW.alert_type,
                'severity', NEW.severity,
                'city_id', NEW.city_id,
                'route_id', NEW.route_id
            ),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification log table
CREATE TABLE IF NOT EXISTS notification_log (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create triggers
DROP TRIGGER IF EXISTS eta_prediction_notify ON eta_predictions;
CREATE TRIGGER eta_prediction_notify
    AFTER INSERT OR UPDATE ON eta_predictions
    FOR EACH ROW
    EXECUTE FUNCTION notify_eta_update();

DROP TRIGGER IF EXISTS service_alert_notify ON service_alerts;
CREATE TRIGGER service_alert_notify
    AFTER INSERT OR UPDATE ON service_alerts
    FOR EACH ROW
    EXECUTE FUNCTION notify_service_alert();

-- Create index for notification log processing
CREATE INDEX IF NOT EXISTS idx_notification_log_unprocessed ON notification_log(processed, created_at) WHERE processed = false;
