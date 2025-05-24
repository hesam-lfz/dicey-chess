import { useContext } from 'react';
import {
  CurrentGameContext,
  CurrentGameContextValues,
} from '../components/CurrentGameContext';

export function useCurrentGameContext(): CurrentGameContextValues {
  const values = useContext(CurrentGameContext);
  if (!values)
    throw new Error(
      'CurrentGameContext can only be used inside a CurrentGameProvider'
    );
  return values;
}
