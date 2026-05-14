CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE gender AS ENUM ('MALE', 'FEMALE');
CREATE TYPE passenger_gender_preference AS ENUM ('ANY', 'FEMALE_ONLY');
CREATE TYPE trip_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE reservation_status AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED');
CREATE TYPE report_type AS ENUM ('BEHAVIOUR', 'FAKE_PROFILE', 'SPAM', 'OTHER');
CREATE TYPE report_status AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    student_card_number VARCHAR(50) UNIQUE,
    gender gender NOT NULL,
    role user_role DEFAULT 'STUDENT',
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) NOT NULL,
    bio TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0 CHECK (average_rating >= 0 AND average_rating <= 5),
    total_rides INT DEFAULT 0 CHECK (total_rides >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    color VARCHAR(50),
    plate_number VARCHAR(50) UNIQUE NOT NULL,
    seats INT NOT NULL CHECK (seats > 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    address TEXT,
    formatted_address TEXT,
    city VARCHAR(100) DEFAULT 'Fès',
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    google_place_id VARCHAR(255),
    is_university BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    driver_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,

    departure_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
    destination_location_id UUID NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,

    departure_time TIMESTAMPTZ NOT NULL,
    available_seats INT NOT NULL CHECK (available_seats >= 0),

    driver_price NUMERIC(10,2) DEFAULT 0 CHECK (driver_price >= 0),
    service_fee NUMERIC(10,2) DEFAULT 0 CHECK (service_fee >= 0),
    total_price NUMERIC(10,2) GENERATED ALWAYS AS (driver_price + service_fee) STORED,

    passenger_gender_preference passenger_gender_preference DEFAULT 'ANY',

    distance_km NUMERIC(10,2),
    estimated_duration_minutes INT,
    polyline TEXT,

    status trip_status DEFAULT 'SCHEDULED',
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CHECK (departure_location_id <> destination_location_id)
);

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    seats_reserved INT NOT NULL CHECK (seats_reserved > 0),
    status reservation_status DEFAULT 'PENDING',

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (trip_id, passenger_id)
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    CHECK (reviewer_id <> reviewed_id),
    UNIQUE (trip_id, reviewer_id, reviewed_id)
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    type report_type NOT NULL DEFAULT 'OTHER',
    description TEXT,
    status report_status DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CHECK (reporter_id <> reported_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_departure_time ON trips(departure_time);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_departure_location ON trips(departure_location_id);
CREATE INDEX idx_trips_destination_location ON trips(destination_location_id);
CREATE INDEX idx_reservations_trip ON reservations(trip_id);
CREATE INDEX idx_reservations_passenger ON reservations(passenger_id);
CREATE INDEX idx_ratings_trip ON ratings(trip_id);
CREATE INDEX idx_ratings_reviewer ON ratings(reviewer_id);
CREATE INDEX idx_ratings_reviewed ON ratings(reviewed_id);
CREATE INDEX idx_locations_google_place_id ON locations(google_place_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_trips_updated_at
    BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION check_passenger_not_driver()
RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM trips t
        JOIN driver_profiles dp ON dp.id = t.driver_id
        WHERE t.id = NEW.trip_id AND dp.user_id = NEW.passenger_id
    ) THEN
        RAISE EXCEPTION 'A driver cannot reserve their own trip';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_passenger_not_driver
    BEFORE INSERT ON reservations FOR EACH ROW EXECUTE FUNCTION check_passenger_not_driver();

CREATE OR REPLACE FUNCTION manage_trip_seats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND (SELECT available_seats FROM trips WHERE id = NEW.trip_id) < NEW.seats_reserved THEN
        RAISE EXCEPTION 'Not enough available seats on this trip';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.status = 'ACCEPTED' AND OLD.status <> 'ACCEPTED' THEN
        UPDATE trips SET available_seats = available_seats - NEW.seats_reserved WHERE id = NEW.trip_id;
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.status IN ('CANCELLED', 'REJECTED') AND OLD.status = 'ACCEPTED' THEN
        UPDATE trips SET available_seats = available_seats + NEW.seats_reserved WHERE id = NEW.trip_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_manage_trip_seats
    AFTER INSERT OR UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION manage_trip_seats();

CREATE OR REPLACE FUNCTION check_trip_completed_for_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM trips WHERE id = NEW.trip_id AND status = 'COMPLETED') THEN
        RAISE EXCEPTION 'Ratings can only be submitted after a trip is completed';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_rating_trip_completed
    BEFORE INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION check_trip_completed_for_rating();

CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE driver_profiles
    SET average_rating = (
        SELECT ROUND(AVG(rating)::NUMERIC, 2)
        FROM ratings
        WHERE reviewed_id = NEW.reviewed_id
    )
    WHERE user_id = NEW.reviewed_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_driver_rating
    AFTER INSERT ON ratings FOR EACH ROW EXECUTE FUNCTION update_driver_rating();

CREATE OR REPLACE FUNCTION update_driver_total_rides()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status <> 'COMPLETED' THEN
        UPDATE driver_profiles SET total_rides = total_rides + 1 WHERE id = NEW.driver_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_total_rides
    AFTER UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_driver_total_rides();

INSERT INTO locations (
    name,
    address,
    formatted_address,
    city,
    latitude,
    longitude,
    is_university
)
VALUES (
    'Université Privée de Fès',
    'Route d’Imouzzer, Fès, Maroc',
    'Université Privée de Fès, Fès, Morocco',
    'Fès',
    34.0534000,
    -5.0011000,
    true
);