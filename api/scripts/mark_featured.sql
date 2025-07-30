-- SQL script to mark games as featured
-- Usage: Execute this with your D1 database to mark specific games as featured

-- Example: Mark a specific game as featured by ID
-- UPDATE game_results SET featured = 1 WHERE id = 'your-game-id';

-- Example: Mark all games by a specific owner as featured
-- UPDATE game_results SET featured = 1 WHERE owner_id = 'user-id';

-- Example: Mark the most recent 5 public games as featured
-- UPDATE game_results SET featured = 1 WHERE id IN (
--   SELECT id FROM game_results 
--   WHERE public = 1 
--   ORDER BY created_at DESC 
--   LIMIT 5
-- );

-- Example: Mark games with specific winner as featured
-- UPDATE game_results SET featured = 1 WHERE winner = 'p1' AND public = 1;

-- Example: Remove featured status from all games
-- UPDATE game_results SET featured = 0;

-- View currently featured games
SELECT id, winner, created_at, featured, public 
FROM game_results 
WHERE featured = 1 
ORDER BY created_at DESC;