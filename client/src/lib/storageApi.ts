import { Board, Settings } from './boardEngineApi';

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

// Save a game to local storage:
export async function database_saveGame(board: Board): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = Math.floor(Date.now() / 1000);
      const savedGameData = {
        uniqid: now,
        duration: now - board.gameStartTime,
        moveHistory: board.flatSanMoveHistory.join(','),
        diceRollHistory: board.diceRollHistory.join(','),
      };
      console.log(savedGameData);
      const savedGameDataJSON = JSON.stringify(savedGameData);
      localStorage.setItem(localStorageKeyPrefix + '-games', savedGameDataJSON);
      resolve(true);
    }, 2000);
  });
}
