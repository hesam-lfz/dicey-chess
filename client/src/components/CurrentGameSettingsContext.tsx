import { createContext, useState } from 'react';
import { type CurrentGameSettings, loadSettings, resetBoard } from '../lib';
import { WHITE } from 'chess.js';

export type CurrentGameSettingsContextValues = {
  currentGameSettings: CurrentGameSettings;
  setNewCurrentGameSettings: () => void;
};

export const CurrentGameSettingsContext =
  createContext<CurrentGameSettingsContextValues>({
    currentGameSettings: { humanPlaysColor: WHITE },
    setNewCurrentGameSettings: () => undefined,
  });

type Props = {
  children: React.ReactNode;
};

export function CurrentGameSettingsProvider({ children }: Props) {
  const [currentGameSettings, setCurrentGameSettings] =
    useState<CurrentGameSettings>({
      humanPlaysColor: WHITE,
    });

  function setNewCurrentGameSettings(): void {
    setCurrentGameSettings({ ...currentGameSettings });
  }

  const currentGameSettingsContextValues = {
    currentGameSettings,
    setNewCurrentGameSettings,
  };

  // At page refresh or each time a setting is changed, we want to reset/reload the current
  // game settings and reset the board:
  // Load initial settings:
  console.log('load settings...');
  loadSettings(currentGameSettings);

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
