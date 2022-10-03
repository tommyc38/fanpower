export const frameStatus = ['closed', 'open', 'waiting'] as const;
export type FrameStatus = typeof frameStatus[number];

export interface Frame {
  id: string;
  createdAt: string | Date;
  gameId: number;
  playerId: string;
  frame: number;
  scoreOne: number | null;
  scoreTwo: number | null;
  scoreThree: number | null;
  status: FrameStatus;
  completedAt: string | Date;
}

