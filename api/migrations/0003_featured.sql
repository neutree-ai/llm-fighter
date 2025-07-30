-- Add featured column to game_results table
ALTER TABLE game_results ADD COLUMN featured INTEGER NOT NULL DEFAULT 0;

-- Add index for featured games
CREATE INDEX IF NOT EXISTS idx_game_results_featured ON game_results(featured);