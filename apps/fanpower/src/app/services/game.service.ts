import { env } from '../../environments';
import type {
  Frame,
  Game,
  GameAddPlayersResponse,
  GameCreateRequest,
  GameCreateResponse,
  GameFramesResponse,
  GameFrameUpdateResponse,
  GameUpdateRequest,
  GameUpdateResponse,
  Player,
} from '@fanpower/api-interfaces';
import { defer, Observable } from 'rxjs';
import { GameAddPlayersRequest, GameFrameUpdateRequest } from '@fanpower/api-interfaces';
import { HttpError } from './error.service';

const API_BASE_URL = `/api/${env.API_VERSION}/games`;

const callApi = (input: RequestInfo | URL, init: RequestInit | undefined = undefined) => {
  return fetch(input, init).then((response) => {
    if (!response.ok) throw new HttpError(response);
    return response;
  });
};

async function _getGame(gameId: string | number): Promise<Game> {
  const response = await callApi(`${API_BASE_URL}/${gameId}`);
  return await response.json();
}

export const getGame = (gameId: string | number): Observable<Game> => {
  return defer(() => _getGame(gameId));
};

async function _getGamePlayers(gameId: string | number): Promise<Player[]> {
  const response = await callApi(`${API_BASE_URL}/${gameId}/players`);
  return await response.json();
}

export const getGamePlayers = (gameId: string | number): Observable<Player[]> => {
  return defer(() => _getGamePlayers(gameId));
};

async function _getGameFrames(gameId: string | number): Promise<GameFramesResponse> {
  const response = await callApi(`${API_BASE_URL}/${gameId}/frames`);
  return await response.json();
}

export const getGameFrames = (gameId: string | number): Observable<Frame[]> => {
  return defer(() => _getGameFrames(gameId));
};

async function _createGamePlayers(
  gameId: string | number,
  data: GameAddPlayersRequest
): Promise<GameAddPlayersResponse> {
  const response = await callApi(`${API_BASE_URL}/${gameId}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export const createGamePlayers = (
  gameId: string | number,
  data: GameAddPlayersRequest
): Observable<GameAddPlayersResponse> => {
  return defer(() => _createGamePlayers(gameId, data));
};

async function _createGame(data: GameCreateRequest): Promise<GameCreateResponse> {
  const response = await callApi(`${API_BASE_URL}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export const createGame = (data: GameCreateRequest): Observable<GameCreateResponse> => {
  return defer(() => _createGame(data));
};

export async function _patchGame(gameId: number, data: GameUpdateRequest): Promise<GameUpdateResponse> {
  const response = await callApi(`${API_BASE_URL}/${gameId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const res = await response.json();
  return res
}

export const patchGame = (gameId: number, data: GameUpdateRequest): Observable<GameUpdateResponse> => {
  return defer(() => _patchGame(gameId, data));
};

export type FramePatchParams = { gameId: string | number; frameId: string; data: GameFrameUpdateRequest };

async function _patchFrame({ gameId, frameId, data }: FramePatchParams): Promise<GameFrameUpdateResponse> {
  const response = await callApi(`${API_BASE_URL}/${gameId}/frames/${frameId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await response.json();
}

export const patchFrame = (params: FramePatchParams): Observable<GameFrameUpdateResponse> => {
  return defer(() => _patchFrame(params));
};
