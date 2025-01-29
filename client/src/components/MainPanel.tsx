import { useEffect, useState } from 'react';
import { getAIMove } from '../lib';
import { LeftPanel } from '../components/LeftPanel';
import { RightPanel } from '../components/RightPanel';

import { Board } from '../components/Board';
import './MainPanel.css';

export function MainPanel() {
  const [serverData, setServerData] = useState('');

  useEffect(() => {
    async function getServerData() {
      setServerData(await getAIMove());
    }
    getServerData();
  }, []);

  return (
    <>
      <div className="main-panel">
        <LeftPanel />
        <div className="board-panel">
          <Board />
        </div>
        <RightPanel />
      </div>
      <h1>{serverData}</h1>
    </>
  );
}
