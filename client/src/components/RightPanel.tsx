import { useState, useEffect } from 'react';
import { DicePanel } from '../components/DicePanel';
import { ReplayPanel } from '../components/ReplayPanel';
import { type Color } from 'chess.js';

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  currTurn: Color;
  currNumMovesInTurn: number;
  currShouldTriggerAIRoll: boolean;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number, n1: number, n2: number) => void;
  containerOnStepReplayMoveIndex: (n: number) => void;
};

export function RightPanel({
  currGameId,
  currReplayModeOn,
  currTurn,
  currNumMovesInTurn,
  currShouldTriggerAIRoll,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
  containerOnStepReplayMoveIndex,
}: Props) {
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
          currNumMovesInTurn={currNumMovesInTurn}
          currShouldTriggerAIRoll={currShouldTriggerAIRoll}
          currShouldAlertDiceRoll={currShouldAlertDiceRoll}
          containerOnDiceRoll={containerOnDiceRoll}
        />
      )}
    </div>
  );
}
