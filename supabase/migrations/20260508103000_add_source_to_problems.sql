-- Migration to add source column and clear problem data

-- 1. Add source column to problems table
ALTER TABLE problems ADD COLUMN IF NOT EXISTS source text;

-- 2. Clear out all tables that depend on problems, then clear problems and imports
DELETE FROM scores;
DELETE FROM solutions;
DELETE FROM imports;
DELETE FROM problems;
