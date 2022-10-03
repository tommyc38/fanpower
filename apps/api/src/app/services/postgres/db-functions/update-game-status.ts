// noinspection SqlResolve

export const updateGameStatusFn = `
CREATE OR REPLACE FUNCTION update_game_status(
   game_id games.id%TYPE,
   updated_status games.status%TYPE
) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
   current_status games.status%TYPE;
   player_count INT;
   player RECORD;
BEGIN
   ASSERT (SELECT COUNT(*) FROM games AS G WHERE g.id = game_id) = 1, format('Your game id (%s) cannot be found', game_id);

   SELECT status INTO current_status
   FROM games AS G
   WHERE g.id = game_id;

   ASSERT current_status != updated_status, 'A game cannot be updated with the same status';
   ASSERT updated_status = 'inProgress', 'A game can only be updated to inProgress';

   SELECT COUNT(*) INTO player_count
   FROM players AS G
   WHERE g."gameId" = game_id;

   ASSERT player_count > 0, 'A game cannot be started without players';

   UPDATE games SET status = 'inProgress' WHERE id = game_id;

   FOR player IN SELECT p.id, p."playerOrder"
       FROM players AS P
       WHERE p."gameId" = game_id
   LOOP
      IF player."playerOrder" = 1 THEN
          INSERT INTO frames("gameId", "playerId", frame, status) VALUES (game_id, player.id, 1, 'open');
      ELSE
          INSERT INTO frames("gameId", "playerId", frame) VALUES (game_id, player.id, 1);
      END IF;
      INSERT INTO frames("gameId", "playerId", frame) VALUES
        (game_id, player.id, 2),
        (game_id, player.id, 3),
        (game_id, player.id, 4),
        (game_id, player.id, 5),
        (game_id, player.id, 6),
        (game_id, player.id, 7),
        (game_id, player.id, 8),
        (game_id, player.id, 9),
        (game_id, player.id, 10);
   END LOOP;
END; $$
`;
