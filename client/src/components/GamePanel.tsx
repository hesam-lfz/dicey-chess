import { useState, useCallback, useEffect } from 'react';
import {
  board,
  boardEngine,
  DebugOn,
  gameGlobals,
  handleDiceRoll,
  internalSettings,
  isAITurn,
  isGameAgainstAI,
  isOpponentsTurn,
} from '../lib';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { PieceSymbol, type Square } from 'chess.js';
import './Panels.css';

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  onPromotionPromptRequested: (pieceTypes: PieceSymbol[]) => void;
  onGameOver: () => void;
  onNewGame: () => void;
  onLoadGame: () => void;
  onGameMessageToShow: (delay: boolean, msg?: string) => void;
};

export function GamePanel({
  currGameId,
  currReplayModeOn,
  onPromotionPromptRequested,
  onGameOver,
  onNewGame,
  onLoadGame,
  onGameMessageToShow,
}: Props) {
  const { currentGameSettings, currentBoardData, setNewCurrentBoardData } =
    useCurrentGameContext();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(currReplayModeOn);
  const [replayStepMove, setReplayStepMove] = useState<number>(0);
  const [shouldTriggerAITurn, setShouldTriggerAITurn] = useState<boolean>(
    currentBoardData.diceRoll !== -1 &&
      isAITurn(currentGameSettings, currentBoardData)
  );
  const [shouldTriggerAIRoll, setShouldTriggerAIRoll] =
    useState<boolean>(false);
  const [numSingleMovesMade, setNumSingleMovesMade] = useState<number>(0);
  const [shouldAlertDiceRoll, setShouldAlertDiceRoll] =
    useState<boolean>(false);
  const [isMovingDisabled, setIsMovingDisabled] = useState<boolean>(false);

  useEffect(() => {
    if (DebugOn)
      console.log(
        'rendered GamePanel',
        'currentGameSettings',
        currentGameSettings,
        'shouldTriggerAITurn',
        shouldTriggerAITurn,
        'isAITurn()',
        isAITurn(currentGameSettings, currentBoardData),
        JSON.stringify(board),
        replayModeOn,
        currReplayModeOn,
        'busyBoardWaiting',
        board.busyBoardWaiting,
        'busyOpponentWaiting',
        board.busyOpponentWaiting
      );
    if (board.gameOver && !(board.isLoadedGame || currReplayModeOn))
      onGameOver();
    setGameId(currGameId);
    setReplayModeOn(currReplayModeOn);
    setShouldAlertDiceRoll(false);
    // Set board busy flag off since we're done making the move:
    board.busyBoardWaiting = false;
    // if It remains opponents turn, keep busy flag on, else turn it off here since we're done
    // making opponents moves:
    board.busyOpponentWaiting =
      !board.gameOver && isOpponentsTurn(currentGameSettings, currentBoardData);
    // Show any messages that might have been set globally (currently, falling back
    // to stupid ai when ai engine API is blocked):
    if (gameGlobals.dialogMessagesToShow.length > 0)
      onGameMessageToShow(true, gameGlobals.dialogMessagesToShow.shift());
    if (DebugOn)
      console.log(
        'AITurn',
        isAITurn(currentGameSettings, currentBoardData),
        'busyBoardWaiting',
        board.busyBoardWaiting,
        'busyOpponentWaiting',
        board.busyOpponentWaiting
      );
  }, [
    currGameId,
    currReplayModeOn,
    currentBoardData,
    currentGameSettings,
    onGameMessageToShow,
    onGameOver,
    replayModeOn,
    setNewCurrentBoardData,
    shouldTriggerAITurn,
  ]);

  const onMove = useCallback(() => {
    if (DebugOn) console.log('onmove', JSON.stringify(currentBoardData));
    if (replayModeOn) {
      setReplayStepMove(0);
    } else {
      if (
        currentBoardData.numMovesInTurn === -1 &&
        isAITurn(currentGameSettings, currentBoardData)
      )
        setShouldTriggerAITurn(false);
      setNumSingleMovesMade((n) => n + 1);
    }
    if (board.gameOver && !replayModeOn) setReplayModeOn(true);
  }, [currentBoardData, currentGameSettings, replayModeOn]);

  const onDiceRoll = useCallback(
    (roll: number, roll1: number, roll2: number) => {
      async function runSwapTurn() {
        handleDiceRoll(
          currentGameSettings,
          currentBoardData,
          setNewCurrentBoardData,
          roll,
          roll1,
          roll2
        );
        // player got 0 roll, so no moves in this turn...
        // Swap turn, unless player is in check (in which case
        // the player rolls again):
        const currTurnIsAI = isAITurn(currentGameSettings, currentBoardData);
        if (DebugOn)
          console.log(
            'currentBoardData',
            currentBoardData,
            'isGameAgainstAI',
            isGameAgainstAI(currentGameSettings),
            'currTurnIsAI',
            currTurnIsAI,
            'inCheck',
            boardEngine.inCheck()
          );
        if (isGameAgainstAI(currentGameSettings))
          setShouldTriggerAIRoll(currTurnIsAI && boardEngine.inCheck());
        setIsMovingDisabled(false);
      }
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
        setTimeout(runSwapTurn, internalSettings.pauseOnZeroRollDelay);
      }
      // if we're in 1-player mode and it's AI's turn, trigger AI move:
      else {
        setShouldTriggerAITurn(isAITurn(currentGameSettings, currentBoardData));
        handleDiceRoll(
          currentGameSettings,
          currentBoardData,
          setNewCurrentBoardData,
          roll,
          roll1,
          roll2
        );
      }
    },
    [
      currentBoardData,
      currentGameSettings,
      setNewCurrentBoardData,
      shouldTriggerAITurn,
    ]
  );

  const onAlertDiceRoll = useCallback(() => {
    setShouldAlertDiceRoll(true);
  }, []);

  const onStepReplayMoveIndex = useCallback((step: number) => {
    setReplayStepMove(step);
  }, []);

  const latestBoardMove =
    board.flatSquareMoveHistory[
      board.gameOver ? board.replayCurrentFlatIndex : board.historyNumMoves - 1
    ];

  return (
    <>
      <div className="main-panel">
        <LeftPanel
          currNumSingleMovesMade={numSingleMovesMade}
          containerOnNewGame={onNewGame}
          containerOnLoadGame={onLoadGame}
        />
        <div>
          <div className="board-panel">
            <BoardLabels
              currUserPlaysColor={currentGameSettings.userPlaysColor}
            />
            <Board
              currGameId={gameId}
              currReplayModeOn={replayModeOn}
              currReplayStepMove={replayStepMove}
              currPrevMoveFromSq={(latestBoardMove?.from as Square) || null}
              currPrevMoveToSq={(latestBoardMove?.to as Square) || null}
              currUserPlaysColor={currentGameSettings.userPlaysColor}
              currShouldTriggerAITurn={shouldTriggerAITurn}
              currIsMovingDisabled={isMovingDisabled}
              containerOnMove={onMove}
              containerOnAlertDiceRoll={onAlertDiceRoll}
              containerOnPromotionPromptRequested={onPromotionPromptRequested}
            />
          </div>

          <div
            className={
              'waiting-opponent-msg' +
              (!replayModeOn &&
              isOpponentsTurn(currentGameSettings, currentBoardData)
                ? ''
                : ' invisible')
            }>
            <span>Waiting for opponent move...</span>
          </div>
        </div>
        <RightPanel
          currGameId={gameId}
          currReplayModeOn={replayModeOn}
          currShouldTriggerAIRoll={shouldTriggerAIRoll}
          currShouldAlertDiceRoll={shouldAlertDiceRoll}
          containerOnDiceRoll={onDiceRoll}
          containerOnStepReplayMoveIndex={onStepReplayMoveIndex}
        />
      </div>
    </>
  );
}
