// A context to keep track of current game data: user auth, settings selection,
// current board data...

import { createContext, useState, useEffect } from 'react';
import {
  type CurrentGameSettings,
  type CurrentBoardData,
  type User,
  loadSettings,
  resetBoard,
  readToken,
  readUser,
  removeAuth,
  saveAuth,
  storageApi_handleSignInOut,
  DebugOn,
} from '../lib';
import { WHITE } from 'chess.js';

export type CurrentGameContextValues = {
  currentGameSettings: CurrentGameSettings;
  setNewCurrentGameSettings: () => void;
  currentBoardData: CurrentBoardData;
  setNewCurrentBoardData: () => void;
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

const defaultCurrentGameSettings: CurrentGameSettings = {
  gameId: 0,
  userPlaysColor: WHITE,
  opponentIsAI: true,
  opponent: 'AI',
};

const defaultCurrentBoardData: CurrentBoardData = {
  diceRoll: -1,
  diceRoll1: -1,
  diceRoll2: -1,
  numMovesInTurn: -1,
};

export const CurrentGameContext = createContext<CurrentGameContextValues>({
  currentGameSettings: defaultCurrentGameSettings,
  setNewCurrentGameSettings: () => undefined,
  currentBoardData: defaultCurrentBoardData,
  setNewCurrentBoardData: () => undefined,
  user: undefined,
  token: undefined,
  handleSignIn: () => undefined,
  handleSignOut: () => undefined,
});

type Props = {
  children: React.ReactNode;
};

let gameInitDone = false;

export function CurrentGameContextProvider({ children }: Props) {
  const [currentGameSettings, setCurrentGameSettings] =
    useState<CurrentGameSettings>(defaultCurrentGameSettings);
  const [currentBoardData, setCurrentBoardData] = useState<CurrentBoardData>(
    defaultCurrentBoardData
  );
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  function setNewCurrentGameSettings(): void {
    setCurrentGameSettings({ ...currentGameSettings });
  }

  function setNewCurrentBoardData(): void {
    setCurrentBoardData({ ...currentBoardData });
  }

  const currentGameContextValues = {
    currentGameSettings,
    setNewCurrentGameSettings,
    currentBoardData,
    setNewCurrentBoardData,
    user,
    token,
    handleSignIn,
    handleSignOut,
  };

  // Read any pre-existing user session stored in local storage:
  useEffect(() => {
    setUser(readUser());
    setToken(readToken());
  }, []);

  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    saveAuth(user, token);
    storageApi_handleSignInOut();
  }

  function handleSignOut() {
    setUser(undefined);
    setToken(undefined);
    removeAuth();
    storageApi_handleSignInOut();
  }

  if (!gameInitDone) {
    gameInitDone = true;
    // At page refresh or each time a setting is changed, we want to reset/reload the current
    // game settings and reset the board:
    // Load initial settings:
    if (DebugOn) console.log('load settings...');
    loadSettings(currentGameSettings, setNewCurrentGameSettings);
    if (DebugOn) console.log(currentGameSettings);

    // FIXME: This needs to be somewhere else??
    // Reset the board:
    if (DebugOn) console.log('reset board...');
    resetBoard(currentGameSettings, currentBoardData);
  }

  return (
    <CurrentGameContext.Provider value={currentGameContextValues}>
      {children}
    </CurrentGameContext.Provider>
  );
}
