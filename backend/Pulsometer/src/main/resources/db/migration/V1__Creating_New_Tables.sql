CREATE TABLE devices (
                         id INT PRIMARY KEY,
                         status VARCHAR(50) NOT NULL,
                         active_user_id INT,
                         last_contact TIMESTAMP,
                         users INT[]
);


CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       fio VARCHAR(255) NOT NULL,
                       device_id INT,
                       pulse_measurements INT[]
);


CREATE TABLE pulse_measurements (
                                    id SERIAL PRIMARY KEY,
                                    bpm INT NOT NULL,
                                    user_id INT,
                                    date TIMESTAMP
);


ALTER TABLE devices
    ADD CONSTRAINT fk_active_user
        FOREIGN KEY (active_user_id) REFERENCES users(id);

ALTER TABLE users
    ADD CONSTRAINT fk_device
        FOREIGN KEY (device_id) REFERENCES devices(id);

ALTER TABLE pulse_measurements
    ADD CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(id);

-- Триггер для обновления users в devices
CREATE OR REPLACE FUNCTION update_device_users()
    RETURNS TRIGGER AS $$
BEGIN
UPDATE devices
SET users = array_append(users, NEW.id)
WHERE id = NEW.device_id;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_users
    AFTER INSERT OR UPDATE OF device_id ON users
    FOR EACH ROW
    WHEN (NEW.device_id IS NOT NULL)
    EXECUTE FUNCTION update_device_users();

-- Триггер для обновления pulse_measurements в users
CREATE OR REPLACE FUNCTION update_pulse_measurements()
    RETURNS TRIGGER AS $$
BEGIN
UPDATE users
SET pulse_measurements = array_append(pulse_measurements, NEW.id)
WHERE id = NEW.user_id;

RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pulse_measurements
    AFTER INSERT ON pulse_measurements
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_pulse_measurements();