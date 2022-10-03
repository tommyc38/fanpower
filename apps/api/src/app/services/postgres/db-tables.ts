export const createUsersTable = `
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    name VARCHAR,
    PRIMARY KEY (id)
);

INSERT INTO users(id,name) VALUES ('00000000-0000-0000-0000-000000000000','anon');
`;

export const createGamesTable = `
DROP TABLE IF EXISTS game_status, games CASCADE;
DROP TYPE IF EXISTS game_status_type CASCADE;

CREATE TYPE game_status_type AS ENUM (
  'complete', 'inProgress', 'configuration'
);

CREATE TABLE IF NOT EXISTS game_status (
  id SERIAL PRIMARY KEY,
  status game_status_type UNIQUE NOT NULL,
  description VARCHAR
);

INSERT INTO game_status(status, description) VALUES
  ( 'complete', 'game is complete'),
  ( 'inProgress', 'game is in progress (inProgress --> complete: On last frame completed'),
  ( 'configuration', 'game is being configured with players (configuration --> inProgress: On first frame created)');

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMPTZ,
    name VARCHAR,
    status game_status_type DEFAULT 'configuration' REFERENCES game_status(status)
);
`;

export const createPlayersTable = `
DROP TABLE IF EXISTS players CASCADE;
CREATE TABLE IF NOT EXISTS players (
    id UUID DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID REFERENCES users(id),
    "gameId" INTEGER REFERENCES games(id),
    name VARCHAR,
    "playerOrder" INTEGER NOT NULL CHECK("playerOrder" <= 4 AND "playerOrder" >= 1),
    score INTEGER CHECK(score <= 300 AND score >= 0),
    PRIMARY KEY (id)

);
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_player_order
ON players("gameId", "playerOrder");
`;

export const createFramesTable = `
DROP TABLE IF EXISTS frame_status, frames CASCADE;
DROP TYPE IF EXISTS frame_status_type CASCADE;

CREATE TYPE frame_status_type AS ENUM (
  'open', 'closed', 'waiting'
);

CREATE TABLE IF NOT EXISTS frame_status (
  id SERIAL PRIMARY KEY,
  status frame_status_type UNIQUE NOT NULL,
  description VARCHAR
);

INSERT INTO frame_status(status, description) VALUES
  ( 'closed', 'frame is closed'),
  ( 'open', 'frame is open'),
  ( 'waiting', 'frame is waiting to be played');


CREATE TABLE IF NOT EXISTS frames (
    id UUID DEFAULT gen_random_uuid(),
    "createdAt" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    "gameId" INTEGER REFERENCES games(id),
    "playerId" UUID REFERENCES players(id),
    frame INTEGER NOT NULL CHECK(frame <= 10 AND frame >=1),
    "scoreOne" INTEGER CHECK("scoreOne" <= 10 AND "scoreOne" >=0),
    "scoreTwo" INTEGER CHECK("scoreTwo" <= 10 AND "scoreTwo" >=0),
    "scoreThree" INTEGER CHECK("scoreThree" <= 10 AND "scoreTwo" >=0),
    status frame_status_type NOT NULL DEFAULT 'waiting' REFERENCES frame_status(status),
    "completedAt" TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_frames_gameId_playerId_frame
ON frames("gameId", "playerId", frame);
`;

export const dropAllTables = `
DROP TABLE IF EXISTS frame_status, frames, players, game_status, games, users CASCADE;
`;
