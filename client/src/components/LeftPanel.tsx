import { HistoryPanel } from './HistoryPanel';

type Props = {
  currNumSingleMovesMade: number;
  currHistory: string[][];
};

export function LeftPanel({ currNumSingleMovesMade, currHistory }: Props) {
  return (
    <div className="left-panel side-panel">
      <h2>History</h2>
      <HistoryPanel
        currNumSingleMovesMade={currNumSingleMovesMade}
        currHistory={currHistory}
      />
    </div>
  );
}
