import { db } from './postgres-config';
import type { Frame, Game, GameCreateRequest, User, Player, GameStatus } from '@fanpower/api-interfaces';
import { GameFrameUpdateRequest, GameAddPlayersRequest } from '@fanpower/api-interfaces';
import { format } from 'node-pg-format';
import { Code, HttpException } from '../../../models';

export class PostgresService {
  public async createPlayers({
    players,
    gameId,
  }: GameAddPlayersRequest & { gameId: string | number }): Promise<Player[]> {
    const values = [];
    let anonUserId;
    for (const player of players) {
      if (!player.userId) {
        if (!anonUserId) {
          anonUserId = await this.getAnonUser().then((anon) => anon.id);
        }
        player.userId = anonUserId;
      }
      values.push([player.userId, gameId, player.playerOrder, player.name || `Player ${player.playerOrder}`]);
    }
    const query = format(`INSERT INTO players("userId", "gameId", "playerOrder", name) VALUES %L RETURNING *`, values);
    const { rows } = await db.query(query);
    return rows;
  }

  public async getGameStatus(id: number | string): Promise<GameStatus> {
    const query = `SELECT status from games WHERE id = ${id}`;
    const { rows } = await db.query(query);
    return rows[0]?.status;
  }

  public async createGame({ name }: GameCreateRequest): Promise<Game> {
    const query = 'INSERT INTO games(name) VALUES($1) RETURNING *';
    const { rows } = await db.query(query, [name]);
    return rows[0];
  }

  public async getGameById(gameId: number | string): Promise<Game> {
    const query = `SELECT * FROM games WHERE id = '${gameId}'`;
    const { rows } = await db.query(query);
    return rows[0];
  }

  public async getGameFrames(gameId: number | string): Promise<Frame[]> {
    const query = `SELECT * FROM frames WHERE "gameId" = '${gameId}' ORDER BY frame ASC`;
    const { rows } = await db.query(query);
    return rows;
  }

  public async getFrameById(frameId: string): Promise<Frame> {
    const query = `SELECT * FROM frames WHERE "frameId" = '${frameId}'`;
    const { rows } = await db.query(query);
    return rows[0];
  }

  public async getGamePlayers(gameId: number | string): Promise<Player[]> {
    const query = `SELECT * FROM players WHERE "gameId" = '${gameId}'`;
    const { rows } = await db.query(query);
    return rows;
  }

  public async updateGame({ id, status }: { id: number | string; status: GameStatus }): Promise<Game> {
    const query = `SELECT * FROM update_game_status($1, $2);`;
    await db.query(query, [id, status]);
    const { rows } = await db.query(`SELECT * FROM games WHERE id = ${id}`);
    return rows[0];
  }

  public async updateFrame(params: { id: number | string } & GameFrameUpdateRequest): Promise<Frame[]> {
    const { score, scorePosition } = this._parseFrameUpdateParams(params);
    const queryFn = `SELECT * FROM update_frame_score($1, $2, $3);`;
    const { rows } = await db.query(queryFn, [params.id, score, scorePosition]);
    const frameIds = [];
    if (rows.length) {
      for (const frame of rows) {
        frameIds.push(`'${frame.id}'`);
      }
    }
    const queryFrames = `SELECT * FROM frames WHERE id IN(${frameIds.join(',')}) ORDER BY frame;`;
    const frames = await db.query(queryFrames);
    return frames.rows;
  }

  public async getAnonUser(): Promise<User> {
    const query = `
      SELECT id FROM users WHERE name = 'anon' AND "createdAt" = (SELECT MIN("createdAt") from users)
      `;
    const { rows } = await db.query(query);
    return rows[0];
  }

  private _parseFrameUpdateParams({
    scoreOne,
    scoreTwo,
    scoreThree,
  }: { id: number | string } & GameFrameUpdateRequest): {
    score: number;
    scorePosition: number;
  } {
    let score;
    let scorePosition;
    if (typeof scoreOne === 'number') {
      score = scoreOne;
      scorePosition = 1;
    }
    if (typeof scoreTwo === 'number') {
      score = scoreTwo;
      scorePosition = 2;
    }
    if (typeof scoreThree === 'number') {
      score = scoreThree;
      scorePosition = 3;
    }
    if (typeof score !== 'number') throw new HttpException(Code.BAD_REQUEST, { message: 'You must supply a score' });
    return { score, scorePosition };
  }
}

export const postgresService = new PostgresService();
