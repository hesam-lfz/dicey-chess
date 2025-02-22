//import { useEffect, useState } from "react";
import { board } from '../lib';
import Icon_ffwd from '../assets/fast-fwd.svg';
import './ReplayPanel.css';
import { useCallback, useState } from 'react';

type Props = {
  currGameId: number;
  containerOnNewGame: () => void;
};

export function ReplayPanel({ /*currGameId, */ containerOnNewGame }: Props) {
  const [replayMoveIndex, setReplayMoveIndex] = useState<number>(
    board.historyNumMoves - 1
  );

  const stepReplayMoveIndex = useCallback(
    (step: number) => {
      const idx = replayMoveIndex + step;
      if (idx >= 0 && idx < board.historyNumMoves)
        setReplayMoveIndex(replayMoveIndex + step);
    },
    [replayMoveIndex]
  );

  /*
  useEffect(() => {
    setGameId(currGameId);
  }, [currGameId]);
*/

  return (
    <>
      <h2>Game Replay</h2>
      <div className="replay-controls-box dotted-border flex flex-row flex-align-center">
        <button
          className={replayMoveIndex === 0 ? ' disabled' : ''}
          onClick={() => stepReplayMoveIndex(-1)}>
          <img
            src={Icon_ffwd}
            className={'replay-control-icon rotate180'}
            alt={'replay-fwd-icon'}
          />
        </button>
        <span className="replay-controls-move">
          {board.flatHistory[replayMoveIndex]}
        </span>
        <button
          className={
            replayMoveIndex === board.historyNumMoves - 1 ? ' disabled' : ''
          }
          onClick={() => stepReplayMoveIndex(1)}>
          <img
            src={Icon_ffwd}
            className="replay-control-icon"
            alt={'replay-fwd-icon'}
          />
        </button>
      </div>
      <span className="rainbow-colored-border">
        <button onClick={containerOnNewGame}>New Game</button>
      </span>
    </>
  );
}
