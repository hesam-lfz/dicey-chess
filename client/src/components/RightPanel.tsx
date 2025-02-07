import { useCallback } from 'react';
import { DicePanel } from './DicePanel';
import { board } from '../lib';
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
      <span className="roll-dice-button-border rainbow-colored-border">
        {board.diceRoll === -1 ? (
          <button className="roll-dice-button " onClick={handleRollButtonClick}>
            ROLL DICE
          </button>
        ) : null}
      </span>
      {board.diceRoll === -1 ? null : (
        <span>{board.numMovesInTurn + ' moves left.'} </span>
      )}
      <DicePanel />
    </div>
  );
}
