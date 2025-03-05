import { WHITE } from 'chess.js';
import {
  Board,
  SavedGame,
  outcomeIds,
  Settings,
  CurrentGameSettings,
} from './boardEngineApi';

const localStorageKeyPrefix = import.meta.env.VITE_APP_NAME;

// Cached saved games data retrieved from database:
let cachedSavedGames: SavedGame[];

// Retrieve saved settings from local storage:
export function storageApi_loadSettings(): Settings | null {
  const retrievedData = localStorage.getItem(
    localStorageKeyPrefix + '-settings'
  );
  return retrievedData ? (JSON.parse(retrievedData) as Settings) : null;
}

// Save current settings to local storage:
export function storageApi_saveSettings(settings: Settings): void {
  const settingsDataJSON = JSON.stringify(settings);
  localStorage.setItem(localStorageKeyPrefix + '-settings', settingsDataJSON);
}

// Load all games saved by the user (stored locally on device):
export async function storageApi_loadGames(): Promise<SavedGame[]> {
  return new Promise((resolve) => {
    if (cachedSavedGames) {
      resolve(cachedSavedGames);
    } else {
      resolve(localStorage_loadGames());
    }
  });
}

async function localStorage_loadGames(): Promise<SavedGame[]> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const retrievedData = localStorage.getItem(
        localStorageKeyPrefix + '-games'
      );
      cachedSavedGames = retrievedData
        ? ((await JSON.parse(retrievedData)) as SavedGame[])
        : [];
      //console.log(cachedSavedGames);
      resolve(cachedSavedGames);
    }, 2000);
  });
}

/*
try {
        const res = await fetch('/api/todos');
        if (!res.ok) throw new Error(`fetch Error ${res.status}`);
        const todos = (await res.json()) as Todo[];
        setTodos(todos);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
*/

export async function storageApi_loadGamesAsDictionary(): Promise<{
  [key: number]: SavedGame;
}> {
  const allGamesDict: { [key: number]: SavedGame } = {};
  const allSavedGames = await storageApi_loadGames();
  allSavedGames.forEach((g: SavedGame) => (allGamesDict[g.at] = g));
  return allSavedGames;
}

// Save a game by the user (stored locally on device):
export async function storageApi_saveGame(
  currentGameSettings: CurrentGameSettings,
  board: Board
): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const now = Math.floor(Date.now() / 1000);
      const savedGameData: SavedGame = {
        at: now,
        userId: 0,
        duration: now - board.gameStartTime,
        outcome: outcomeIds[board.outcome!],
        moveHistory: board.flatSanMoveHistory.join(','),
        diceRollHistory: board.diceRollHistory.join(','),
        humanPlaysWhite: currentGameSettings.humanPlaysColor === WHITE,
      };
      console.log(savedGameData);
      const allSavedGames = cachedSavedGames || (await storageApi_loadGames());
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

// Delete a game by the user (stored locally on device):
export async function storageApi_deleteGame(gameId: number): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const allSavedGames = (
        cachedSavedGames || (await storageApi_loadGames())
      ).filter((g) => g.at !== gameId);
      cachedSavedGames = allSavedGames;
      const savedGamesDataJSON = JSON.stringify(allSavedGames);
      localStorage.setItem(
        localStorageKeyPrefix + '-games',
        savedGamesDataJSON
      );
      resolve(true);
    }, 1000);
  });
}
