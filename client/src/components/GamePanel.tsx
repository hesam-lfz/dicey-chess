import { useState, useCallback } from 'react';

import { board, swapTurn } from '../lib';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Color } from 'chess.js';
import './Panels.css';

export function GamePanel() {
  const [turn, setTurn] = useState<Color>(board.turn);
  const [diceRoll, setDiceRoll] = useState<number>(-1);
  const [history] = useState<string[][]>(board.history);

  const onMove = useCallback(() => setTurn(board.turn), []);
  const onDiceRoll = useCallback((roll: number) => {
    console.log('roll!', roll);
    if (roll === 0) {
      swapTurn();
      roll = -1;
    }
    board.diceRoll = roll;
    board.numMovesInTurn = roll;
    setDiceRoll(roll);
  }, []);

  return (
    <>
      <div className="main-panel">
        <LeftPanel initHistory={history} />
        <div className="board-panel">
          <BoardLabels />
          <Board
            currTurn={board.turn}
            currDiceRoll={diceRoll}
            containerOnMove={onMove}
          />
        </div>
        <RightPanel turn={turn} containerOnDiceRoll={onDiceRoll} />
      </div>
    </>
  );
}
