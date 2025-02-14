import { useState, useCallback, useEffect } from 'react';

import { board, isAITurn, swapTurn } from '../lib';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Color } from 'chess.js';
import './Panels.css';

type Props = {
  currGameId: number;
  currHistory: string[][];
  onGameOver: () => void;
};

export function GamePanel({ currGameId, currHistory, onGameOver }: Props) {
  const [gameId, setGameId] = useState<number>(currGameId);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [AITurn, setAITurn] = useState<boolean>(isAITurn());
  const [numSingleMovesMade, setNumSingleMovesMade] = useState<number>(0);
  const [numMovesInTurn, setNumMovesInTurn] = useState<number>(
    board.numMovesInTurn
  );
  const [history, setHistory] = useState<string[][]>(currHistory);

  useEffect(() => {
    if (board.gameOver) onGameOver();
    setGameId(currGameId);
    setHistory(currHistory);
  });

  const onMove = useCallback(() => {
    setTurn(board.turn);
    setNumMovesInTurn(board.numMovesInTurn);
    setNumSingleMovesMade((n) => n + 1);
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
    setAITurn(isAITurn());
  }, []);

  return (
    <>
      <div className="main-panel">
        <LeftPanel
          currNumSingleMovesMade={numSingleMovesMade}
          currHistory={history}
        />
        <div className="board-panel">
          <BoardLabels />
          <Board
            currGameId={gameId}
            currIsAITurn={AITurn}
            containerOnMove={onMove}
          />
        </div>
        <RightPanel
          currGameId={gameId}
          currTurn={turn}
          currNumMovesInTurn={numMovesInTurn}
          containerOnDiceRoll={onDiceRoll}
        />
      </div>
    </>
  );
}
