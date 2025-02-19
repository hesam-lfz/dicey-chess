import { ReactElement, useEffect, useState, useRef } from 'react';

type Props = {
  currNumSingleMovesMade: number;
  currHistory: string[][];
};

export function HistoryPanel({ currNumSingleMovesMade, currHistory }: Props) {
  const historyItemsRef = useRef<null | HTMLDivElement>(null);
  const [history, setHistory] = useState<string[][]>(currHistory);

  // scroll to the bottom of the history:
  useEffect(() => {
    historyItemsRef!.current!.scrollTop =
      historyItemsRef!.current!.scrollHeight;
    setHistory(currHistory);
  }, [currNumSingleMovesMade, currHistory]);

  const allHistoryItems: ReactElement[] = [];
  let moveCtr = 1;
  history.forEach((moveSet, msIdx) => {
    const whiteMove = msIdx % 2 === 0;
    const liClass = 'justify-self-' + (whiteMove ? 'start' : 'end');
    const moveSetLabel = 'history-moveset-' + msIdx + '-';
    if (whiteMove)
      allHistoryItems.push(
        <li key={moveSetLabel} className={liClass}>
          {moveCtr++ + '. '}
        </li>
      );
    moveSet.forEach((move, mIdx) => {
      allHistoryItems.push(
        <li key={moveSetLabel + mIdx} className={liClass}>
          {move}
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
