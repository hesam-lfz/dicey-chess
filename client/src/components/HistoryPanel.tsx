import { useState } from 'react';

type Props = {
  initHistory: string[];
};

export function HistoryPanel({ initHistory }: Props) {
  const [history] = useState<string[]>(initHistory);

  return (
    <div className="history-panel">
      <ul>
        {history
          .filter((_, index) => index % 2 === 0)
          .map((m) => (
            <li>{m}</li>
          ))}
      </ul>
      <ul>
        {history
          .filter((_, index) => index % 2 !== 0)
          .map((m) => (
            <li>{m}</li>
          ))}
      </ul>
    </div>
  );
}
