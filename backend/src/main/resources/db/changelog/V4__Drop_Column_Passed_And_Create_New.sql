ALTER TABLE sessions DROP COLUMN IF EXISTS passed;

ALTER TABLE sessions ADD COLUMN passed BIGINT DEFAULT 0 NOT NULL;