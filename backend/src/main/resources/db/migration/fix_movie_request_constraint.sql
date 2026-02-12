-- Migration script to fix MovieRequest unique constraint
-- This allows the same movie to be assigned to multiple theaters

-- Add composite unique constraint on (movie_code, theater_id)
ALTER TABLE movie_request 
ADD CONSTRAINT uk_movie_request_code_theater UNIQUE (movie_code, theater_id);
