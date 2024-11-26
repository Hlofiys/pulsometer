ALTER TABLE devices DROP CONSTRAINT fk_active_user;

ALTER TABLE devices
    ADD CONSTRAINT fk_active_user
        FOREIGN KEY (active_user_id) REFERENCES users(user_id) ON DELETE SET NULL;

ALTER TABLE users DROP CONSTRAINT fk_device;

ALTER TABLE users
    ADD CONSTRAINT fk_device
        FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE SET NULL;

ALTER TABLE sessions DROP CONSTRAINT fk_user;

ALTER TABLE sessions
    ADD CONSTRAINT fk_user
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE pulse_measurements DROP CONSTRAINT fk_session;

ALTER TABLE pulse_measurements
    ADD CONSTRAINT fk_session
        FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE;