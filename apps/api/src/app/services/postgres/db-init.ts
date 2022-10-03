import { db } from './postgres-config';
import { dropAllTables, createUsersTable, createGamesTable, createPlayersTable, createFramesTable } from './db-tables';
import { updateGameStatusFn } from './db-functions/update-game-status';
import { updateFrameScoreFn } from './db-functions/update-frame-score';

export const executeQueryArray = async (arr, action, type) => {
  return new Promise<void>((resolve) => {
    (async () => {
      for (let i = 0; i < arr.length; i++) {
        await db.query(arr[i]);
        console.log(`${action} ${type}: ${i + 1} of ${arr.length}`);
      }
      resolve();
    })();
  });
};

export const dropTables = () => executeQueryArray([dropAllTables], 'Deleted', 'Table');
export const createTables = () =>
  executeQueryArray([createUsersTable, createGamesTable, createPlayersTable, createFramesTable], 'Created', 'Table');
export const createTableFunctions = async () => executeQueryArray([updateGameStatusFn, updateFrameScoreFn], 'Created', 'Table Function');

const init = async () => {
  return new Promise<void>((resolve) => {
    (async () => {
      console.log('Creating Tables...');
      await createTables();
      console.log('Creating Functions...');
      await createTableFunctions();
      resolve();
    })();
  });
};

init().then(() => {
  process.exit(0);
});
