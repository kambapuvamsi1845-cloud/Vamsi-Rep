-- AgriCycle AI PostgreSQL foundation.
-- Safe to re-run against the development database: all objects are created
-- idempotently and this script does not drop or rewrite existing data.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('FARMER', 'CONSUMER', 'ADMIN')),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    total_area_acres DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    size_acres DECIMAL(10, 2) NOT NULL CHECK (size_acres > 0),
    soil_type VARCHAR(100),
    irrigation_method VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    planted_date DATE NOT NULL,
    expected_harvest_date DATE,
    actual_harvest_date DATE,
    growth_stage VARCHAR(50) NOT NULL DEFAULT 'SEEDLING',
    status VARCHAR(50) NOT NULL DEFAULT 'GROWING'
        CHECK (status IN ('PLANNED', 'GROWING', 'HARVESTED', 'FAILED')),
    water_used_liters DECIMAL(12, 2) NOT NULL DEFAULT 0,
    estimated_optimal_water_liters DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field_id UUID NOT NULL REFERENCES fields(id) ON DELETE CASCADE,
    soil_moisture DECIMAL(5, 2),
    temperature DECIMAL(5, 2),
    humidity DECIMAL(5, 2),
    rain_probability DECIMAL(5, 2),
    reading_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE SET NULL,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg >= 0),
    price_per_kg DECIMAL(10, 2) NOT NULL CHECK (price_per_kg >= 0),
    harvest_date DATE NOT NULL,
    freshness_score INTEGER CHECK (freshness_score >= 0 AND freshness_score <= 100),
    estimated_days_remaining INTEGER CHECK (estimated_days_remaining >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (status IN ('AVAILABLE', 'SOLD_OUT', 'SPOILED', 'DISCOUNTED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PAID', 'DELIVERED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity_kg DECIMAL(10, 2) NOT NULL CHECK (quantity_kg > 0),
    price_at_time DECIMAL(10, 2) NOT NULL CHECK (price_at_time >= 0)
);

CREATE TABLE IF NOT EXISTS surplus_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    alert_message TEXT NOT NULL,
    recommended_discount_percent INTEGER
        CHECK (recommended_discount_percent BETWEEN 0 AND 100),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'RESOLVED', 'IGNORED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS farms_farmer_id_idx ON farms (farmer_id);
CREATE INDEX IF NOT EXISTS fields_farm_id_idx ON fields (farm_id);
CREATE INDEX IF NOT EXISTS crop_cycles_field_status_idx ON crop_cycles (field_id, status);
CREATE INDEX IF NOT EXISTS sensor_readings_field_time_idx ON sensor_readings (field_id, reading_time DESC);
CREATE INDEX IF NOT EXISTS products_status_freshness_idx ON products (status, freshness_score DESC);
CREATE INDEX IF NOT EXISTS products_farmer_id_idx ON products (farmer_id);
CREATE INDEX IF NOT EXISTS orders_consumer_created_idx ON orders (consumer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON order_items (order_id);
CREATE INDEX IF NOT EXISTS surplus_alerts_product_status_idx ON surplus_alerts (product_id, status);
