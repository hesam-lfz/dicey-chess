import { Board, Game, outcomeIds, Settings } from './boardEngineApi';

const localStorageKeyPrefix = import.meta.env.VITE_APP_NAME;

// Cached saved games data retrieved from database:
let cachedSavedGames: Game[];

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
    if (cachedSavedGames) {
      resolve(cachedSavedGames);
    } else {
      setTimeout(async () => {
        const retrievedData = localStorage.getItem(
          localStorageKeyPrefix + '-games'
        );
        cachedSavedGames = retrievedData
          ? ((await JSON.parse(retrievedData)) as Game[])
          : [];
        console.log(cachedSavedGames);
        resolve(cachedSavedGames);
      }, 2000);
    }
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
      const allSavedGames = cachedSavedGames || (await database_loadGames());
      allSavedGames.unshift(savedGameData);
      const savedGamesDataJSON = JSON.stringify(allSavedGames);
      localStorage.setItem(
        localStorageKeyPrefix + '-games',
        savedGamesDataJSON
      );
      resolve(true);
    }, 1000);
  });
}
