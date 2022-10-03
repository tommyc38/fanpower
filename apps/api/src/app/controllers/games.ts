import { Code, HttpException, HttpStatus } from '../../models';
import {
  GameFrameUpdateRequest,
  GameFrameUpdateResponse,
  Game,
  GameAddPlayersRequest,
  GameAddPlayersResponse,
  GameCreateRequest,
  GameFramesResponse,
  GamePlayersResponse,
  GameUpdateRequest,
} from '@fanpower/api-interfaces';
import { NextFunction, Request, Response } from 'express';
import { PostgresService } from '../services';
import { Controller } from './base';

export class GamesController extends Controller {
  constructor(private postgresService: PostgresService) {
    super();
  }
  public getGameById = async (
    req: Request<{ id: number }, never, Game>,
    res: Response<Game>,
    next: NextFunction
  ): Promise<Response<Game>> => {
    try {
      const game = await this.postgresService.getGameById(req.params.id);
      return res.status(HttpStatus.OK).send(game);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public getGameFrames = async (
    req: Request<{ id: number }, never, GameFramesResponse>,
    res: Response<GameFramesResponse>,
    next: NextFunction
  ): Promise<Response<GameFramesResponse>> => {
    try {
      const frames = await this.postgresService.getGameFrames(req.params.id);
      return res.status(HttpStatus.OK).send(frames);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public getGamePlayers = async (
    req: Request<{ id: number }, never, GamePlayersResponse>,
    res: Response<GamePlayersResponse>,
    next: NextFunction
  ): Promise<Response<GamePlayersResponse>> => {
    try {
      const players = await this.postgresService.getGamePlayers(req.params.id);
      return res.status(HttpStatus.OK).send(players);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public postGamePlayers = async (
    req: Request<{ id: string }, GameAddPlayersResponse, GameAddPlayersRequest>,
    res: Response<GameAddPlayersResponse>,
    next: NextFunction
  ): Promise<Response<GameAddPlayersResponse>> => {
    try {
      const addPlayers = await super.validateRequestBody(GameAddPlayersRequest, req);
      const { id } = req.params;
      const gameStatus = await this.postgresService.getGameStatus(id);
      if (!gameStatus || gameStatus != 'configuration') {
        const message = 'Players can only be added to games that have not started';
        throw new HttpException(Code.BAD_REQUEST, { message });
      }
      const args = { ...addPlayers, gameId: id };
      const players = await this.postgresService.createPlayers(args);
      return res.status(HttpStatus.OK).send(players);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public patchGameFrames = async (
    req: Request<{ gameId: string; frameId: string }, GameFrameUpdateResponse, GameFrameUpdateRequest>,
    res: Response<GameFrameUpdateResponse>,
    next: NextFunction
  ): Promise<Response<GameFrameUpdateResponse>> => {
    try {
      const updateFrame = await super.validateRequestBody(GameFrameUpdateRequest, req);
      const args = { id: req.params.frameId, ...updateFrame };
      const frame = await this.postgresService.updateFrame(args);
      return res.status(HttpStatus.CREATED).send(frame);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public patch = async (
    req: Request<{ id: string }, GameUpdateRequest, Game>,
    res: Response<Game>,
    next: NextFunction
  ): Promise<Response<Game>> => {
    try {
      const patchGame = await super.validateRequestBody(GameUpdateRequest, req);
      const args = { ...patchGame, id: req.params.id };
      const game = await this.postgresService.updateGame(args);
      return res.status(HttpStatus.OK).send(game);
    } catch (error) {
      super.handleError(error, next);
    }
  };

  public post = async (
    req: Request<never, GameCreateRequest, GameCreateRequest>,
    res: Response<Game>,
    next: NextFunction
  ): Promise<Response<Game>> => {
    try {
      const newGameRequest = await super.validateRequestBody(GameCreateRequest, req);
      const newGame = await this.postgresService.createGame(newGameRequest);
      return res.status(HttpStatus.CREATED).send(newGame);
    } catch (error) {
      super.handleError(error, next);
    }
  };
}
