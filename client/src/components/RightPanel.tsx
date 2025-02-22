import { useState, useEffect, useCallback, useRef } from 'react';
import { DicePanel } from '../components/DicePanel';
import { ReplayPanel } from '../components/ReplayPanel';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { board, isAITurn } from '../lib';
import { type Color } from 'chess.js';

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  currTurn: Color;
  currNumMovesInTurn: number;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number) => void;
  containerOnStepReplayMoveIndex: (n: number) => void;
};

export function RightPanel({
  currGameId,
  currReplayModeOn,
  currTurn,
  currNumMovesInTurn,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
  containerOnStepReplayMoveIndex,
}: Props) {
  const rollDiceButtonBorderRef = useRef<null | HTMLSpanElement>(null);
  const { currentGameSettings } = useCurrentGameSettings();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(currReplayModeOn);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [numMovesInTurn, setNumMovesInTurn] =
    useState<number>(currNumMovesInTurn);
  const [AIMoveTriggered, setAIMoveTriggered] = useState<boolean>(false);

  const handleRollButtonClick = useCallback(() => {
    const roll = Math.floor(Math.random() * 5);
    //console.log('rolled', roll);
    setNumMovesInTurn(roll);
    containerOnDiceRoll(roll);
  }, [containerOnDiceRoll]);

  useEffect(() => {
    setTurn(board.turn);
    setGameId(currGameId);
    setReplayModeOn(currReplayModeOn);
    setNumMovesInTurn(currNumMovesInTurn);
    /*
    console.log(
      'rendered RightPanel',
      currGameId,
      'currTurn',
      currTurn,
      'currNumMovesInTurn',
      currNumMovesInTurn,
      'AIMoveTriggered',
      AIMoveTriggered,
      'isAITurn()',
      isAITurn(currentGameSettings),
      JSON.stringify(board)
    );
    */
    // If it's AI's turn, trigger dice roll automatically:
    if (isAITurn(currentGameSettings) && !board.gameOver) {
      if (!AIMoveTriggered) {
        //console.log('roll trigger');
        setAIMoveTriggered(true);
        setTimeout(handleRollButtonClick, 500);
      }
    } else setAIMoveTriggered(false);
    // if user was clicking somewhere else while they need to be rolling dice,
    // alert them with some animation to show them where they need to click:
    if (currShouldAlertDiceRoll) {
      rollDiceButtonBorderRef!.current?.classList.remove(
        'shadow-grow-and-back'
      );
      setTimeout(() => {
        rollDiceButtonBorderRef!.current?.classList.add('shadow-grow-and-back');
      }, 100);
    }
  }, [
    currNumMovesInTurn,
    currGameId,
    gameId,
    currTurn,
    turn,
    AIMoveTriggered,
    currShouldAlertDiceRoll,
    handleRollButtonClick,
    currentGameSettings,
    currReplayModeOn,
  ]);

  return (
    <div className="right-panel side-panel">
      {replayModeOn ? (
        <ReplayPanel
          currGameId={gameId}
          containerOnStepReplayMoveIndex={containerOnStepReplayMoveIndex}
        />
      ) : (
        <DicePanel
          currGameId={gameId}
          currTurn={turn}
          currNumMovesInTurn={numMovesInTurn}
          currShouldAlertDiceRoll={currShouldAlertDiceRoll}
          containerOnDiceRoll={containerOnDiceRoll}
        />
      )}
    </div>
  );
}
