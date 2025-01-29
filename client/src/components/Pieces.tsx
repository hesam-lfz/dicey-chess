import kingW from '../assets/king_w.svg';
import kingB from '../assets/king_b.svg';
import queenW from '../assets/queen_w.svg';
import queenB from '../assets/queen_b.svg';
import bishopW from '../assets/bishop_w.svg';
import bishopB from '../assets/bishop_b.svg';
import knightW from '../assets/knight_w.svg';
import knightB from '../assets/knight_b.svg';
import rookW from '../assets/rook_w.svg';
import rookB from '../assets/rook_b.svg';
import pawnW from '../assets/pawn_w.svg';
import pawnB from '../assets/pawn_b.svg';

export function Pieces() {
  return (
    <>
      <img src={kingW} className="piece" alt="piece" />
      <img src={kingB} className="piece" alt="piece" />
      <img src={bishopW} className="piece" alt="piece" />
      <img src={bishopB} className="piece" alt="piece" />
      <img src={queenW} className="piece" alt="piece" />
      <img src={queenB} className="piece" alt="piece" />
      <img src={knightW} className="piece" alt="piece" />
      <img src={knightB} className="piece" alt="piece" />
      <img src={rookW} className="piece" alt="piece" />
      <img src={rookB} className="piece" alt="piece" />
      <img src={pawnW} className="piece" alt="piece" />
      <img src={pawnB} className="piece" alt="piece" />
    </>
  );
}
