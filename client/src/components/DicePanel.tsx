import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import {
  board,
  DebugOn,
  diceSVGs,
  isAITurn,
  isOpponentsTurn,
  playerIconSVGs,
} from '../lib';
import { type Color } from 'chess.js';
import Icon_dice from '../assets/dice.svg';
import './DicePanel.css';

type Props = {
  currGameId: number;
  currTurn: Color;
  currShouldTriggerAIRoll: boolean;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number, n1: number, n2: number) => void;
};

export function DicePanel({
  currGameId,
  currTurn,
  currShouldTriggerAIRoll,
  currShouldAlertDiceRoll,
  containerOnDiceRoll,
}: Props) {
  const diceLeftRef = useRef<null | HTMLImageElement>(null);
  const diceRightRef = useRef<null | HTMLImageElement>(null);
  const rollDiceButtonBorderRef = useRef<null | HTMLSpanElement>(null);
  const rollDiceButtonIconRef = useRef<null | HTMLImageElement>(null);
  const { currentGameSettings, currentBoardData, setNewCurrentBoardData } =
    useCurrentGameContext();
  const [gameId, setGameId] = useState<number>(currGameId);
  const [turn, setTurn] = useState<Color>(board.turn);
  const [shouldTriggerAIRoll, setShouldTriggerAIRoll] = useState<boolean>(
    currShouldTriggerAIRoll
  );
  const [alreadyTriggeredAIRoll, setAlreadyTriggeredAIRoll] =
    useState<boolean>(false);
  const [AIMoveTriggered, setAIMoveTriggered] = useState<boolean>(false);
  const [dice1IconRotation, setDice1IconRotation] = useState<number>(0);
  const [dice2IconRotation, setDice2IconRotation] = useState<number>(0);

  const handleRollButtonClick = useCallback(() => {
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const roll = Math.abs(roll1 - roll2);
    // If we re-rolled due to an AI 0 roll on check, and again we got a 0,
    // then force another re-roll:
    if (roll === 0 && alreadyTriggeredAIRoll) setAlreadyTriggeredAIRoll(false);
    currentBoardData.numMovesInTurn = roll;
    currentBoardData.diceRoll = roll;
    currentBoardData.diceRoll1 = roll1;
    currentBoardData.diceRoll2 = roll2;
    setNewCurrentBoardData();
    setDice1IconRotation(Math.floor(Math.random() * 50) - 25);
    setDice2IconRotation(Math.floor(Math.random() * 50) - 25);
    containerOnDiceRoll(roll, roll1, roll2);
  }, [
    alreadyTriggeredAIRoll,
    containerOnDiceRoll,
    currentBoardData,
    setNewCurrentBoardData,
  ]);

  useEffect(() => {
    setTurn(board.turn);
    setGameId(currGameId);
    if (DebugOn)
      console.log(
        'rendered DicePanel',
        currGameId,
        'currTurn',
        currTurn,
        'theRoll',
        currentBoardData.diceRoll,
        'roll1',
        currentBoardData.diceRoll1,
        'roll2',
        currentBoardData.diceRoll2,
        'theRoll === -1 && !itIsAITurn',
        currentBoardData.diceRoll === -1 && !isAITurn(currentGameSettings),
        'currNumMovesInTurn',
        currentBoardData.numMovesInTurn,
        'AIMoveTriggered',
        AIMoveTriggered,
        'currShouldTriggerAIRoll',
        currShouldTriggerAIRoll,
        'shouldTriggerAIRoll',
        shouldTriggerAIRoll,
        'isOpponentsTurn()',
        isOpponentsTurn(currentGameSettings),
        'turn',
        board.turn,
        'userPlaysColor',
        currentGameSettings.userPlaysColor
        //JSON.stringify(board)
      );
    // If it's AI's turn, trigger dice roll automatically:
    setShouldTriggerAIRoll(false);
    if (isAITurn(currentGameSettings) && !board.gameOver) {
      if (AIMoveTriggered) {
        if (shouldTriggerAIRoll) {
          setAIMoveTriggered(false);
        } else if (currShouldTriggerAIRoll && !alreadyTriggeredAIRoll) {
          setAlreadyTriggeredAIRoll(true);
          setShouldTriggerAIRoll(true);
        }
      } else {
        if (DebugOn) console.log('roll trigger');
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
      rollDiceButtonIconRef!.current?.classList.remove('grow-and-back');
      setTimeout(() => {
        rollDiceButtonBorderRef!.current?.classList.add('shadow-grow-and-back');
        rollDiceButtonIconRef!.current?.classList.add('grow-and-back');
      }, 100);
    }
  }, [
    currGameId,
    gameId,
    currTurn,
    turn,
    AIMoveTriggered,
    currShouldAlertDiceRoll,
    handleRollButtonClick,
    currentGameSettings,
    currShouldTriggerAIRoll,
    shouldTriggerAIRoll,
    alreadyTriggeredAIRoll,
    currentBoardData.diceRoll,
    currentBoardData.numMovesInTurn,
  ]);

  const diceClassName =
    'dice-box-icon dice-drop-animation' +
    (currentBoardData.diceRoll === 0 ? ' dice-0' : '');
  return (
    <>
      <div className="flex flex-col flex-align-center">
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
          {currentBoardData.diceRoll === -1 &&
          !isOpponentsTurn(currentGameSettings) ? (
            <span
              className="roll-dice-button-border rainbow-colored-border shadow-grow-and-back"
              ref={rollDiceButtonBorderRef}>
              <button
                className="roll-dice-button"
                onClick={handleRollButtonClick}>
                <img
                  src={Icon_dice}
                  className="dice-icon grow-and-back"
                  alt={'dice-icon'}
                  ref={rollDiceButtonIconRef}
                />
              </button>
            </span>
          ) : currentBoardData.diceRoll === -1 ? null : (
            <div className="dice-icons-box" key={board.turn}>
              <img
                className={diceClassName}
                src={diceSVGs['Icon_Dice' + currentBoardData.diceRoll1]}
                alt="dice-left-logo"
                style={{ transform: 'rotate(' + dice1IconRotation + 'deg)' }}
                ref={diceLeftRef}
              />
              <img
                className={diceClassName}
                src={diceSVGs['Icon_Dice' + currentBoardData.diceRoll2]}
                alt="dice-right-logo"
                style={{ transform: 'rotate(' + dice2IconRotation + 'deg)' }}
                ref={diceRightRef}
              />
            </div>
          )}
        </div>
      </div>
      <p
        className={
          'num-moves-left-text' +
          (currentBoardData.diceRoll <= 0 ||
          currentBoardData.numMovesInTurn === -1
            ? ' invisible'
            : '')
        }>
        <span className="num-moves-left-num">
          {currentBoardData.numMovesInTurn}
        </span>
        {' move' + (currentBoardData.numMovesInTurn > 1 ? 's' : '') + ' left.'}
      </p>
    </>
  );
}
