import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Player } from './player';
import { Frame } from './frame';
import { Type } from 'class-transformer';

export const gameStatus = ['complete', 'inProgress', 'configuration'] as const;
export type GameStatus = typeof gameStatus[number];

export interface Game {
  id: number;
  createdAt: string | Date;
  completedAt: string | Date;
  name: string | null;
  status: GameStatus;
}

export class GameCreateRequest implements Partial<Pick<Game, 'name'>> {
  @IsOptional()
  @IsString()
  @MaxLength(26)
  name?: string;
}

export type GameCreateResponse = Game;
export type GameFramesResponse = Frame[];
export type GamePlayersResponse = Player[];

export class GameAddPlayer implements Pick<Player, 'playerOrder' | 'name'> {
  @IsOptional()
  @IsUUID('all')
  userId?: string;

  @IsDefined()
  @IsInt()
  @Max(4)
  @Min(1)
  playerOrder: number;

  @IsOptional()
  @IsString()
  name: string;
}

export class GameAddPlayersRequest {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(4)
  @ArrayMinSize(1)
  @Type(() => GameAddPlayer)
  players: GameAddPlayer[];
}

export type GameAddPlayersResponse = Player[];

export class GameUpdateRequest implements Partial<Pick<Game, 'status'>> {
  @IsDefined()
  @IsString()
  @IsIn(gameStatus)
  status: GameStatus;
}

export type GameUpdateResponse = Game;

export class GameFrameUpdateRequest implements Pick<Frame, 'scoreOne' | 'scoreTwo' | 'scoreThree'> {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  scoreOne: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  scoreTwo: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  scoreThree: number;
}

export type GameFrameUpdateResponse = Frame[];
