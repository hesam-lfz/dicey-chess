import { HistoryPanel } from './HistoryPanel';

type Props = {
  currNumSingleMovesMade: number;
  containerOnNewGame: () => void;
  containerOnLoadGame: () => void;
};

export function LeftPanel({
  currNumSingleMovesMade,
  containerOnNewGame,
  containerOnLoadGame,
}: Props) {
  return (
    <div className="left-panel side-panel">
      <h2>History</h2>
      <HistoryPanel currNumSingleMovesMade={currNumSingleMovesMade} />
      <span className="rainbow-colored-border">
        <button onClick={containerOnNewGame}>New Game</button>
      </span>
      <span className="rainbow-colored-border">
        <button onClick={containerOnLoadGame}>Load Game</button>
      </span>
    </div>
  );
}
