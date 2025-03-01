import { useState, useCallback, useEffect } from 'react';
import { board, isAITurn, swapTurn } from '../lib';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Square, type Color } from 'chess.js';
import './Panels.css';

type Props = {
  currGameId: number;
  currHistory: string[][];
  currReplayModeOn: boolean;
  onGameOver: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
};

export function GamePanel({
  currGameId,
  currHistory,
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
  const [history, setHistory] = useState<string[][]>(currHistory);
  const [shouldAlertDiceRoll, setShouldAlertDiceRoll] =
    useState<boolean>(false);

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
    setHistory(currHistory);
    setReplayModeOn(currReplayModeOn);
    setShouldAlertDiceRoll(false);
    console.log('rendered GamePanel', currHistory);
  });

  const onMove = useCallback(() => {
    if (replayModeOn) {
      setReplayStepMove(0);
    } else {
      setTurn(board.turn);
      setNumMovesInTurn(board.numMovesInTurn);
      setNumSingleMovesMade((n) => n + 1);
    }
  }, [replayModeOn]);

  const onDiceRoll = useCallback(
    (roll: number, roll1: number, roll2: number) => {
      async function runSwapTurn() {
        // player gets 0 moves. Swap turn:
        swapTurn();
        board.history.push([]);
        roll = -1;
        board.diceRoll = roll;
        setTurn(board.turn);
        setNumMovesInTurn(roll);
      }
      board.diceRollHistory.push(roll);
      board.diceRoll = roll;
      board.diceRoll1 = roll1;
      board.diceRoll2 = roll2;
      board.numMovesInTurn = roll;
      setTurn(board.turn);
      setNumMovesInTurn(roll);

      // add a bit of delay if the roll was 0 and we're changing turn:
      if (roll == 0) setTimeout(runSwapTurn, 2000);
      // if we're in 1-player mode and it's AI's turn, trigger AI move:
      else setShouldTriggerAITurn(isAITurn(currentGameSettings));
    },
    [currentGameSettings]
  );

  const onAlertDiceRoll = useCallback(() => {
    setShouldAlertDiceRoll(true);
  }, []);

  const onStepReplayMoveIndex = useCallback((step: number) => {
    setReplayStepMove(step);
  }, []);

  const currReplayMove = board.isLoadedGame
    ? board.flatSquareMoveHistory[board.replayCurrentFlatIndex]
    : null;

  return (
    <>
      <div className="main-panel">
        <LeftPanel
          currNumSingleMovesMade={numSingleMovesMade}
          currHistory={history}
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
              board.isLoadedGame ? (currReplayMove!.from as Square) : null
            }
            currPrevMoveToSq={
              board.isLoadedGame ? (currReplayMove!.to as Square) : null
            }
            currHumanPlaysColor={currentGameSettings.humanPlaysColor}
            currShouldTriggerAITurn={shouldTriggerAITurn}
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
