CREATE TABLE game_results (
 id TEXT PRIMARY KEY,
 winner TEXT,
 gameConfig TEXT NOT NULL,
 logs TEXT NOT NULL,
 violationLogs TEXT NOT NULL,
 tokenLogs TEXT NOT NULL,
 p1Config TEXT NOT NULL,
 p2Config TEXT NOT NULL,
 owner_id TEXT,
 public INTEGER NOT NULL DEFAULT 0,
 created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_game_results_owner_id ON game_results(owner_id);
CREATE INDEX IF NOT EXISTS idx_game_results_public ON game_results(public);