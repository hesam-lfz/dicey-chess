import { HistoryPanel } from './HistoryPanel';
import { useCurrentGameContext } from './useCurrentGameContext';

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
  const { user } = useCurrentGameContext();
  return (
    <div className="left-panel side-panel">
      <h2>History</h2>
      <HistoryPanel currNumSingleMovesMade={currNumSingleMovesMade} />
      {user ? (
        <div className="player-rank-box">
          <h2>Player Rank</h2>
          <div className="dotted-border">
            <span className="player-rank">{user.rank}</span>
          </div>
        </div>
      ) : null}
      <span className="rainbow-colored-border">
        <button onClick={containerOnNewGame}>New Game</button>
      </span>
      <span className="rainbow-colored-border">
        <button onClick={containerOnLoadGame}>Load Game</button>
      </span>
    </div>
  );
}
