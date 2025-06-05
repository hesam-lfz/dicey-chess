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
  SetCurrentBoardData,
  isGameAgainstOnlineFriend,
  onlineGameApi_close,
  resetSettings,
  gameAffectsPlayerRank,
  calculateAndStorePlayerNewRank,
} from '../lib';
import { WHITE } from 'chess.js';

export type CurrentGameContextValues = {
  currentGameSettings: CurrentGameSettings;
  setNewCurrentGameSettings: () => void;
  currentBoardData: CurrentBoardData;
  getCurrentBoardData: () => CurrentBoardData;
  setNewCurrentBoardData: (
    data: SetCurrentBoardData,
    setState: boolean
  ) => void;
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

// Settings specific for a given game:
const defaultCurrentGameSettings: CurrentGameSettings = {
  chessAiEngine_fallbackActivated: false,
  gameId: 0,
  userPlaysColor: WHITE,
  opponentIsAI: true,
  opponent: 'AI',
};

const defaultCurrentBoardData: CurrentBoardData = {
  version: 0,
  turn: WHITE,
  diceRoll: -1,
  diceRoll1: -1,
  diceRoll2: -1,
  numMovesInTurn: -1,
  currMoveFromSq: null,
  currMoveToSq: null,
  currMovePromotion: null,
};

export const CurrentGameContext = createContext<CurrentGameContextValues>({
  currentGameSettings: defaultCurrentGameSettings,
  setNewCurrentGameSettings: () => undefined,
  currentBoardData: defaultCurrentBoardData,
  getCurrentBoardData: () => defaultCurrentBoardData,
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
  const [onlineGameAbortedCallback, setOnlineGameAbortedCallback] = useState<
    () => void
  >(() => undefined);
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  function setNewCurrentGameSettings(): void {
    setCurrentGameSettings({ ...currentGameSettings });
  }

  const getCurrentBoardData = () => currentBoardData;

  function setNewCurrentBoardData(
    data: SetCurrentBoardData,
    setState: boolean = true
  ): void {
    const setCurrentBoardDataFromPrev = (
      prevCurrentBoardData: CurrentBoardData
    ) => {
      const isOnlineGame = isGameAgainstOnlineFriend(currentGameSettings);
      if (DebugOn)
        console.log(
          'isOnlineGame',
          isOnlineGame,
          'setNewCurrentBoardData current',
          JSON.stringify(prevCurrentBoardData),
          'data',
          data
        );
      if (data.turn !== undefined) prevCurrentBoardData.turn = data.turn;
      if (data.diceRoll !== undefined)
        prevCurrentBoardData.diceRoll = data.diceRoll;
      if (data.diceRoll1 !== undefined)
        prevCurrentBoardData.diceRoll1 = data.diceRoll1;
      if (data.diceRoll2 !== undefined)
        prevCurrentBoardData.diceRoll2 = data.diceRoll2;
      if (data.numMovesInTurn !== undefined)
        prevCurrentBoardData.numMovesInTurn = data.numMovesInTurn;
      if (data.currMoveFromSq !== undefined)
        prevCurrentBoardData.currMoveFromSq = data.currMoveFromSq;
      if (data.currMoveToSq !== undefined)
        prevCurrentBoardData.currMoveToSq = data.currMoveToSq;
      if (data.currMovePromotion !== undefined)
        prevCurrentBoardData.currMovePromotion = data.currMovePromotion;
      prevCurrentBoardData.version += 1;
      if (DebugOn)
        console.log(
          'setNewCurrentBoardData result',
          JSON.stringify(prevCurrentBoardData)
        );
      return setState ? { ...prevCurrentBoardData } : prevCurrentBoardData;
    };
    setCurrentBoardData(setCurrentBoardDataFromPrev);
  }

  function setNewOnlineGameAbortedCallback(fn: () => void): void {
    setOnlineGameAbortedCallback(fn);
  }

  const currentGameContextValues = {
    currentGameSettings,
    setNewCurrentGameSettings,
    currentBoardData,
    getCurrentBoardData,
    setNewCurrentBoardData,
    onlineGameAbortedCallback,
    setNewOnlineGameAbortedCallback,
    user,
    token,
    handleSignIn,
    handleSignOut,
  };

  // Read any pre-existing user session stored in local storage:
  useEffect(() => {
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
      resetBoard(
        currentGameSettings,
        setNewCurrentGameSettings,
        setNewCurrentBoardData
      );
    }

    const u = readUser();
    setUser(u);
    setToken(readToken());
    // if user in session, update player rank in case of page refresh or tab close
    // since it would be considered a resign:
    if (u) {
      const handlePageRefresh = (event: Event) => {
        // if in the middle of a game, update player rank due to resign:
        if (gameAffectsPlayerRank(currentGameSettings, u, false)) {
          // Standard-compliant method to prevent the prompt
          event.preventDefault();
          calculateAndStorePlayerNewRank(currentGameSettings, u!);
          // Chrome requires the following line to trigger the dialog.
          event.returnValue = true;
          return '';
        }
      };
      window.addEventListener('beforeunload', handlePageRefresh);
      return () => {
        window.removeEventListener('beforeunload', handlePageRefresh);
      };
    }
  }, [currentGameSettings]);

  function handleSignIn(user: User, token: string) {
    setUser(user);
    setToken(token);
    saveAuth(user, token);
    storageApi_handleSignInOut();
  }

  function handleSignOut() {
    // If we're currently in a game with an online friend, close the web socket
    // connection:
    if (isGameAgainstOnlineFriend(currentGameSettings)) onlineGameApi_close();
    // if in the middle of a game, update player rank due to resign:
    if (gameAffectsPlayerRank(currentGameSettings, user, false))
      calculateAndStorePlayerNewRank(currentGameSettings, user!);
    // Reset settings/board:
    resetSettings(currentGameSettings, setNewCurrentGameSettings, false, false);
    resetBoard(
      currentGameSettings,
      setNewCurrentGameSettings,
      setNewCurrentBoardData
    );
    // Sign out:
    setUser(undefined);
    setToken(undefined);
    removeAuth();
    storageApi_handleSignInOut();
  }

  return (
    <CurrentGameContext.Provider value={currentGameContextValues}>
      {children}
    </CurrentGameContext.Provider>
  );
}
