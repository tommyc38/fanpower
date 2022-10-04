import React, { useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import { Box, Button, Paper, Stack, styled } from '@mui/material';
import { createGame, createGamePlayers, patchGame } from '../services/game.service';
import type { Game, Player } from '@fanpower/api-interfaces';
import { switchMap, tap } from 'rxjs';
import { useNavigate } from 'react-router-dom';
import { PlayerNameForm } from '../components/player-names-form';
import { GameAddPlayersRequest } from '@fanpower/api-interfaces';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(4),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export const Home = () => {
  const navigate = useNavigate();
  const [isLoadingS, setIsLoadingState] = useState(false);
  const [players, setIsPlayerState] = useState<Player[]>([]);
  const [game, setGameState] = useState<Game>({} as Game);
  const [playerCount, setPlayerCountState] = useState<number>();

  const handleStartGame = (params: GameAddPlayersRequest) => {
    setIsLoadingState(true);
    createGame({})
      .pipe(
        tap((_game) => setGameState(_game)),
        switchMap((_game) => createGamePlayers(_game.id, params)),
        tap((_players) => setIsPlayerState(_players)),
        switchMap((_players) => patchGame(_players[0].gameId, { status: 'inProgress' })),
        tap((_game) => {
          setGameState(_game);
          setIsLoadingState(false);
          navigate(`/${_game.id}`);
        })
      )
      .subscribe();
  };
  const handlePlayerSelect = (number: number) => {
    setPlayerCountState(number);
  };

  if (playerCount) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: (theme) => theme.spacing(2),
        }}
      >
        <Grid container>
          <Item>
            <PlayerNameForm playerCount={playerCount} onCancel={() => setPlayerCountState(undefined)} onChanges={handleStartGame} />
          </Item>
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <Grid container>
        <Item>
          <Stack spacing={2}>
            <h2>Bowling Score Keeper</h2>
            <h3>Choose the number of players</h3>
            {Array.from({ length: 4 }, (_, index) => (
              <Button key={index} variant="outlined" onClick={() => handlePlayerSelect(index + 1)}>
                {index + 1}
              </Button>
            ))}
          </Stack>
        </Item>
      </Grid>
    </Box>
  );
};
