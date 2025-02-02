import { HistoryPanel } from './HistoryPanel';

type Props = {
  initHistory: string[];
};

export function LeftPanel({ initHistory }: Props) {
  return (
    <div className="left-panel side-panel">
      <h2>History</h2>
      <HistoryPanel initHistory={initHistory} />
    </div>
  );
}
