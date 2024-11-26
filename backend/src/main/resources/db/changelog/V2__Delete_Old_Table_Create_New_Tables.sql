DROP TABLE IF EXISTS pulse_measurements CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE devices (
                         device_id INT PRIMARY KEY,
                         status VARCHAR(50) NOT NULL,
                         active_user_id INT,
                         last_contact TIMESTAMP,
                         users INT[]
);

CREATE TABLE users (
                       user_id SERIAL PRIMARY KEY,
                       fio VARCHAR(255) NOT NULL,
                       device_id INT
);

CREATE TABLE sessions (
                          session_id SERIAL PRIMARY KEY,
                          user_id INT NOT NULL,
                          time TIMESTAMP NOT NULL,
                          passed DOUBLE PRECISION DEFAULT 0
);

CREATE TABLE pulse_measurements (
                                    measurement_id SERIAL PRIMARY KEY,
                                    bpm INT NOT NULL,
                                    oxygen INT NOT NULL,
                                    session_id INT NOT NULL,
                                    date TIMESTAMP
);

ALTER TABLE devices
    ADD CONSTRAINT fk_active_user
        FOREIGN KEY (active_user_id) REFERENCES users(user_id);

ALTER TABLE users
    ADD CONSTRAINT fk_device
        FOREIGN KEY (device_id) REFERENCES devices(device_id);

ALTER TABLE sessions
    ADD CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(user_id);

ALTER TABLE pulse_measurements
    ADD CONSTRAINT fk_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id);


CREATE OR REPLACE FUNCTION update_device_users()
    RETURNS TRIGGER AS $$
BEGIN
    UPDATE devices
    SET users = array_append(users, NEW.user_id)
    WHERE device_id = NEW.device_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_users
    AFTER INSERT OR UPDATE OF device_id ON users
    FOR EACH ROW
    WHEN (NEW.device_id IS NOT NULL)
EXECUTE FUNCTION update_device_users();