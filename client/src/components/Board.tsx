import { useState, useEffect, useCallback, MouseEvent } from 'react';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import {
  pieceSVGs,
  allFiles,
  allFilesReversed,
  allRanks,
  allRanksReversed,
  getSquarePiece,
  makeMove,
  validateMove,
  promptUserIfPromotionMove,
  board,
  isAITurn,
  getAIMove,
  settings,
  boardReplayStepMove,
  BasicMove,
} from '../lib';
import { Color, WHITE, type Piece, type Square } from 'chess.js';

function renderOccupyingPiece(piece?: Piece) {
  if (!piece) return null;
  const color = piece.color;
  const type = piece.type;
  const pieceName = 'Icon_' + (color + type);
  return (
    <img
      src={pieceSVGs[pieceName]}
      className="piece"
      alt={pieceName}
      draggable="false"
    />
  );
}

type Props = {
  currGameId: number;
  currReplayModeOn: boolean;
  currReplayStepMove: number;
  currPrevMoveFromSq: Square | null;
  currPrevMoveToSq: Square | null;
  currHumanPlaysColor: Color;
  currShouldTriggerAITurn: boolean;
  containerOnMove: () => void;
  containerOnAlertDiceRoll: () => void;
};

export function Board({
  currGameId,
  currReplayModeOn,
  currReplayStepMove,
  currPrevMoveFromSq,
  currPrevMoveToSq,
  currHumanPlaysColor,
  currShouldTriggerAITurn,
  containerOnMove,
  containerOnAlertDiceRoll,
}: Props) {
  const { currentGameSettings } = useCurrentGameSettings();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(currReplayModeOn);
  const [replayStepMove, setReplayStepMove] =
    useState<number>(currReplayStepMove);
  const [replayStepMoveTriggered, setReplayStepMoveTriggered] =
    useState<boolean>(false);
  const [humanPlaysColor, setHumanPlaysColor] =
    useState<Color>(currHumanPlaysColor);
  const [shouldTriggerAITurn, setShouldTriggerAITurn] = useState<boolean>(
    currShouldTriggerAITurn
  );
  const [movingFromSq, setMovingFromSq] = useState<Square | null>(null);
  const [movingToSq, setMovingToSq] = useState<Square | null>(null);
  const [pawnPromotion, setPawnPromotion] = useState<string | undefined>(
    undefined
  );
  const [prevMoveFromSq, setPrevMoveFromSq] = useState<Square | null>(
    currPrevMoveFromSq
  );
  const [prevMoveToSq, setPrevMoveToSq] = useState<Square | null>(
    currPrevMoveToSq
  );

  const handleMove = useCallback(() => {
    setPrevMoveFromSq(movingFromSq);
    setPrevMoveToSq(movingToSq);
    setMovingFromSq(null);
    setMovingToSq(null);
    if (replayModeOn) {
      setReplayStepMoveTriggered(false);
    } else {
      makeMove(currentGameSettings, movingFromSq!, movingToSq!, pawnPromotion);
      setShouldTriggerAITurn(false);
    }
    containerOnMove();
  }, [
    movingFromSq,
    movingToSq,
    pawnPromotion,
    replayModeOn,
    currentGameSettings,
    containerOnMove,
  ]);

  const triggerAIMove = useCallback(() => {
    const run = async () => {
      const move: BasicMove = await getAIMove(board.numMovesInTurn === 1);
      //console.log('getAIMove got', move);
      setMovingFromSq(move.from);
      setMovingToSq(move.to);
      setPawnPromotion(move.promotion);
    };
    run();
  }, []);

  // Move to next/prev move during game replay:
  const triggerReplayStepMove = useCallback((step: number) => {
    const run = async () => {
      const move = boardReplayStepMove(step);
      if (move) {
        setMovingFromSq(move.from);
        setMovingToSq(move.to);
        setPawnPromotion(move.promotion);
      } else {
        setPrevMoveFromSq(null);
        setPrevMoveToSq(null);
        setMovingFromSq(null);
        setMovingToSq(null);
        setPawnPromotion(undefined);
      }
      setReplayStepMove(0);
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      console.log(
        'rendered Board',
        'currGameId',
        currGameId,
        'gameId',
        gameId,
        'movingFromSq',
        movingFromSq,
        'movingToSq',
        movingToSq,
        'prevMoveFromSq',
        prevMoveFromSq,
        'prevMoveToSq',
        prevMoveToSq,
        'currShouldTriggerAITurn',
        currShouldTriggerAITurn,
        'shouldTriggerAITurn',
        shouldTriggerAITurn,
        'isAITurn()',
        isAITurn(currentGameSettings),
        'replayModeOn',
        replayModeOn,
        'replayStepMove',
        replayStepMove,
        'currReplayStepMove',
        currReplayStepMove,
        'replayStepMoveTriggered',
        replayStepMoveTriggered,
        JSON.stringify(board)
      );

      // if the 'from' and 'to' of a move were just determined, ready to execute the move:
      if (movingFromSq && movingToSq) {
        replayModeOn
          ? handleMove()
          : setTimeout(handleMove, settings.makeMoveDelay);
        return;
      }

      if (replayModeOn) {
        if (replayStepMove !== 0) {
          if (!replayStepMoveTriggered) {
            //console.log('replay trigger move', replayStepMove);
            setReplayStepMoveTriggered(true);
            triggerReplayStepMove(replayStepMove);
          }
          return;
        }
      } else {
        // mechanism to trigger AI move automatically, if needed (part two):
        if (shouldTriggerAITurn) {
          //console.log('triggering move');
          setTimeout(triggerAIMove, settings.AIMoveDelay);
          return;
        }
        // mechanism to trigger AI move automatically, if needed (part one)
        if (isAITurn(currentGameSettings) && !board.gameOver) {
          setShouldTriggerAITurn(currShouldTriggerAITurn);
          return;
        }
      }
      // we're resetting the game:
      if (currGameId !== gameId) {
        setPrevMoveFromSq(null);
        setPrevMoveToSq(null);
      }
      setGameId(currGameId);
      setReplayModeOn(currReplayModeOn);
      setReplayStepMove(currReplayStepMove);
      if (replayModeOn || currPrevMoveFromSq)
        setPrevMoveFromSq(currPrevMoveFromSq);
      if (replayModeOn || currPrevMoveToSq) setPrevMoveToSq(currPrevMoveToSq);
      setHumanPlaysColor(currHumanPlaysColor);
    };
    run();
  }, [
    movingFromSq,
    movingToSq,
    handleMove,
    currGameId,
    currHumanPlaysColor,
    currShouldTriggerAITurn,
    shouldTriggerAITurn,
    gameId,
    triggerAIMove,
    currentGameSettings,
    currReplayModeOn,
    replayModeOn,
    currReplayStepMove,
    replayStepMove,
    replayStepMoveTriggered,
    triggerReplayStepMove,
    currPrevMoveFromSq,
    currPrevMoveToSq,
    prevMoveFromSq,
    prevMoveToSq,
  ]);

  const squareClicked = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // if the game is over or we're in replay mode, clicking is not allowed:
      if (board.gameOver) return;
      // if dice isn't rolled yet clicking is not allowed:
      if (board.diceRoll === -1) {
        // alert user they need to roll dice first:
        containerOnAlertDiceRoll();
        return;
      }
      // if in 1-player mode and it's not player's turn, clicking is not allowed:
      if (isAITurn(currentGameSettings)) return;
      // find the square element which was clicked on so we can get the square coords:
      let $clickedSq = e.target as HTMLElement;
      if ($clickedSq.tagName === 'IMG')
        $clickedSq = $clickedSq!.closest('.square') ?? $clickedSq;
      const square = $clickedSq.id as Square;
      const clickedPiece = getSquarePiece(square);
      if (clickedPiece && clickedPiece.color === board.turn)
        setMovingFromSq(square);
      else if (
        movingFromSq &&
        validateMove(movingFromSq, square, board.numMovesInTurn === 1)
      ) {
        setMovingToSq(square);
        setPawnPromotion(
          promptUserIfPromotionMove(movingFromSq, square, board.turn)
        );
      }
    },
    [movingFromSq, currentGameSettings, containerOnAlertDiceRoll]
  );

  // Draw the chess board:
  const ranks = humanPlaysColor === WHITE ? allRanks : allRanksReversed;
  const files = humanPlaysColor === WHITE ? allFiles : allFilesReversed;
  return (
    <div className="chessboard" onClick={(e) => squareClicked(e)}>
      {ranks.map((r) => (
        <div className="chessboard-row" key={String(r)}>
          {files.map((f) => {
            const sq = (f + allRanks[8 - r]) as Square;
            let squareClasses = 'square';
            if (movingFromSq === sq)
              squareClasses +=
                ' border-highlighted-square highlighted-square-from';
            else if (movingToSq === sq)
              squareClasses +=
                ' border-highlighted-square highlighted-square-to';
            else if (prevMoveFromSq === sq || prevMoveToSq === sq)
              squareClasses += ' highlighted-square-prev-move';
            return (
              <div id={sq} className={squareClasses} key={sq}>
                {renderOccupyingPiece(getSquarePiece(sq))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
