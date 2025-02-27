import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { board, diceSVGs, isAITurn, playerIconSVGs } from '../lib';
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

export function DicePanel({
  currGameId,
  currTurn,
  currNumMovesInTurn,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
}: Props) {
  const rollDiceButtonBorderRef = useRef<null | HTMLSpanElement>(null);
  const { currentGameSettings } = useCurrentGameSettings();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [numMovesInTurn, setNumMovesInTurn] =
    useState<number>(currNumMovesInTurn);
  const [AIMoveTriggered, setAIMoveTriggered] = useState<boolean>(false);
  const [roll1, setRoll1] = useState<number>(0);
  const [roll2, setRoll2] = useState<number>(0);
  const handleRollButtonClick = useCallback(() => {
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const roll = Math.abs(roll1 - roll2);
    //console.log('rolled', roll);
    setNumMovesInTurn(roll);
    setRoll1(roll1);
    setRoll2(roll2);
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
      isAITurn(currentGameSettings),
      JSON.stringify(board)
    );
    */
    // If it's AI's turn, trigger dice roll automatically:
    if (isAITurn(currentGameSettings) && !board.gameOver) {
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
    currentGameSettings,
  ]);

  const isZeroRoll = roll1 === roll2;
  const diceClassName = 'dice-box-icon' + (isZeroRoll ? ' dice-0' : '');
  return (
    <>
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
      <div className="dice-area">
        {board.diceRoll === -1 && !isAITurn(currentGameSettings) ? (
          <span
            className="roll-dice-button-border rainbow-colored-border shadow-grow-and-back"
            ref={rollDiceButtonBorderRef}>
            <button
              className="roll-dice-button"
              onClick={handleRollButtonClick}>
              <img src={Icon_dice} className="dice-icon" alt={'dice-icon'} />
            </button>
          </span>
        ) : (
          <div className="dice-icons-box">
            <img
              className={diceClassName}
              src={diceSVGs['Icon_Dice' + roll1]}
              alt="dice-left-logo"
            />
            <img
              className={diceClassName}
              src={diceSVGs['Icon_Dice' + roll2]}
              alt="dice-right-logo"
            />
          </div>
        )}
        {board.diceRoll === -1 ? null : (
          <p className="num-moves-left-text">
            <span className="num-moves-left-num">{numMovesInTurn}</span>
            {' move' + (numMovesInTurn > 1 ? 's' : '') + ' left.'}
          </p>
        )}
      </div>
    </>
  );
}
