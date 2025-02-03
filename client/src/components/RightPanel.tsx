import { DicePanel } from './DicePanel';

export function RightPanel() {
  return (
    <div className="right-panel side-panel">
      <h2>Player's Move</h2>
      <DicePanel />
    </div>
  );
}
