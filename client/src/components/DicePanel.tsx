import { useState, useEffect, useCallback, useRef } from 'react';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import {
  board,
  DebugOn,
  diceSVGs,
  internalSettings,
  isAITurn,
  isOpponentsTurn,
  playerIconSVGs,
} from '../lib';
import Icon_dice from '../assets/dice.svg';
import './DicePanel.css';

type Props = {
  currGameId: number;
  currShouldTriggerAIRoll: boolean;
  currShouldAlertDiceRoll: boolean;
  containerOnDiceRoll: (n: number, n1: number, n2: number) => void;
};

let triggerRollDelayTimeoutId: NodeJS.Timeout | undefined = undefined;

export function DicePanel({
  currGameId,
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
  const [shouldTriggerAIRoll, setShouldTriggerAIRoll] = useState<boolean>(
    currShouldTriggerAIRoll
  );
  const [alreadyTriggeredAIRoll, setAlreadyTriggeredAIRoll] =
    useState<boolean>(false);
  const [AIMoveTriggered, setAIMoveTriggered] = useState<boolean>(false);
  const [dice1IconRotation, setDice1IconRotation] = useState<number>(0);
  const [dice2IconRotation, setDice2IconRotation] = useState<number>(0);

  const handleRollButtonClick = useCallback(() => {
    // Mark game board busy as it processes the dice being rolled (this is being
    // checked for incoming online game messages to make sure they wait until
    // we can receive new game events):
    board.busyWaiting = true;
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const roll = Math.abs(roll1 - roll2);
    // If we re-rolled due to an AI 0 roll on check, and again we got a 0,
    // then force another re-roll:
    if (roll === 0 && alreadyTriggeredAIRoll) setAlreadyTriggeredAIRoll(false);
    setNewCurrentBoardData(
      {
        numMovesInTurn: roll,
        diceRoll: roll,
        diceRoll1: roll1,
        diceRoll2: roll2,
      },
      true
    );
    setDice1IconRotation(Math.floor(Math.random() * 50) - 25);
    setDice2IconRotation(Math.floor(Math.random() * 50) - 25);
    containerOnDiceRoll(roll, roll1, roll2);
  }, [alreadyTriggeredAIRoll, containerOnDiceRoll, setNewCurrentBoardData]);

  useEffect(() => {
    if (DebugOn)
      console.log(
        'rendered DicePanel',
        currGameId,
        'currentBoardData',
        JSON.stringify(currentBoardData),
        'theRoll === -1 && !itIsAITurn',
        currentBoardData.diceRoll === -1 &&
          !isAITurn(currentGameSettings, currentBoardData),
        'currNumMovesInTurn',
        currentBoardData.numMovesInTurn,
        'isAITurn',
        isAITurn(currentGameSettings, currentBoardData),
        'AIMoveTriggered',
        AIMoveTriggered,
        'currShouldTriggerAIRoll',
        currShouldTriggerAIRoll,
        'shouldTriggerAIRoll',
        shouldTriggerAIRoll,
        'isOpponentsTurn()',
        isOpponentsTurn(currentGameSettings, currentBoardData),
        'turn',
        currentBoardData.turn,
        'userPlaysColor',
        currentGameSettings.userPlaysColor
        //JSON.stringify(board)
      );
    // If it's AI's turn, trigger dice roll automatically:
    setShouldTriggerAIRoll(false);
    if (isAITurn(currentGameSettings, currentBoardData) && !board.gameOver) {
      if (AIMoveTriggered) {
        if (shouldTriggerAIRoll) {
          setAIMoveTriggered(false);
        } else if (currShouldTriggerAIRoll && !alreadyTriggeredAIRoll) {
          setAlreadyTriggeredAIRoll(true);
          setShouldTriggerAIRoll(true);
        }
      } else {
        // Triggering an AI roll:
        if (DebugOn) console.log('roll trigger');
        setAIMoveTriggered(true);
        triggerRollDelayTimeoutId = setTimeout(
          handleRollButtonClick,
          internalSettings.AIMoveDelay
        );
      }
    } else setAIMoveTriggered(false);
    // we're resetting the game:
    if (currGameId !== gameId) {
      // cancel any delayed rolls:
      if (triggerRollDelayTimeoutId !== undefined) {
        clearTimeout(triggerRollDelayTimeoutId);
        triggerRollDelayTimeoutId = undefined;
      }
    }
    setGameId(currGameId);
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
    AIMoveTriggered,
    currShouldAlertDiceRoll,
    handleRollButtonClick,
    currentGameSettings,
    currShouldTriggerAIRoll,
    shouldTriggerAIRoll,
    alreadyTriggeredAIRoll,
    currentBoardData.diceRoll,
    currentBoardData.numMovesInTurn,
    currentBoardData.diceRoll1,
    currentBoardData.diceRoll2,
    currentBoardData.turn,
    currentBoardData,
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
                src={playerIconSVGs[currentBoardData.turn]}
                className="piece play-icon"
                alt={'player-icon-' + currentBoardData.turn}
                draggable="false"
              />
            </div>
          }
          <span>'s Move</span>
        </div>
        <div className="dice-area">
          {currentBoardData.diceRoll === -1 &&
          !isOpponentsTurn(currentGameSettings, currentBoardData) ? (
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
                  draggable="false"
                />
              </button>
            </span>
          ) : currentBoardData.diceRoll === -1 ? null : (
            <div className="dice-icons-box" key={currentBoardData.turn}>
              <img
                className={diceClassName}
                src={diceSVGs['Icon_Dice' + currentBoardData.diceRoll1]}
                alt="dice-left-logo"
                style={{ transform: 'rotate(' + dice1IconRotation + 'deg)' }}
                ref={diceLeftRef}
                draggable="false"
              />
              <img
                className={diceClassName}
                src={diceSVGs['Icon_Dice' + currentBoardData.diceRoll2]}
                alt="dice-right-logo"
                style={{ transform: 'rotate(' + dice2IconRotation + 'deg)' }}
                ref={diceRightRef}
                draggable="false"
              />
            </div>
          )}
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
          {' move' +
            (currentBoardData.numMovesInTurn > 1 ? 's' : '') +
            ' left.'}
        </p>
      </div>
    </>
  );
}
