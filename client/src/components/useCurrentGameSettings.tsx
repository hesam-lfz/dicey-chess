import { useContext } from 'react';
import {
  CurrentGameSettingsContext,
  CurrentGameSettingsContextValues,
} from './CurrentGameSettingsContext';

export function useCurrentGameSettings(): CurrentGameSettingsContextValues {
  const values = useContext(CurrentGameSettingsContext);
  if (!values)
    throw new Error(
      'useCurrentGameSettings can only be used inside a CurrentGameSettingsProvider'
    );
  return values;
}
