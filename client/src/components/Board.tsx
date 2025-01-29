import { Pieces } from './Pieces';
import { allFiles, allRanks } from '../lib';

export function Board() {
  return (
    <div className="chessboard-and-pieces">
      <div className="chessboard">
        {[...Array(8).keys()].map((row) => (
          <div className="chessboard-row" key={String(row)}>
            {[...Array(8).keys()].map((col) => (
              <div
                id={allFiles[col] + allRanks[7 - row]}
                className="square"
                key={String(col)}></div>
            ))}
          </div>
        ))}
      </div>
      <Pieces />
    </div>
  );
}
