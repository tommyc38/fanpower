import { Box, Button, Stack, TextField } from '@mui/material';
import type { GameAddPlayersRequest } from '@fanpower/api-interfaces';
import { FormEvent } from 'react';
import { GameAddPlayer } from '@fanpower/api-interfaces';

export const PlayerNameForm = ({
  onChanges,
  onCancel,
  playerCount,
}: {
  onChanges: (req: GameAddPlayersRequest) => any;
  onCancel: () => any;
  playerCount: number;
}) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const players: GameAddPlayer[] = [];
    const formElements = event.currentTarget.elements;
    for (let index = 0; index < formElements.length; index++) {
      const playerData = formElements.item(index) as HTMLInputElement;
      if (playerData.name) {
        const playerOrder = parseInt(playerData.name);
        const player: GameAddPlayer = { name: playerData.value, playerOrder };
        players.push(player);
      }
    }
    onChanges({ players });
  };

  const handleCancel = () => onCancel();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: (theme) => theme.spacing(2),
        padding: (theme) => theme.spacing(1),
      }}
      component="form"
      id="players"
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <h3>Input Player Names (optional)</h3>
      {Array.from({ length: playerCount }, (_, index) => (
        <TextField
          key={index}
          id={`player-${index + 1}`}
          label={`Player ${index + 1}`}
          variant="outlined"
          name={`${index + 1}`}
        />
      ))}
      <Stack flexDirection={'column'} alignItems={'center'} justifyContent={'center'} spacing={2}>
        <Button variant="outlined" type="submit">
          Start Game
        </Button>
        <Button onClick={handleCancel} variant="outlined" type="button">
          Cancel
        </Button>
      </Stack>
    </Box>
  );
};
