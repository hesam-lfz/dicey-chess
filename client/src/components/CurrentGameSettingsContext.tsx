// A context to keep track of current user auth and settings selection...

import { createContext, useState, useEffect } from 'react';
import {
  type CurrentGameSettings,
  loadSettings,
  resetBoard,
  readToken,
  readUser,
  removeAuth,
  saveAuth,
  User,
  storageApi_handleSignInOut,
} from '../lib';
import { WHITE } from 'chess.js';

export type CurrentGameSettingsContextValues = {
  currentGameSettings: CurrentGameSettings;
  setNewCurrentGameSettings: () => void;
  user: User | undefined;
  token: string | undefined;
  handleSignIn: (user: User, token: string) => void;
  handleSignOut: () => void;
};

export const CurrentGameSettingsContext =
  createContext<CurrentGameSettingsContextValues>({
    currentGameSettings: { userPlaysColor: WHITE, opponent: 'AI' },
    setNewCurrentGameSettings: () => undefined,
    user: undefined,
    token: undefined,
    handleSignIn: () => undefined,
    handleSignOut: () => undefined,
  });

type Props = {
  children: React.ReactNode;
};

export function CurrentGameSettingsProvider({ children }: Props) {
  const [currentGameSettings, setCurrentGameSettings] =
    useState<CurrentGameSettings>({
      userPlaysColor: WHITE,
      opponent: 'AI',
    });
  const [user, setUser] = useState<User>();
  const [token, setToken] = useState<string>();

  function setNewCurrentGameSettings(): void {
    setCurrentGameSettings({ ...currentGameSettings });
  }

  const currentGameSettingsContextValues = {
    currentGameSettings,
    setNewCurrentGameSettings,
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

  // At page refresh or each time a setting is changed, we want to reset/reload the current
  // game settings and reset the board:
  // Load initial settings:
  console.log('load settings...');
  loadSettings(currentGameSettings);

  // FIXME: This needs to be somewhere else??
  // Reset the board:
  console.log('reset board...');
  resetBoard();

  return (
    <CurrentGameSettingsContext.Provider
      value={currentGameSettingsContextValues}>
      {children}
    </CurrentGameSettingsContext.Provider>
  );
}
