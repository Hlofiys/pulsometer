ALTER TABLE sessions DROP COLUMN key_points;

CREATE TABLE key_points (
    key_point_id        SERIAL PRIMARY KEY,
    session_id          INTEGER NOT NULL,
    start_measurement_id INTEGER NOT NULL,
    end_measurement_id  INTEGER NOT NULL,
    name                VARCHAR(255) NOT NULL,

    CONSTRAINT fk_session
        FOREIGN KEY(session_id) 
        REFERENCES sessions(session_id)
        ON DELETE CASCADE
);