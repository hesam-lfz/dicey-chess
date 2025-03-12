import { useState, useCallback, useEffect } from 'react';
import { board, boardEngine, DebugOn, isAITurn, swapTurn } from '../lib';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Square, type Color } from 'chess.js';
import './Panels.css';

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  onGameOver: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
};

export function GamePanel({
  currGameId,
  currReplayModeOn,
  onGameOver,
  onNewGame,
  onLoadGame,
}: Props) {
  const { currentGameSettings } = useCurrentGameSettings();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(currReplayModeOn);
  const [replayStepMove, setReplayStepMove] = useState<number>(0);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [shouldTriggerAITurn, setShouldTriggerAITurn] = useState<boolean>(
    board.diceRoll !== -1 && isAITurn(currentGameSettings)
  );
  const [numSingleMovesMade, setNumSingleMovesMade] = useState<number>(0);
  const [numMovesInTurn, setNumMovesInTurn] = useState<number>(
    board.numMovesInTurn
  );
  const [shouldAlertDiceRoll, setShouldAlertDiceRoll] =
    useState<boolean>(false);
  const [isMovingDisabled, setIsMovingDisabled] = useState<boolean>(false);

  useEffect(() => {
    /*
    console.log(
      'rendered GamePanel',
      'shouldTriggerAITurn',
      shouldTriggerAITurn,
      'isAITurn()',
      isAITurn(currentGameSettings),
      JSON.stringify(board),
      replayModeOn,
      currReplayModeOn
    );
    */
    if (board.gameOver && !(board.isLoadedGame || replayModeOn)) onGameOver();
    setGameId(currGameId);
    setReplayModeOn(currReplayModeOn);
    setShouldAlertDiceRoll(false);
  });

  const onMove = useCallback(() => {
    if (replayModeOn) {
      setReplayStepMove(0);
    } else {
      if (DebugOn) console.log('onmove', board.turn, board.numMovesInTurn);
      setTurn(board.turn);
      setNumMovesInTurn(board.numMovesInTurn);
      if (board.numMovesInTurn === -1 && isAITurn(currentGameSettings))
        setShouldTriggerAITurn(false);
      setNumSingleMovesMade((n) => n + 1);
    }
  }, [currentGameSettings, replayModeOn]);

  const onDiceRoll = useCallback(
    (roll: number, roll1: number, roll2: number) => {
      async function runSwapTurn() {
        // player got 0 roll, so no moves in this turn...
        // Swap turn, unless player is in check (in which case
        // the player rolls again):
        const playerInCheck = boardEngine.inCheck();
        if (playerInCheck) {
          // pop the last roll so player in check can re-roll dice:
          board.diceRollHistory.pop();
        } else {
          swapTurn();
          board.history.push([]);
          setTurn(board.turn);
        }
        roll = -1;
        board.diceRoll = roll;
        setNumMovesInTurn(roll);
        setIsMovingDisabled(false);
      }
      board.diceRollHistory.push(roll);
      board.diceRoll = roll;
      board.diceRoll1 = roll1;
      board.diceRoll2 = roll2;
      board.numMovesInTurn = roll;
      setTurn(board.turn);
      setNumMovesInTurn(roll);
      if (DebugOn)
        console.log(
          'onroll',
          'roll',
          roll,
          '<-',
          roll1,
          roll2,
          'shouldTriggerAITurn',
          shouldTriggerAITurn
        );

      // add a bit of delay if the roll was 0 and we're changing turn:
      if (roll == 0) {
        setIsMovingDisabled(true);
        setShouldTriggerAITurn(false);
        setTimeout(runSwapTurn, 2000);
      }
      // if we're in 1-player mode and it's AI's turn, trigger AI move:
      else setShouldTriggerAITurn(isAITurn(currentGameSettings));
    },
    [currentGameSettings, shouldTriggerAITurn]
  );

  const onAlertDiceRoll = useCallback(() => {
    setShouldAlertDiceRoll(true);
  }, []);

  const onStepReplayMoveIndex = useCallback((step: number) => {
    setReplayStepMove(step);
  }, []);

  const currReplayMove = board.gameOver
    ? board.flatSquareMoveHistory[board.replayCurrentFlatIndex]
    : null;

  return (
    <>
      <div className="main-panel">
        <LeftPanel
          currNumSingleMovesMade={numSingleMovesMade}
          containerOnNewGame={onNewGame}
          containerOnLoadGame={onLoadGame}
        />
        <div className="board-panel">
          <BoardLabels
            currHumanPlaysColor={currentGameSettings.humanPlaysColor}
          />
          <Board
            currGameId={gameId}
            currReplayModeOn={replayModeOn}
            currReplayStepMove={replayStepMove}
            currPrevMoveFromSq={
              board.gameOver ? (currReplayMove!.from as Square) : null
            }
            currPrevMoveToSq={
              board.gameOver ? (currReplayMove!.to as Square) : null
            }
            currHumanPlaysColor={currentGameSettings.humanPlaysColor}
            currShouldTriggerAITurn={shouldTriggerAITurn}
            currIsMovingDisabled={isMovingDisabled}
            containerOnMove={onMove}
            containerOnAlertDiceRoll={onAlertDiceRoll}
          />
        </div>
        <RightPanel
          currGameId={gameId}
          currReplayModeOn={replayModeOn}
          currTurn={turn}
          currNumMovesInTurn={numMovesInTurn}
          currShouldAlertDiceRoll={shouldAlertDiceRoll}
          containerOnDiceRoll={onDiceRoll}
          containerOnStepReplayMoveIndex={onStepReplayMoveIndex}
        />
      </div>
    </>
  );
}
