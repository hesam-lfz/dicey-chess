import { useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import { board, resetBoard } from '../lib';
import { database_saveGame } from '../lib/storageApi';

export function Game() {
  const [isGameSaveModalOpen, setIsGameSaveModalOpen] =
    useState<boolean>(false);
  const [isResetGameModalOpen, setIsResetGameModalOpen] =
    useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(false);
  const [history, setHistory] = useState<string[][]>(board.history);

  async function handleSaveGame(): Promise<void> {
    console.log('Saving game!');
    await database_saveGame(board);
    console.log('Saved!');
    handleGameOverModalClose();
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

  return (
    <>
      <GamePanel
        currGameId={gameId}
        currHistory={history}
        currReplayModeOn={replayModeOn}
        onGameOver={onGameOver}
        onNewGame={onResetGame}
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
      <Modal isOpen={isResetGameModalOpen} onClose={() => {}}>
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
    </>
  );
}
