import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getGame, getGameFrames, getGamePlayers, patchFrame } from '../services/game.service';
import { Frame, Player } from '@fanpower/api-interfaces';
import { forkJoin, mergeMap, switchMap, tap } from 'rxjs';
import { FrameCell } from '../components';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Box, Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';

export interface GamePlayer {
  player: Player;
  frameOne: Frame;
  frameTwo: Frame;
  frameThree: Frame;
  frameFour: Frame;
  frameFive: Frame;
  frameSix: Frame;
  frameSeven: Frame;
  frameEight: Frame;
  frameNine: Frame;
  frameTen: Frame;
  score: number | null;
}

const frameNameMap: { [index: string]: keyof Omit<GamePlayer, 'player' | 'score'> } = {
  '1': 'frameOne',
  '2': 'frameTwo',
  '3': 'frameThree',
  '4': 'frameFour',
  '5': 'frameFive',
  '6': 'frameSix',
  '7': 'frameSeven',
  '8': 'frameEight',
  '9': 'frameNine',
  '10': 'frameTen',
};

export const Game = () => {
  const { gameId } = useParams();
  const [isLoadingS, setIsLoadingState] = useState(false);
  const [gameBoard, setGameBoardState] = useState<GamePlayer[]>([]);
  const [frames, setFramesState] = useState<Frame[]>([]);
  const [players, setPlayersState] = useState<Player[]>([]);
  const [updateScore, setUpdateScoreState] = useState<number>();
  const [activeFrame, setActiveFrameState] = useState<Frame>();
  const navigate = useNavigate();

  const calcFrameScore = (_frame: Frame): number | null => {
    if (typeof _frame.scoreOne !== 'number') return null;
    let score = 0;
    score += _frame.scoreOne ?? 0;
    score += _frame.scoreTwo ?? 0;
    score += _frame.scoreThree ?? 0;
    return score;
  };

  // We transform the players and frames arrays into a better format: GamePlayer[]
  const gameBoardInit = (players: Player[], frames: Frame[]): GamePlayer[] => {
    const values: GamePlayer[] = [];
    players.forEach((_player) => {
      const row = {} as GamePlayer;
      let score: number | null = null;
      row.player = _player;
      frames.forEach((_frame) => {
        if (_frame.playerId === row.player.id) {
          row[frameNameMap[_frame.frame]] = _frame;
          const frameScore = calcFrameScore(_frame);
          if (typeof frameScore === 'number') {
            if (score === null) {
              score = 0;
            }
            score += frameScore;
          }
        }
      });
      row.score = score ?? null;
      values.push(row);
    });
    return values;
  };

  // Initial call
  useEffect(() => {
    setIsLoadingState(true);
    if (gameId) {
      getGame(gameId)
        .pipe(
          mergeMap(() => forkJoin([getGamePlayers(gameId), getGameFrames(gameId)])),
          tap(([players, frames]) => {
            setPlayersState(players);
            setFramesState(frames);
            setGameBoardState(gameBoardInit(players, frames));
            setActiveFrameState(getOpenFrame());
            setIsLoadingState(false);
          })
        )
        .subscribe();
    }
  }, []);

  // TODO how do we update the score selection?  Better alternatives?
  useEffect(() => {
    setActiveFrameState(getOpenFrame());
  })

  const handleChange = (event: SelectChangeEvent) => setUpdateScoreState(parseInt(event.target.value));

  const getOpenFrame = (): Frame => frames.filter((f) => f.status === 'open')[0];

  const calcSelectList = (): number => {
    if (activeFrame) {
      if (activeFrame.frame < 10) {
        if (activeFrame.scoreOne) {
          return 11 - activeFrame.scoreOne;
        }
      } else {
        if (typeof activeFrame.scoreOne === 'number' && activeFrame.scoreOne < 10) {
          if (activeFrame.scoreTwo === null) {
            return 11 - activeFrame.scoreOne;
          }
        }
      }
    }
    return 11;
  };

  const handleUpdateScore = () => {
    if (typeof updateScore !== 'number') return;
    const { id, ...rest } = buildFramePatchRequest(updateScore, frames);
    if (gameId && id) {
      setUpdateScoreState(undefined);
      setIsLoadingState(true);
      patchFrame({ gameId, frameId: id, data: rest })
        .pipe(
          switchMap(() => getGameFrames(gameId)),
          tap((frames) => {
            setFramesState(frames);
            setGameBoardState(gameBoardInit(players, frames));
            setIsLoadingState(false);
            setUpdateScoreState(undefined);
            setActiveFrameState(getOpenFrame());
          })
        )
        .subscribe();
    }
  };

  return (
    <div>
      <TableContainer component={'div'}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell className={'stickyLeft'} style={{ minWidth: '150px' }} align="center">
                Player
              </TableCell>
              {Array.from({ length: 10 }, (_, i) => (
                <TableCell align="center" key={i + 1}>
                  Frame {i + 1}{' '}
                </TableCell>
              ))}
              <TableCell className={'stickyRight'}>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {gameBoard.map((row) => (
              <TableRow key={row.player.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell className={'stickyLeft'} component="th" scope="row" style={{ fontWeight: 'bold' }}>
                  {row.player.name}
                </TableCell>

                {Array.from({ length: 10 }, (_, index) => (
                  <TableCell key={index} component="th" scope="row">
                    <FrameCell frame={row[frameNameMap[index + 1]]} />
                  </TableCell>
                ))}

                <TableCell className={'stickyRight'} style={{ fontSize: '24px', fontWeight: 'bold' }} align="center">
                  {row.score}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'none',
          margin: 'auto',
          alignItems: 'center',
          maxWidth: 250,
          gap: 2,
          background: (theme) => theme.palette.background.paper,
          fontFamily: 'Roboto',
          padding: (theme) => theme.spacing(2),
        }}
      >
        <h3>Input Score</h3>
        <FormControl fullWidth>
          <InputLabel id="select-score">Score</InputLabel>
          <Select
            labelId="select-score"
            id="score"
            label="Score"
            disabled={!activeFrame}
            value={`${updateScore ?? ''}`}
            onChange={handleChange}
          >
            {Array.from({ length: calcSelectList() }, (_, index) => (
              <MenuItem key={index} value={index}>
                {index}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Stack flexDirection="row" alignItems="space-between" width="100%" justifyContent="space-between">
          <Button onClick={() => navigate('/')}>New Game</Button>
          <Button disabled={!activeFrame} onClick={handleUpdateScore}>Submit</Button>
        </Stack>
      </Box>
    </div>
  );
};

const buildFramePatchRequest = (score: number, frames: Frame[]) => {
  const req = {} as any;
  frames.forEach((frame) => {
    const { id, status, scoreOne, scoreTwo, scoreThree } = frame;
    if (status === 'open') {
      req['id'] = id;
      if (typeof scoreOne !== 'number' && typeof scoreTwo !== 'number' && typeof scoreThree !== 'number') {
        req['scoreOne'] = score;
      } else if (typeof scoreOne == 'number' && typeof scoreTwo !== 'number' && typeof scoreThree !== 'number') {
        req['scoreTwo'] = score;
      } else if (typeof scoreOne === 'number' && typeof scoreTwo === 'number' && typeof scoreThree !== 'number') {
        req['scoreThree'] = score;
      }
    }
  });
  return req;
};
