// noinspection SqlResolve

export const updateFrameScoreFn = `
CREATE FUNCTION update_frame_score(frame_id UUID, score INTEGER, score_position INTEGER)
    RETURNS TABLE
            (
                id UUID
            )
    LANGUAGE plpgsql
AS
$$
DECLARE
    current_player        RECORD;
    player_count          INT;
    current_frame         RECORD;
    prev_frame            RECORD;
    prev_to_prev_frame    RECORD;
    next_player           RECORD;
    next_frame            RECORD;
    is_last_frame         boolean;
    next_frame_id         frames.id%TYPE;
    prev_frame_id         frames.id%TYPE;
    prev_to_prev_frame_id frames.id%TYPE;
BEGIN

    -- Set variables with sanity checks
    ASSERT (SELECT COUNT(*) FROM frames AS F WHERE f.id = frame_id) = 1, format('Your frame id (%s) cannot be found', frame_id);

    SELECT * INTO current_frame FROM frames AS F WHERE f.id = frame_id;
    ASSERT current_frame.status = 'open', 'You can only update open frames';

    SELECT COUNT(*) INTO player_count FROM players AS P WHERE p."gameId" = current_frame."gameId";
    raise notice 'Player count is: %', player_count;
    SELECT * INTO current_player FROM players AS P WHERE p."id" = current_frame."playerId";

    is_last_frame = current_frame.frame = 10 AND current_player."playerOrder" = player_count;

    IF NOT is_last_frame THEN
        IF player_count > 1 THEN
            IF player_count = current_player."playerOrder" THEN
                SELECT * INTO next_player FROM players AS P
                WHERE p."gameId" = current_frame."gameId" AND p."playerOrder" = 1;
                raise notice 'Next player is: %', next_player;

                SELECT * INTO next_frame FROM frames AS F
                WHERE f."playerId" = next_player.id AND f.frame = current_frame.frame + 1;
            ELSE
                SELECT * INTO next_player FROM players AS P
                WHERE p."gameId" = current_frame."gameId"
                  AND p."playerOrder" = current_player."playerOrder" + 1;

                raise notice 'Next player is: %', next_player;
                SELECT * INTO next_frame FROM frames AS F
                WHERE f."playerId" = next_player.id AND f.frame = current_frame.frame;
            END IF;
        ELSE
            next_player = current_player;
            SELECT * INTO next_frame FROM frames AS F
            WHERE f."playerId" = next_player.id AND f.frame = current_frame.frame + 1;

        END IF;
    END IF;


    -- Update the current frame score and status AND the next frame's status
    IF score_position = 1 THEN
        ASSERT current_frame."scoreOne" IS NULL, 'You cannot update a score that is already recorded';
        UPDATE frames SET "scoreOne" = score WHERE frames.id = current_frame.id;
        IF current_frame.frame < 10 and score = 10 THEN
            UPDATE frames SET status = 'closed', "completedAt" = now() WHERE frames.id = frame_id;
            UPDATE frames SET status = 'open' WHERE frames.id = next_frame.id;
            next_frame_id = next_frame.id;
        END IF;
    ELSEIF score_position = 2 THEN
        ASSERT current_frame."scoreTwo" IS NULL , 'You cannot update a score that already recorded';
        ASSERT current_frame."scoreOne" IS NOT NULL, 'You must update scores in order';
        UPDATE frames SET "scoreTwo" = score WHERE frames.id = frame_id;
        IF current_frame.frame < 10 THEN
            UPDATE frames SET status = 'closed', "completedAt" = now() WHERE frames.id = frame_id;
            UPDATE frames SET status = 'open' WHERE frames.id = next_frame.id;
            next_frame_id = next_frame.id;
        ELSE
            IF is_last_frame THEN
                IF score + current_frame."scoreOne" < 10 THEN
                    UPDATE frames SET status = 'closed', "completedAt" = now() WHERE frames.id = frame_id;
                    UPDATE games SET status = 'complete' WHERE games.id = current_frame."gameId";
                END IF;
            ELSE
                IF score + current_frame."scoreOne" < 10 THEN
                    UPDATE frames SET status = 'closed', "completedAt" = now() WHERE frames.id = frame_id;
                    UPDATE frames SET status = 'open' WHERE frames.id = next_frame.id;
                    next_frame_id = next_frame.id;
                END IF;
            END IF;
        END IF;
    ELSEIF score_position = 3 THEN
        ASSERT current_frame.frame = 10, 'You cannot update a score position of 3 except on the 10th frame';
        ASSERT current_frame."scoreThree" IS NULL, 'You cannot update a score that already recorded';
        ASSERT current_frame."scoreOne" IS NOT NULL, 'You must update scores in order';
        ASSERT current_frame."scoreTwo" IS NOT NULL, 'You must update scores in order';
        UPDATE frames SET "scoreThree" = score, status = 'closed' WHERE frames.id = frame_id;
        IF is_last_frame THEN
            UPDATE games SET status = 'complete' WHERE games.id = current_frame."gameId";
        ELSE
            UPDATE frames SET status = 'open' WHERE frames.id = next_frame.id;
            next_frame_id = next_frame.id;
        END IF;
    ELSE
        RAISE 'Score position must between 1 and 3';
    END IF;

    -- Update scores on previous frames that were either strikes or spares
    IF current_frame.frame > 1 THEN
        SELECT * INTO prev_frame
        FROM frames AS F
        WHERE f."playerId" = current_frame."playerId"
          AND f.frame = current_frame.frame - 1;


        IF prev_frame."scoreTwo" IS NULL THEN
            IF prev_frame."scoreOne" = 10 THEN
                UPDATE frames SET "scoreTwo" = score WHERE frames.id = prev_frame.id;
                prev_frame_id = prev_frame.id;
            END IF;
        ELSEIF prev_frame."scoreThree" IS NULL THEN
            IF prev_frame."scoreOne" = 10 or prev_frame."scoreOne" + prev_frame."scoreTwo" = 10 THEN
                UPDATE frames SET "scoreThree" = score WHERE frames.id = prev_frame.id;
                prev_frame_id = prev_frame.id;
            END IF;
        END IF;

        IF current_frame.frame > 2 THEN
            SELECT * INTO prev_to_prev_frame
            FROM frames AS F
            WHERE f."playerId" = current_frame."playerId"
              AND f.frame = current_frame.frame - 2;

            IF prev_to_prev_frame."scoreThree" IS NULL AND prev_to_prev_frame."scoreOne" = 10 THEN
                UPDATE frames SET "scoreThree" = score WHERE frames.id = prev_to_prev_frame.id;
                prev_to_prev_frame_id = prev_to_prev_frame.id;
            END IF;
        END IF;

    END IF;

    -- Return all the frames that were updated
    RETURN QUERY SELECT f.id
                 FROM frames as F
                 where f.id IN (current_frame.id, coalesce(next_frame_id, current_frame.id) ,coalesce(prev_frame_id, current_frame.id),
                                coalesce(prev_to_prev_frame_id, current_frame.id));

END
$$;
`;
