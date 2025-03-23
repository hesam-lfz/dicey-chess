import { useState, useEffect } from 'react';
import { DicePanel } from '../components/DicePanel';
import { ReplayPanel } from '../components/ReplayPanel';
import { WHITE, type Color } from 'chess.js';
import { useCurrentGameContext } from './useCurrentGameContext';
import { playerIconSVGs, shorten } from '../lib';

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  currTurn: Color;
  currShouldTriggerAIRoll: boolean;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number, n1: number, n2: number) => void;
  containerOnStepReplayMoveIndex: (n: number) => void;
};

export function RightPanel({
  currGameId,
  currReplayModeOn,
  currTurn,
  currShouldTriggerAIRoll,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
  containerOnStepReplayMoveIndex,
}: Props) {
  const { currentGameSettings, user } = useCurrentGameContext();
  const [replayModeOn, setReplayModeOn] = useState<boolean>(currReplayModeOn);

  useEffect(() => {
    setReplayModeOn(currReplayModeOn);
  }, [currReplayModeOn]);

  return (
    <div className="right-panel side-panel">
      {replayModeOn ? (
        <ReplayPanel
          currGameId={currGameId}
          containerOnStepReplayMoveIndex={containerOnStepReplayMoveIndex}
        />
      ) : (
        <DicePanel
          currGameId={currGameId}
          currTurn={currTurn}
          currShouldTriggerAIRoll={currShouldTriggerAIRoll}
          currShouldAlertDiceRoll={currShouldAlertDiceRoll}
          containerOnDiceRoll={containerOnDiceRoll}
        />
      )}
      <div className={'player-names-box'}>
        <h2>Players</h2>
        <div className="dotted-border">
          <div className="flex flex-row">
            <img
              src={
                playerIconSVGs[
                  currentGameSettings.userPlaysColor === WHITE ? 'b' : 'w'
                ]
              }
              className="piece play-icon"
              alt="player-names-box-icon-opponent"
            />
            <span className="player-name">
              {shorten(currentGameSettings.opponent, 10)}
            </span>
          </div>

          <hr className="line-separator" />
          <div className="flex flex-row">
            <img
              src={playerIconSVGs[currentGameSettings.userPlaysColor]}
              className="piece play-icon"
              alt="player-names-box-icon-user"
            />
            <span className="player-name">
              {user ? shorten(user.username, 10) : 'You'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
