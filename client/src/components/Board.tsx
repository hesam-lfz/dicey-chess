import { useState, useEffect, useCallback, MouseEvent } from 'react';
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
  currentGameSettings,
} from '../lib';
import { WHITE, type Piece, type Square } from 'chess.js';

function renderOccupyingPiece(piece?: Piece) {
  if (!piece) return null;
  const color = piece.color;
  const type = piece.type;
  const pieceName = 'Icon_' + (color + type);
  return <img src={pieceSVGs[pieceName]} className="piece" alt={pieceName} />;
}

type Props = {
  currGameId: number;
  currShouldTriggerAITurn: boolean;
  containerOnMove: () => void;
  containerOnAlertDiceRoll: () => void;
};

export function Board({
  currGameId,
  currShouldTriggerAITurn,
  containerOnMove,
  containerOnAlertDiceRoll,
}: Props) {
  const [gameId, setGameId] = useState<number>(currGameId);
  const [shouldTriggerAITurn, setShouldTriggerAITurn] = useState<boolean>(
    currShouldTriggerAITurn
  );
  const [movingFromSq, setMovingFromSq] = useState<Square | null>(null);
  const [movingToSq, setMovingToSq] = useState<Square | null>(null);
  const [pawnPromotion, setPawnPromotion] = useState<string | undefined>(
    undefined
  );
  const [prevMoveFromSq, setPrevMoveFromSq] = useState<Square | null>(null);
  const [prevMoveToSq, setPrevMoveToSq] = useState<Square | null>(null);

  const handleMove = useCallback(() => {
    setPrevMoveFromSq(movingFromSq);
    setPrevMoveToSq(movingToSq);
    setMovingFromSq(null);
    setMovingToSq(null);
    makeMove(movingFromSq!, movingToSq!, pawnPromotion);
    setShouldTriggerAITurn(false);
    containerOnMove();
  }, [movingFromSq, movingToSq, pawnPromotion, containerOnMove]);

  const triggerAIMove = useCallback(() => {
    const run = async () => {
      const move = await getAIMove();
      setMovingFromSq(move.from);
      setMovingToSq(move.to);
      setPawnPromotion(move.promotion);
    };
    run();
  }, []);

  useEffect(() => {
    const run = async () => {
      // if the 'from' and 'to' of a move were just determined, ready to execute the move:
      if (movingFromSq && movingToSq) {
        setTimeout(handleMove, 200);
        return;
      }
      // mechanism to trigger AI move automatically, if needed (part two):
      if (shouldTriggerAITurn) {
        setTimeout(triggerAIMove, settings.AIMoveDelay);
        return;
      }
      // mechanism to trigger AI move automatically, if needed (part one)
      if (isAITurn() && !board.gameOver) {
        setShouldTriggerAITurn(currShouldTriggerAITurn);
        return;
      }
      // we're resetting the game:
      if (currGameId !== gameId) {
        setPrevMoveFromSq(null);
        setPrevMoveToSq(null);
      }
      setGameId(currGameId);
    };
    run();
  }, [
    movingFromSq,
    movingToSq,
    handleMove,
    currGameId,
    currShouldTriggerAITurn,
    shouldTriggerAITurn,
    gameId,
    triggerAIMove,
  ]);

  const squareClicked = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // if dice isn't rolled yet clicking is not allowed:
      if (board.diceRoll === -1) {
        // alert user they need to roll dice first:
        containerOnAlertDiceRoll();
        return;
      }
      // if the game is over, clicking is not allowed:
      if (board.gameOver) return;
      // if in 1-player mode and it's not player's turn, clicking is not allowed:
      if (isAITurn()) return;
      // find the square element which was clicked on so we can get the square coords:
      let $clickedSq = e.target as HTMLElement;
      if ($clickedSq.tagName === 'IMG')
        $clickedSq = $clickedSq!.closest('.square') ?? $clickedSq;
      const square = $clickedSq.id as Square;
      const clickedPiece = getSquarePiece(square);
      if (clickedPiece && clickedPiece.color === board.turn)
        setMovingFromSq(square);
      else if (movingFromSq && validateMove(movingFromSq, square)) {
        setMovingToSq(square);
        setPawnPromotion(
          promptUserIfPromotionMove(movingFromSq, square, board.turn)
        );
      }
    },
    [movingFromSq, containerOnAlertDiceRoll]
  );

  // Draw the chess board:
  const ranks =
    currentGameSettings.humanPlaysColor === WHITE ? allRanks : allRanksReversed;
  const files =
    currentGameSettings.humanPlaysColor === WHITE ? allFiles : allFilesReversed;
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
