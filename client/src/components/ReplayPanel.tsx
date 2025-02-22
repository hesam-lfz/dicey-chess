//import './ReplayPanel.css';

//import { useEffect, useState } from "react";

type Props = {
  currGameId: number;
  containerOnNewGame: () => void;
};

export function ReplayPanel({ /*currGameId, */ containerOnNewGame }: Props) {
  /*
  useEffect(() => {
    setGameId(currGameId);
  }, [currGameId]);
*/

  return (
    <>
      <span className="roll-dice-button-border rainbow-colored-border shadow-grow-and-back">
        <button onClick={containerOnNewGame}>L</button>
        <button onClick={containerOnNewGame}>R</button>
      </span>
      <button onClick={containerOnNewGame}>New Game</button>
    </>
  );
}
