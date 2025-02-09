import { useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import { board, resetBoard } from '../lib';

export function Game() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSaveGame(): void {
    alert('You save game!');
    handleModalClose();
  }

  function handleModalClose(): void {
    alert('Resetting game!');
    resetBoard();
    setIsModalOpen(false);
  }

  return (
    <>
      <GamePanel onGameOver={() => setIsModalOpen(true)} />
      <FooterPanel />
      <Modal isOpen={isModalOpen} onClose={() => {}}>
        <p>{board.outcome}</p>
        <p>Would you like to save this game?</p>
        <div>
          <button onClick={handleModalClose}>No</button>
          <button onClick={handleSaveGame} autoFocus>
            Yes
          </button>
        </div>
      </Modal>
    </>
  );
}
