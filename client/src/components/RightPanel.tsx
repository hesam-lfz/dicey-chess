import { useCallback } from 'react';
import { DicePanel } from './DicePanel';
import { type Color } from 'chess.js';
import './DicePanel.css';

type Props = {
  turn: Color;
  containerOnDiceRoll: (n: number) => void;
};

export function RightPanel({ turn, containerOnDiceRoll }: Props) {
  const handleRollButtonClick = useCallback(() => {
    const roll = Math.floor(Math.random() * 6);
    containerOnDiceRoll(roll);
  }, [containerOnDiceRoll]);

  return (
    <div className="right-panel side-panel">
      <h2>Player {turn}'s Move</h2>
      <span className="rainbow-colored-border">
        <button className="roll-dice-button " onClick={handleRollButtonClick}>
          ROLL DICE
        </button>
      </span>
      <DicePanel />
    </div>
  );
}
