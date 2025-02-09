import { useState, useCallback, useEffect } from 'react';

import { board, swapTurn } from '../lib';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Color } from 'chess.js';
import './Panels.css';

type Props = {
  onGameOver: () => void;
};

export function GamePanel({ onGameOver }: Props) {
  const [turn, setTurn] = useState<Color>(board.turn);
  const [numMovesInTurn, setNumMovesInTurn] = useState<number>(-1);
  const [history] = useState<string[][]>(board.history);

  useEffect(() => {
    if (board.gameOver) onGameOver();
  });

  const onMove = useCallback(() => {
    setTurn(board.turn);
    setNumMovesInTurn(board.numMovesInTurn);
  }, []);
  const onDiceRoll = useCallback((roll: number) => {
    if (roll === 0) {
      swapTurn();
      roll = -1;
    }
    board.diceRoll = roll;
    board.numMovesInTurn = roll;
    setTurn(board.turn);
    setNumMovesInTurn(roll);
  }, []);

  return (
    <>
      <div className="main-panel">
        <LeftPanel initHistory={history} />
        <div className="board-panel">
          <BoardLabels />
          <Board containerOnMove={onMove} />
        </div>
        <RightPanel
          turn={turn}
          currNumMovesInTurn={numMovesInTurn}
          containerOnDiceRoll={onDiceRoll}
        />
      </div>
    </>
  );
}
