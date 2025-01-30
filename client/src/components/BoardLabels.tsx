import { allFiles, allRanks } from '../lib';

export function BoardLabels() {
  const idxs = [0, 1];
  const classNames = [
    'chessboard-row chessboard-file-labels',
    'chessboard-col chessboard-rank-labels',
  ];
  const allLabels = [allFiles, allRanks];
  return (
    <>
      {idxs.map((idx) => {
        return (
          <div className={'chessboard-labels ' + classNames[idx]}>
            {allLabels[idx].map((f_or_r) => {
              if (idx == 1) f_or_r = 9 - (f_or_r as number);
              const label = 'label-' + f_or_r;
              console.log(label);
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
