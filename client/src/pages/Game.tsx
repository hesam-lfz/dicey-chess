import React, { useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import {
  board,
  displayGameDuration,
  initBoardForGameReplay,
  outcomes,
  resetBoard,
  type SavedGame,
} from '../lib';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import {
  database_deleteGame,
  database_loadGames,
  database_saveGame,
} from '../lib/storageApi';

const infoMessageModalMessageDefault: string = 'Game saved.';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Game() {
  const { currentGameSettings } = useCurrentGameSettings();
  const [savedGames, setSavedGames] = useState<SavedGame[]>();
  const [isGameSaveModalOpen, setIsGameSaveModalOpen] =
    useState<boolean>(false);
  const [isResetGameModalOpen, setIsResetGameModalOpen] =
    useState<boolean>(false);
  const [isLoadGameModalOpen, setIsLoadGameModalOpen] =
    useState<boolean>(false);
  const [isChooseGameToLoadModalOpen, setIsChooseGameToLoadModalOpen] =
    useState<boolean>(false);
  const [isGameDeleteModalOpen, setIsGameDeleteModalOpen] =
    useState<boolean>(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] =
    useState<boolean>(false);
  const [gameId, setGameId] = useState<number>(0);
  const [gameIdToDelete, setGameIdToDelete] = useState<number>(0);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(board.gameOver);
  const [history, setHistory] = useState<string[][]>(board.history);

  async function handleSaveGame(): Promise<void> {
    handleGameOverModalClose();
    onSaveGame();
    setTimeout(async () => {
      await database_saveGame(currentGameSettings, board);
      setIsInfoMessageModalOpen(false);
      infoMessageModalMessage = 'Game saved.';
      setTimeout(async () => {
        setIsInfoMessageModalOpen(true);
      }, 200);
    }, 200);
    infoMessageModalMessage = 'Saving game...';
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
    setIsLoadGameModalOpen(true);
    setTimeout(async () => {
      const allSavedGames = await database_loadGames();
      //console.log('saved games', allSavedGames);
      if (allSavedGames.length === 0) {
        infoMessageModalMessage = 'No saved games found!';
        setIsInfoMessageModalOpen(true);
      } else {
        setSavedGames(allSavedGames);
        setIsChooseGameToLoadModalOpen(true);
      }
      handleLoadGameModalClose();
    }, 200);
  }

  function handleLoadGameModalClose(): void {
    setIsLoadGameModalOpen(false);
  }

  function handleChooseGameToLoadModalClose(): void {
    setIsChooseGameToLoadModalOpen(false);
  }

  function handleGameDeleteModalClose(): void {
    setIsGameDeleteModalOpen(false);
  }

  async function handleDeleteGame(): Promise<void> {
    await database_deleteGame(gameIdToDelete);
    handleGameDeleteModalClose();
  }

  // A saved game is clicked either to load or delete:
  function onGameToLoadOrDeleteClicked(
    e: React.MouseEvent<HTMLDivElement>
  ): void {
    const target = e.target as HTMLElement;
    // Make sure we clicked on a saved game component to load:
    if (target.tagName === 'P') {
      console.log('Loading game...');
      // Loading a game....
      const $e = target as HTMLParagraphElement;
      const gameId = +$e.dataset.at!;
      let loadedGame = false;
      // Find the id of the saved game to load:
      for (const g of savedGames!) {
        if (gameId === g.at) {
          // Prepare the board for replay of this saved game:
          initBoardForGameReplay(currentGameSettings, g);
          loadedGame = true;
          break;
        }
      }
      if (loadedGame) {
        setGameId((id) => id + 1);
        setReplayModeOn(true);
        setHistory(board.history);
      } else {
        resetGame();
      }
      handleChooseGameToLoadModalClose();
    } else if (target.tagName === 'SPAN') {
      console.log('deleting game...');
      // Deleting a game....
      const $e = target as HTMLSpanElement;
      const gameId = +$e.dataset.at!;
      // Find the id of the saved game to delete:
      for (const g of savedGames!) {
        if (gameId === g.at) {
          // Prepare the board for replay of this saved game:
          setGameIdToDelete(gameId);
          setIsGameDeleteModalOpen(true);
          break;
        }
      }
    }
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
        <div className="modal-box">
          <p>{board.outcome}!</p>
          <p>Would you like to save this game?</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleGameOverModalClose}>No</button>
            </span>
            <span className="rainbow-colored-border">
              <button onClick={handleSaveGame} autoFocus>
                Yes
              </button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isResetGameModalOpen}
        onClose={() => {
          setIsResetGameModalOpen(false);
        }}>
        <div className="modal-box">
          <p>Start a new game?</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleResetGameModalClose}>No</button>
            </span>
            <span className="rainbow-colored-border">
              <button onClick={handleResetGame} autoFocus>
                Yes
              </button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isLoadGameModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>Loading saved games...</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleLoadGameModalClose}>Cancel</button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isChooseGameToLoadModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>Click on a saved game to load:</p>
          <div
            className="loaded-games-box"
            onClick={onGameToLoadOrDeleteClicked}>
            {savedGames
              ? savedGames!.map((g: SavedGame) => (
                  <div className="loaded-game-box flex" key={'box-' + g.at}>
                    <p className="dotted-border" data-at={g.at} key={g.at}>
                      {outcomes[g.outcome] +
                        ' ♟ (' +
                        displayGameDuration(g.duration) +
                        ') ♟ ' +
                        new Date(g.at * 1000).toISOString()}
                    </p>
                    <div
                      className="delete-button"
                      data-at={g.at}
                      key={'delete-' + g.at}>
                      ✕
                    </div>
                  </div>
                ))
              : null}
          </div>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleChooseGameToLoadModalClose}>Cancel</button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isGameDeleteModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>{board.outcome}!</p>
          <p>Do you want to delete this game?</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleGameDeleteModalClose}>No</button>
            </span>
            <span className="rainbow-colored-border">
              <button onClick={handleDeleteGame} autoFocus>
                Yes
              </button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isInfoMessageModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>{infoMessageModalMessage}</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleInfoMessageDone} autoFocus>
                OK
              </button>
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
