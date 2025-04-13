import { ReactElement, useEffect, useRef, useCallback } from 'react';
import { board } from '../lib';

type Props = {
  currNumSingleMovesMade: number;
};

export function HistoryPanel({ currNumSingleMovesMade }: Props) {
  const historyItemsRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // scroll to the bottom of the history:
    historyItemsRef!.current!.scrollTop =
      historyItemsRef!.current!.scrollHeight;
  }, [currNumSingleMovesMade]);

  const getAllHistoryItems = useCallback((): ReactElement[] => {
    const allHistoryItems: ReactElement[] = [];
    let moveCtr = 1;
    board.history.forEach((moveSet, msIdx) => {
      const whiteMove = msIdx % 2 === 0;
      const liClass = 'text-align-' + (whiteMove ? 'start' : 'end');
      const moveSetLabel = 'history-moveset-' + msIdx + '-';
      if (whiteMove)
        allHistoryItems.push(
          <li key={moveSetLabel} className={liClass}>
            {moveCtr++ + '. '}
          </li>
        );
      const roll = board.diceRollHistory[msIdx];
      if (roll !== undefined)
        allHistoryItems.push(
          <li key={moveSetLabel + '-roll'} className={liClass}>
            {'(#' + roll + ')'}
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
    return allHistoryItems;
  }, []);

  return (
    <div className="history-panel dotted-border" ref={historyItemsRef}>
      <ul className="history-items">{getAllHistoryItems()}</ul>
    </div>
  );
}
