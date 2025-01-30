import { allFiles, allRanks, allPieces, Piece } from '../lib';
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

export function Board() {
  return (
    <div className="chessboard">
      {allRanks.map((r) => (
        <div className="chessboard-row" key={String(r)}>
          {allFiles.map((f) => {
            const sq = f + allRanks[8 - r];
            return (
              <div id={sq} className="square" key={sq}>
                {renderOccupyingPiece(allPieces[sq])}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
