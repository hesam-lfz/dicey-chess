import { Board, Game, outcomeIds, Settings } from './boardEngineApi';

const localStorageKeyPrefix = import.meta.env.VITE_APP_NAME;

// Retrieve saved settings from local storage:
export function localStorage_loadSettings(): Settings | null {
  const retrievedData = localStorage.getItem(
    localStorageKeyPrefix + '-settings'
  );
  return retrievedData ? (JSON.parse(retrievedData) as Settings) : null;
}

// Save current settings to local storage:
export function localStorage_saveSettings(settings: Settings): void {
  const settingsDataJSON = JSON.stringify(settings);
  localStorage.setItem(localStorageKeyPrefix + '-settings', settingsDataJSON);
}

export async function database_loadGames(): Promise<Game[]> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const retrievedData = localStorage.getItem(
        localStorageKeyPrefix + '-games'
      );
      const gamesData = retrievedData
        ? ((await JSON.parse(retrievedData)) as Game[])
        : [];
      console.log(gamesData);
      resolve(gamesData);
    }, 2000);
  });
}
// Save a game to local storage:
export async function database_saveGame(board: Board): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const now = Math.floor(Date.now() / 1000);
      const savedGameData: Game = {
        uniqid: now,
        duration: now - board.gameStartTime,
        outcome: outcomeIds[board.outcome!],
        moveHistory: board.flatSanMoveHistory.join(','),
        diceRollHistory: board.diceRollHistory.join(','),
      };
      console.log(savedGameData);
      const allSavedGames = await database_loadGames();
      allSavedGames.push(savedGameData);
      const savedGamesDataJSON = JSON.stringify(allSavedGames);
      localStorage.setItem(
        localStorageKeyPrefix + '-games',
        savedGamesDataJSON
      );
      resolve(true);
    }, 2000);
  });
}
