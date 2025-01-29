export function Board() {
  return (
    <div className="chessboard">
      {[...Array(8).keys()].map((row) => (
        <div className="chessboard-row" key={String(row)}>
          {[...Array(8).keys()].map((col) => (
            <div className="square" key={String(col)}></div>
          ))}
        </div>
      ))}
    </div>
  );
}
