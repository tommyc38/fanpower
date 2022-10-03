export interface Player {
  id: string;
  gameId: number;
  userId: string;
  name: string;
  createdAt: string | Date;
  playerOrder: number;
  rank: number | null;
  score: number | null;
}


