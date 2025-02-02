import { useState, useEffect, useCallback, MouseEvent } from 'react';
import {
  allFiles,
  allRanks,
  makeMove,
  validateMove,
  promptUserIfPromotionMove,
} from '../lib';
import { WHITE, BLACK, type Color, type Piece, type Square } from 'chess.js';

import Icon_wk from '../assets/king_w.svg';
import Icon_bk from '../assets/king_b.svg';
import Icon_wq from '../assets/queen_w.svg';
import Icon_bq from '../assets/queen_b.svg';
import Icon_wb from '../assets/bishop_w.svg';
import Icon_bb from '../assets/bishop_b.svg';
import Icon_wn from '../assets/knight_w.svg';
import Icon_bn from '../assets/knight_b.svg';
import Icon_wr from '../assets/rook_w.svg';
import Icon_br from '../assets/rook_b.svg';
import Icon_wp from '../assets/pawn_w.svg';
import Icon_bp from '../assets/pawn_b.svg';

const pieceSVGs: { [key: string]: any } = {
  Icon_wk,
  Icon_bk,
  Icon_wq,
  Icon_bq,
  Icon_wb,
  Icon_bb,
  Icon_wn,
  Icon_bn,
  Icon_wr,
  Icon_br,
  Icon_wp,
  Icon_bp,
};

function renderOccupyingPiece(piece?: Piece) {
  if (!piece) return null;
  const color = piece.color;
  const type = piece.type;
  const pieceName = 'Icon_' + (color + type);
  return <img src={pieceSVGs[pieceName]} className="piece" alt={pieceName} />;
}

type Props = {
  initPieces: { [key: string]: Piece };
  initTurn: Color;
};

export function Board({ initPieces, initTurn }: Props) {
  const [turn, setTurn] = useState<Color>(initTurn);
  const [pieces, setPieces] = useState<{ [key: string]: Piece }>(initPieces);
  const [movingFromSq, setMovingFromSq] = useState<Square | null>(null);
  const [movingToSq, setMovingToSq] = useState<Square | null>(null);
  const [prevMoveFromSq, setPrevMoveFromSq] = useState<Square | null>(null);
  const [prevMoveToSq, setPrevMoveToSq] = useState<Square | null>(null);

  const handleMove = useCallback(() => {
    console.log('move', movingFromSq, movingToSq);
    const piece = pieces[movingFromSq!];
    delete pieces[movingFromSq!];
    pieces[movingToSq!] = piece;
    setPrevMoveFromSq(movingFromSq);
    setPrevMoveToSq(movingToSq);
    setMovingFromSq(null);
    setMovingToSq(null);
    setPieces(pieces);
    setTurn(turn === WHITE ? BLACK : WHITE);
    makeMove(
      movingFromSq!,
      movingToSq!,
      promptUserIfPromotionMove(piece, movingToSq!, turn)
    );
  }, [movingFromSq, movingToSq, pieces, turn]);

  useEffect(() => {
    console.log('effect', movingFromSq, movingToSq);
    if (movingFromSq && movingToSq) setTimeout(handleMove, 200);
  });

  function squareClicked(e: MouseEvent<HTMLDivElement>) {
    // find the square element which was clicked on so we can get the square coords:
    let $clickedSq = e.target as HTMLElement;
    if ($clickedSq.tagName === 'IMG')
      $clickedSq = $clickedSq!.closest('.square') ?? $clickedSq;
    const square = $clickedSq.id as Square;
    const clickedPiece = pieces[square];
    if (clickedPiece && clickedPiece.color === turn) setMovingFromSq(square);
    else if (movingFromSq && validateMove(movingFromSq, square))
      setMovingToSq(square);
  }

  return (
    <div className="chessboard" onClick={(e) => squareClicked(e)}>
      {allRanks.map((r) => (
        <div className="chessboard-row" key={String(r)}>
          {allFiles.map((f) => {
            const sq = f + allRanks[8 - r];
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
                {renderOccupyingPiece(pieces[sq])}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
