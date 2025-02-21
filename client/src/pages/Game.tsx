import { useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import { board, resetBoard } from '../lib';

export function Game() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(false);
  const [history, setHistory] = useState<string[][]>(board.history);

  function handleSaveGame(): void {
    alert('You save game!');
    handleGameOverModalClose();
  }

  function handleGameOverModalClose(): void {
    console.log('reset mode', isModalOpen);
    setIsModalOpen(false);
    //resetGame();
  }

  function onGameOver(): void {
    console.log('onGameOver');
    setReplayModeOn(true);
    setIsModalOpen(true);
    if (Math.random() === 2) resetGame();
  }

  function resetGame(): void {
    console.log('Resetting game!');
    resetBoard();
    setGameId((id) => id + 1);
    setHistory([...board.history]);
  }

  return (
    <>
      <GamePanel
        currGameId={gameId}
        currHistory={history}
        currReplayModeOn={replayModeOn}
        onGameOver={onGameOver}
      />
      <FooterPanel />
      <Modal isOpen={isModalOpen} onClose={() => {}}>
        <p>{board.outcome}</p>
        <p>Would you like to save this game?</p>
        <div>
          <button onClick={handleGameOverModalClose}>No</button>
          <button onClick={handleSaveGame} autoFocus>
            Yes
          </button>
        </div>
      </Modal>
    </>
  );
}
