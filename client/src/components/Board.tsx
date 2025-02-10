import { useState, useEffect, useCallback, MouseEvent } from 'react';
import {
  pieceSVGs,
  allFiles,
  allRanks,
  getSquarePiece,
  makeMove,
  validateMove,
  promptUserIfPromotionMove,
  board,
  settings,
} from '../lib';
import { type Piece, type Square } from 'chess.js';

function renderOccupyingPiece(piece?: Piece) {
  if (!piece) return null;
  const color = piece.color;
  const type = piece.type;
  const pieceName = 'Icon_' + (color + type);
  return <img src={pieceSVGs[pieceName]} className="piece" alt={pieceName} />;
}

type Props = {
  currGameId: number;
  containerOnMove: () => void;
};

export function Board({ currGameId, containerOnMove }: Props) {
  const [gameId, setGameId] = useState<number>(currGameId);
  const [movingFromSq, setMovingFromSq] = useState<Square | null>(null);
  const [movingToSq, setMovingToSq] = useState<Square | null>(null);
  const [prevMoveFromSq, setPrevMoveFromSq] = useState<Square | null>(null);
  const [prevMoveToSq, setPrevMoveToSq] = useState<Square | null>(null);

  const handleMove = useCallback(() => {
    setPrevMoveFromSq(movingFromSq);
    setPrevMoveToSq(movingToSq);
    setMovingFromSq(null);
    setMovingToSq(null);
    makeMove(
      movingFromSq!,
      movingToSq!,
      promptUserIfPromotionMove(movingFromSq!, movingToSq!, board.turn)
    );
    containerOnMove();
  }, [movingFromSq, movingToSq, containerOnMove]);

  useEffect(() => {
    if (movingFromSq && movingToSq) setTimeout(handleMove, 200);
    if (currGameId !== gameId) {
      setPrevMoveFromSq(null);
      setPrevMoveToSq(null);
    }
    setGameId(currGameId);
  }, [movingFromSq, movingToSq, handleMove, currGameId, gameId]);

  const squareClicked = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // if dice isn't rolled yet or the game is over, clicking is not allowed:
      if (board.diceRoll === -1 || board.gameOver) return;
      // if in 1-player mode and it's not player's turn, clicking is not allowed:
      if (settings.onePlayerMode && board.turn !== settings.humanPlaysColor)
        return;
      // find the square element which was clicked on so we can get the square coords:
      let $clickedSq = e.target as HTMLElement;
      if ($clickedSq.tagName === 'IMG')
        $clickedSq = $clickedSq!.closest('.square') ?? $clickedSq;
      const square = $clickedSq.id as Square;
      const clickedPiece = getSquarePiece(square);
      if (clickedPiece && clickedPiece.color === board.turn)
        setMovingFromSq(square);
      else if (movingFromSq && validateMove(movingFromSq, square))
        setMovingToSq(square);
    },
    [movingFromSq]
  );

  return (
    <div className="chessboard" onClick={(e) => squareClicked(e)}>
      {allRanks.map((r) => (
        <div className="chessboard-row" key={String(r)}>
          {allFiles.map((f) => {
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
