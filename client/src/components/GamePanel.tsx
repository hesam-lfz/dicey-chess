import { useState, useCallback } from 'react';

import { board } from '../lib';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import './Panels.css';

export function GamePanel() {
  const [numMoves, setNumMoves] = useState<number>(0);
  const [history] = useState<string[][]>(board.history);

  const onMove = useCallback(() => setNumMoves(numMoves + 1), [numMoves]);

  return (
    <>
      <div className="main-panel">
        <LeftPanel initHistory={history} />
        <div className="board-panel">
          <BoardLabels />
          <Board initTurn={board.turn} containerOnMove={onMove} />
        </div>
        <RightPanel />
      </div>
    </>
  );
}
