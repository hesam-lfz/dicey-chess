//import { useEffect, useState } from "react";
import { board } from '../lib';
import Icon_ffwd from '../assets/fast-fwd.svg';
import './ReplayPanel.css';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  currGameId: number;
  containerOnStepReplayMoveIndex: (step: number) => void;
};

let replayMoveIndexCallbackBusy = false;

export function ReplayPanel({
  currGameId,
  containerOnStepReplayMoveIndex,
}: Props) {
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayMoveIndex, setReplayMoveIndex] = useState<number>(
    board.replayCurrentFlatIndex
  );
  const [readyToMoveIndex, setReadyToMoveIndex] = useState<boolean>(true);

  // turn moving replay position back on after a short delay to avoid bugs:
  useEffect(() => {
    if (!readyToMoveIndex)
      setTimeout(() => setReadyToMoveIndex(!replayMoveIndexCallbackBusy), 500);
    // if we've just loaded another game, reset the replay index:
    if (gameId !== currGameId) {
      setReplayMoveIndex(board.replayCurrentFlatIndex);
      setGameId(currGameId);
    }
  }, [currGameId, gameId, readyToMoveIndex, setReadyToMoveIndex]);

  const stepReplayMoveIndex = useCallback(
    (step: number) => {
      if (readyToMoveIndex) {
        replayMoveIndexCallbackBusy = true;
        const idx = replayMoveIndex + step;
        if (idx >= 0 && idx < board.historyNumMoves) {
          setReadyToMoveIndex(false);
          setReplayMoveIndex(replayMoveIndex + step);
          containerOnStepReplayMoveIndex(step);
        }
        replayMoveIndexCallbackBusy = false;
      }
    },
    [readyToMoveIndex, replayMoveIndex, containerOnStepReplayMoveIndex]
  );

  return (
    <>
      <h2>Game Replay</h2>
      <div className="replay-controls-box dotted-border flex flex-row flex-align-center">
        <button
          className={
            replayMoveIndexCallbackBusy ||
            !readyToMoveIndex ||
            replayMoveIndex === 0
              ? ' disabled'
              : ''
          }
          onClick={() => stepReplayMoveIndex(-1)}>
          <img
            src={Icon_ffwd}
            className={'replay-control-icon rotate180'}
            alt={'replay-fwd-icon'}
            draggable="false"
          />
        </button>
        <span className="replay-controls-move">
          {replayMoveIndex >= 0
            ? board.flatSanMoveHistory[replayMoveIndex]
            : ''}
        </span>
        <button
          className={
            replayMoveIndexCallbackBusy ||
            !readyToMoveIndex ||
            replayMoveIndex === board.historyNumMoves - 1
              ? ' disabled'
              : ''
          }
          onClick={() => stepReplayMoveIndex(1)}>
          <img
            src={Icon_ffwd}
            className="replay-control-icon"
            alt={'replay-fwd-icon'}
            draggable="false"
          />
        </button>
      </div>
    </>
  );
}
