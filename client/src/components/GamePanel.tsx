import { useState, useCallback, useEffect } from 'react';
import { board, isAITurn, swapTurn } from '../lib';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { LeftPanel } from './LeftPanel';
import { DicePanel } from './DicePanel';
import { Board } from './Board';
import { BoardLabels } from './BoardLabels';
import { type Color } from 'chess.js';
import './Panels.css';

type Props = {
  currGameId: number;
  currHistory: string[][];
  currReplayModeOn: boolean;
  onGameOver: () => void;
};

export function GamePanel({
  currGameId,
  currHistory,
  currReplayModeOn,
  onGameOver,
}: Props) {
  const { currentGameSettings } = useCurrentGameSettings();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayModeOn] = useState<boolean>(currReplayModeOn);
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
      isAITurn(),
      JSON.stringify(board)
    );
    */
    if (board.gameOver) onGameOver();
    setGameId(currGameId);
    setHistory(currHistory);
    setShouldAlertDiceRoll(false);
  });

  const onMove = useCallback(() => {
    setTurn(board.turn);
    setNumMovesInTurn(board.numMovesInTurn);
    setNumSingleMovesMade((n) => n + 1);
  }, []);

  const onDiceRoll = useCallback(
    (roll: number) => {
      if (roll === 0) {
        // player gets 0 moves. Swap turn:
        swapTurn();
        board.history.push([]);
        roll = -1;
      }
      board.diceRoll = roll;
      board.numMovesInTurn = roll;
      setTurn(board.turn);
      setNumMovesInTurn(roll);
      // if we're in 1-player mode and it's AI's turn, trigger AI move:
      setShouldTriggerAITurn(roll !== -1 && isAITurn(currentGameSettings));
    },
    [currentGameSettings]
  );

  const onAlertDiceRoll = useCallback(() => {
    setShouldAlertDiceRoll(true);
  }, []);

  return (
    <>
      <div className="main-panel">
        <LeftPanel
          currNumSingleMovesMade={numSingleMovesMade}
          currHistory={history}
        />
        <div className="board-panel">
          <BoardLabels
            currHumanPlaysColor={currentGameSettings.humanPlaysColor}
          />
          <Board
            currGameId={gameId}
            currReplayModeOn={replayModeOn}
            currHumanPlaysColor={currentGameSettings.humanPlaysColor}
            currShouldTriggerAITurn={shouldTriggerAITurn}
            containerOnMove={onMove}
            containerOnAlertDiceRoll={onAlertDiceRoll}
          />
        </div>
        <DicePanel
          currGameId={gameId}
          currTurn={turn}
          currNumMovesInTurn={numMovesInTurn}
          currShouldAlertDiceRoll={shouldAlertDiceRoll}
          containerOnDiceRoll={onDiceRoll}
        />
      </div>
    </>
  );
}
