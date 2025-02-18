import { useEffect, useState } from 'react';
import { allFiles, allFilesReversed, allRanks, allRanksReversed } from '../lib';
import { WHITE, Color } from 'chess.js';

type Props = {
  currHumanPlaysColor: Color;
};

export function BoardLabels({ currHumanPlaysColor }: Props) {
  const [humanPlaysColor, setHumanPlaysColor] =
    useState<Color>(currHumanPlaysColor);

  useEffect(() => {
    setHumanPlaysColor(currHumanPlaysColor);
  }, [currHumanPlaysColor]);
  const idxs = [0, 1];
  const classNames = [
    'chessboard-row chessboard-file-labels',
    'chessboard-col chessboard-rank-labels',
  ];
  const ranks = humanPlaysColor === WHITE ? allRanks : allRanksReversed;
  const files = humanPlaysColor === WHITE ? allFiles : allFilesReversed;
  const allLabels = [files, ranks];
  return (
    <>
      {idxs.map((idx) => {
        return (
          <div
            className={'chessboard-labels ' + classNames[idx]}
            key={idx === 0 ? 'file-labels' : 'rank-labels'}>
            {allLabels[idx].map((f_or_r) => {
              if (idx == 1) f_or_r = 9 - (f_or_r as number);
              const label = 'label-' + f_or_r;
              return (
                <span id={label} className="square" key={label}>
                  {f_or_r}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
