import { WHITE } from 'chess.js';
import {
  Board,
  SavedGame,
  outcomeIds,
  Settings,
  CurrentGameSettings,
} from './boardEngineApi';

const localStorageKeyPrefix = import.meta.env.VITE_APP_NAME;

interface UserSession {
  userId: number;
  username: string;
}

export const userSession: UserSession | null = { userId: 0, username: 'blah' };

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

// Load all games saved by the user.
// If user in session and database access possible load from database.
// Otherwise load games stored locally on device:
export async function storageApi_loadGames(): Promise<SavedGame[]> {
  return new Promise((resolve) => {
    if (cachedSavedGames) {
      resolve(cachedSavedGames);
    } else {
      const run = async (): Promise<SavedGame[]> => {
        if (!userSession) {
          console.log(
            'No user session. Retrieving saved game from local storage....'
          );
          return await localStorage_loadGames();
        } else {
          try {
            console.log('trying to load games from db...');
            return await database_loadGames();
          } catch (e) {
            console.error(
              'failed loading games from db. Accessing local storage...'
            );
            return await localStorage_loadGames();
          }
        }
      };
      resolve(run());
    }
  });
}

// Load all games saved by the user (stored locally on device):
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
    }, 1000);
  });
}

// Load all games saved by the user (stored on database):
async function database_loadGames(): Promise<SavedGame[]> {
  return new Promise((resolve) => {
    const run = async (): Promise<SavedGame[]> => {
      const res = await fetch('/api/games/' + userSession!.userId);
      //console.log('result from db', res);
      if (!res.ok) throw new Error(`fetch Error ${res.status}`);
      const retrievedData = (await res.json()) as SavedGame[];
      cachedSavedGames = retrievedData;
      //console.log(cachedSavedGames);
      return cachedSavedGames;
    };
    resolve(run());
  });
}

// Load all games saved by the user as a dictionary of saved game data
// If user in session and database access possible load from database.
// Otherwise load games stored locally on device:
export async function storageApi_loadGamesAsDictionary(): Promise<{
  [key: number]: SavedGame;
}> {
  const allGamesDict: { [key: number]: SavedGame } = {};
  const allSavedGames = await storageApi_loadGames();
  allSavedGames.forEach((g: SavedGame) => (allGamesDict[g.at] = g));
  return allSavedGames;
}

// Save a game by the user
// If user in session and database access possible load from database.
// Otherwise load games stored locally on device:
export async function storageApi_saveGame(
  currentGameSettings: CurrentGameSettings,
  board: Board
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const savedGameData: SavedGame = {
    at: now,
    userId: userSession?.userId || 0,
    duration: now - board.gameStartTime,
    outcome: outcomeIds[board.outcome!],
    moveHistory: board.flatSanMoveHistory.join(','),
    diceRollHistory: board.diceRollHistory.join(','),
    humanPlaysWhite: currentGameSettings.humanPlaysColor === WHITE,
  };
  console.log(savedGameData);
  return new Promise((resolve) => {
    const run = async (): Promise<boolean> => {
      const allSavedGames = cachedSavedGames || (await storageApi_loadGames());
      allSavedGames.unshift(savedGameData);
      if (!userSession) {
        console.log('No user session. Saving game on local storage....');
        return await localStorage_saveGame(allSavedGames);
      } else {
        try {
          console.log('trying to save game on db...');
          return await database_saveGame(savedGameData);
        } catch (e) {
          console.error(
            'failed saving game on db. Trying to save on local storage...'
          );
          return await localStorage_saveGame(allSavedGames);
        }
      }
    };
    resolve(run());
  });
}

// Save a game by the user (stored locally on device):
export async function localStorage_saveGame(
  allSavedGames: SavedGame[]
): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const savedGamesDataJSON = JSON.stringify(allSavedGames);
      localStorage.setItem(
        localStorageKeyPrefix + '-games',
        savedGamesDataJSON
      );
      resolve(true);
    }, 1000);
  });
}

// Save a game by the user (stored on database):
async function database_saveGame(savedGameData: SavedGame): Promise<boolean> {
  return new Promise((resolve) => {
    const run = async (): Promise<boolean> => {
      console.log(savedGameData);

      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(savedGameData),
      };
      console.log('req', req);
      const res = await fetch('/api/games/', req);
      console.log('result from db', res);
      if (!res.ok) throw new Error(`fetch Error ${res.status}`);
      const retrievedData = (await res.json()) as SavedGame;
      console.log(retrievedData);
      return true;
    };
    resolve(run());
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
