import { useState } from 'react';

import { board } from '../lib';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';
import { Board } from '../components/Board';
import { BoardLabels } from '../components/BoardLabels';
import './Panels.css';

export function MainPanel() {
  const [history, setHistory] = useState<string[]>(board.history);

  function onMove() {
    setHistory([...history]);
  }

  return (
    <>
      <div className="main-panel">
        <LeftPanel initHistory={history} />
        <div className="board-panel">
          <BoardLabels />
          <Board
            initTurn={board.turn}
            initHistory={history}
            containerOnMove={onMove}
          />
        </div>
        <RightPanel />
      </div>
    </>
  );
}
