import { useState, useEffect, useCallback, MouseEvent } from 'react';
import {
  allFiles,
  allRanks,
  allSquares,
  Color,
  validateMove,
  type Piece,
} from '../lib';

import WhiteK from '../assets/king_w.svg';
import BlackK from '../assets/king_b.svg';
import WhiteQ from '../assets/queen_w.svg';
import BlackQ from '../assets/queen_b.svg';
import WhiteB from '../assets/bishop_w.svg';
import BlackB from '../assets/bishop_b.svg';
import WhiteN from '../assets/knight_w.svg';
import BlackN from '../assets/knight_b.svg';
import WhiteR from '../assets/rook_w.svg';
import BlackR from '../assets/rook_b.svg';
import WhiteP from '../assets/pawn_w.svg';
import BlackP from '../assets/pawn_b.svg';

const pieceSVGs: { [key: string]: any } = {
  WhiteK,
  BlackK,
  WhiteQ,
  BlackQ,
  WhiteB,
  BlackB,
  WhiteN,
  BlackN,
  WhiteR,
  BlackR,
  WhiteP,
  BlackP,
};

function renderOccupyingPiece(piece?: Piece) {
  if (!piece) return null;
  const color = String(piece.color);
  const type = String(piece.type);
  const pieceName = color + type;
  return <img src={pieceSVGs[pieceName]} className="piece" alt={pieceName} />;
}

type Props = {
  initPieces: { [key: string]: Piece };
  initTurn: Color;
};

export function Board({ initPieces, initTurn }: Props) {
  const [turn, setTurn] = useState<Color>(initTurn);
  const [pieces, setPieces] = useState<{ [key: string]: Piece }>(initPieces);
  const [movingFromSq, setMovingFromSq] = useState<string>('');
  const [movingToSq, setMovingToSq] = useState<string>('');

  const handleMove = useCallback(() => {
    console.log('move', movingFromSq, movingToSq);
    const piece = pieces[movingFromSq];
    delete pieces[movingFromSq];
    pieces[movingToSq] = piece;
    piece.square = allSquares[movingToSq];
    setMovingFromSq('');
    setMovingToSq('');
    setPieces(pieces);
    setTurn(turn === Color.White ? Color.Black : Color.White);
  }, [movingFromSq, movingToSq, pieces, turn]);

  useEffect(() => {
    console.log('effect', movingFromSq, movingToSq);
    if (
      movingFromSq &&
      movingToSq &&
      validateMove(pieces[movingFromSq], allSquares[movingToSq])
    )
      setTimeout(handleMove, 200);
  });

  function squareClicked(e: MouseEvent<HTMLDivElement>) {
    // find the square element which was clicked on so we can get the square coords:
    let $clickedSq = e.target as HTMLElement;
    if ($clickedSq.tagName === 'IMG')
      $clickedSq = $clickedSq!.closest('.square') ?? $clickedSq;
    const square = $clickedSq.id;
    const clickedPiece = pieces[square];
    if (clickedPiece && clickedPiece.color === turn) setMovingFromSq(square);
    else if (movingFromSq) setMovingToSq(square);
  }

  return (
    <div className="chessboard" onClick={(e) => squareClicked(e)}>
      {allRanks.map((r) => (
        <div className="chessboard-row" key={String(r)}>
          {allFiles.map((f) => {
            const sq = f + allRanks[8 - r];
            return (
              <div
                id={sq}
                className={
                  'square' +
                  (movingFromSq === sq
                    ? ' highlighted-square highlighted-square-from'
                    : movingToSq === sq
                    ? ' highlighted-square highlighted-square-to'
                    : '')
                }
                key={sq}>
                {renderOccupyingPiece(pieces[sq])}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
