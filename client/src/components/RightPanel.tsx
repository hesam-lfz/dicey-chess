import { useState, useEffect, useCallback, useRef } from 'react';
import { DicePanel } from './DicePanel';
import { board, isAITurn, playerIconSVGs } from '../lib';
import { type Color } from 'chess.js';
import Icon_dice from '../assets/dice.svg';
import './DicePanel.css';

type Props = {
  currGameId: number;
  currTurn: Color;
  currNumMovesInTurn: number;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number) => void;
};

export function RightPanel({
  currGameId,
  currTurn,
  currNumMovesInTurn,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
}: Props) {
  const rollDiceButtonBorderRef = useRef<null | HTMLSpanElement>(null);

  const [gameId, setGameId] = useState<number>(currGameId);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [numMovesInTurn, setNumMovesInTurn] =
    useState<number>(currNumMovesInTurn);
  const [AIMoveTriggered, setAIMoveTriggered] = useState<boolean>(false);

  const handleRollButtonClick = useCallback(() => {
    const roll = Math.floor(Math.random() * 5);
    //console.log('rolled', roll);
    setNumMovesInTurn(roll);
    containerOnDiceRoll(roll);
  }, [containerOnDiceRoll]);

  useEffect(() => {
    setTurn(board.turn);
    setGameId(currGameId);
    setNumMovesInTurn(currNumMovesInTurn);
    /*
    console.log(
      'rendered RightPanel',
      currGameId,
      'currTurn',
      currTurn,
      'currNumMovesInTurn',
      currNumMovesInTurn,
      'AIMoveTriggered',
      AIMoveTriggered,
      'isAITurn()',
      isAITurn(),
      JSON.stringify(board)
    );
    */
    // If it's AI's turn, trigger dice roll automatically:
    if (isAITurn() && !board.gameOver) {
      if (!AIMoveTriggered) {
        //console.log('roll trigger');
        setAIMoveTriggered(true);
        setTimeout(handleRollButtonClick, 500);
      }
    } else setAIMoveTriggered(false);
    // if user was clicking somewhere else while they need to be rolling dice,
    // alert them with some animation to show them where they need to click:
    if (currShouldAlertDiceRoll) {
      rollDiceButtonBorderRef!.current?.classList.remove(
        'shadow-grow-and-back'
      );
      setTimeout(() => {
        rollDiceButtonBorderRef!.current?.classList.add('shadow-grow-and-back');
      }, 100);
    }
  }, [
    currNumMovesInTurn,
    currGameId,
    gameId,
    currTurn,
    turn,
    AIMoveTriggered,
    currShouldAlertDiceRoll,
    handleRollButtonClick,
  ]);

  return (
    <div className="right-panel side-panel">
      <div className="player-turn-title-box flex flex-align-center">
        {
          <div className={'square player-icon-container'}>
            <img
              src={playerIconSVGs[turn]}
              className="piece play-icon"
              alt={'player-icon-' + turn}
            />
          </div>
        }
        <span>'s Move</span>
      </div>
      {board.diceRoll === -1 && !isAITurn() ? (
        <span
          className="roll-dice-button-border rainbow-colored-border shadow-grow-and-back"
          ref={rollDiceButtonBorderRef}>
          <button className="roll-dice-button " onClick={handleRollButtonClick}>
            <img src={Icon_dice} className="dice-icon" alt={'dice-icon'} />
          </button>
        </span>
      ) : null}
      {board.diceRoll === -1 ? null : (
        <span>
          {numMovesInTurn +
            ' move' +
            (numMovesInTurn > 1 ? 's' : '') +
            ' left.'}{' '}
        </span>
      )}
      <DicePanel />
    </div>
  );
}
