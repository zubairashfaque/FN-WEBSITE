-- SQL script to recreate usecases table with proper column types
DROP TABLE IF EXISTS usecases;
CREATE TABLE usecases (id uuid PRIMARY KEY DEFAULT uuid_generate_v4(), title TEXT NOT NULL, description TEXT, content TEXT, industry TEXT, category TEXT, industries TEXT, categories TEXT, image_url TEXT, status TEXT DEFAULT 'draft', created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW());
