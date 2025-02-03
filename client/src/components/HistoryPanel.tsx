import { ReactElement, useEffect, useState, useRef } from 'react';

type Props = {
  initHistory: string[][];
};

export function HistoryPanel({ initHistory }: Props) {
  const historyItemsRef = useRef<null | HTMLDivElement>(null);

  const [history] = useState<string[][]>(initHistory);

  // scroll to the bottom of the history:
  useEffect(() => {
    historyItemsRef!.current!.scrollTop =
      historyItemsRef!.current!.scrollHeight;
  });

  const allHistoryItems: ReactElement[] = [];
  let moveCtr = 1;
  history.forEach((moveSet, msIdx) => {
    const whiteMove = msIdx % 2 === 0;
    const liClass = 'justify-self-' + (whiteMove ? 'start' : 'end');
    const moveSetLabel = 'history-moveset-' + msIdx + '-';
    moveSet.forEach((move, mIdx) => {
      allHistoryItems.push(
        <li key={moveSetLabel + mIdx} className={liClass}>
          {(whiteMove && mIdx === 0 ? '' + moveCtr++ + '. ' : '') + move}
        </li>
      );
    });
  });

  return (
    <div className="history-panel" ref={historyItemsRef}>
      <ul className="history-items">{allHistoryItems}</ul>
    </div>
  );
}
