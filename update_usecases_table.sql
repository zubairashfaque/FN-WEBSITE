-- SQL script to update usecases table with proper JSONB columns
ALTER TABLE usecases ALTER COLUMN industries TYPE JSONB USING industries::jsonb;
ALTER TABLE usecases ALTER COLUMN categories TYPE JSONB USING categories::jsonb;
