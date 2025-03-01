import { useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import { board, resetBoard } from '../lib';
import { database_loadGames, database_saveGame } from '../lib/storageApi';

const infoMessageModalMessageDefault: string = 'Game saved.';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Game() {
  const [isGameSaveModalOpen, setIsGameSaveModalOpen] =
    useState<boolean>(false);
  const [isResetGameModalOpen, setIsResetGameModalOpen] =
    useState<boolean>(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] =
    useState<boolean>(false);
  const [isChooseGameToLoadModalOpen, setIsChooseGameToLoadModalOpen] =
    useState<boolean>(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] =
    useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(board.gameOver);
  const [history, setHistory] = useState<string[][]>(board.history);

  async function handleSaveGame(): Promise<void> {
    console.log('Saving game!');
    handleGameOverModalClose();
    onSaveGame();
    await database_saveGame(board);
    console.log('Saved!');
    setIsInfoMessageModalOpen(true);
  }

  function handleGameOverModalClose(): void {
    setIsGameSaveModalOpen(false);
  }

  function onGameOver(): void {
    setReplayModeOn(true);
    setIsGameSaveModalOpen(true);
  }

  function handleResetGameModalClose(): void {
    setIsResetGameModalOpen(false);
  }

  function onResetGame(): void {
    setIsResetGameModalOpen(true);
  }

  function handleResetGame(): void {
    resetGame();
    handleResetGameModalClose();
  }

  function resetGame(): void {
    console.log('Resetting game!');
    resetBoard();
    setGameId((id) => id + 1);
    setReplayModeOn(false);
    setHistory([...board.history]);
  }

  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
    setIsInfoMessageModalOpen(false);
  }

  function onSaveGame(): void {
    setIsGameSaveModalOpen(false);
  }

  async function onLoadGame(): Promise<void> {
    console.log('Loading games!');
    setIsLoadGameModalOpen(true);
    setTimeout(async () => {
      const allSavedGames = await database_loadGames();
      console.log('saved games', allSavedGames);
      if (allSavedGames.length === 0) {
        infoMessageModalMessage = 'No saved games found!';
        setIsInfoMessageModalOpen(true);
      } else {
        setIsChooseGameToLoadModalOpen(true);
      }
      handleLoadGameModalClose();
    }, 100);
  }

  function handleLoadGameModalClose(): void {
    setIsLoadGameModalOpen(false);
  }

  function handleChooseGameToLoadModalClose(): void {
    setIsChooseGameToLoadModalOpen(false);
  }

  return (
    <>
      <GamePanel
        currGameId={gameId}
        currHistory={history}
        currReplayModeOn={replayModeOn}
        onGameOver={onGameOver}
        onNewGame={onResetGame}
        onLoadGame={onLoadGame}
      />
      <FooterPanel />
      <Modal isOpen={isGameSaveModalOpen} onClose={() => {}}>
        <p>{board.outcome}!</p>
        <p>Would you like to save this game?</p>
        <div>
          <span className="rainbow-colored-border">
            <button onClick={handleGameOverModalClose}>No</button>
          </span>
          <span className="rainbow-colored-border">
            <button onClick={handleSaveGame} autoFocus>
              Yes
            </button>
          </span>
        </div>
      </Modal>
      <Modal
        isOpen={isResetGameModalOpen}
        onClose={() => {
          setIsResetGameModalOpen(false);
        }}>
        <p>Start a new game?</p>
        <div>
          <span className="rainbow-colored-border">
            <button onClick={handleResetGameModalClose}>No</button>
          </span>
          <span className="rainbow-colored-border">
            <button onClick={handleResetGame} autoFocus>
              Yes
            </button>
          </span>
        </div>
      </Modal>
      <Modal isOpen={isLoadGameModalOpen} onClose={() => {}}>
        <p>Loading saved games...</p>
        <div>
          <span className="rainbow-colored-border">
            <button onClick={handleLoadGameModalClose}>Cancel</button>
          </span>
        </div>
      </Modal>
      <Modal isOpen={isChooseGameToLoadModalOpen} onClose={() => {}}>
        <p>Click on a saved game to load:</p>
        <div>
          <span className="rainbow-colored-border">
            <button onClick={handleChooseGameToLoadModalClose}>Cancel</button>
          </span>
        </div>
      </Modal>
      <Modal isOpen={isInfoMessageModalOpen} onClose={() => {}}>
        <p>{infoMessageModalMessage}</p>
        <div>
          <span className="rainbow-colored-border">
            <button onClick={handleInfoMessageDone} autoFocus>
              OK
            </button>
          </span>
        </div>
      </Modal>
    </>
  );
}
