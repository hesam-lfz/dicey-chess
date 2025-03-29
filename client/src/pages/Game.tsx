import React, { useCallback, useState } from 'react';

import './Game.css';
import { GamePanel } from '../components/GamePanel';
import { FooterPanel } from '../components/FooterPanel';
import { Modal } from '../components/Modal';
import {
  board,
  DebugOn,
  displayGameDuration,
  initBoardForGameReplay,
  internalSettings,
  outcomes,
  resetBoard,
  resetSettings,
  type SavedGame,
} from '../lib';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import {
  storageApi_deleteGame,
  storageApi_loadGames,
  storageApi_saveGame,
} from '../lib/storageApi';

const infoMessageModalMessageDefault: string = 'Game saved.';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Game() {
  const {
    currentGameSettings,
    setNewCurrentGameSettings,
    currentBoardData,
    user,
  } = useCurrentGameContext();
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
  const [gameId, setGameId] = useState<number>(currentGameSettings.gameId);
  const [gameIdToDelete, setGameIdToDelete] = useState<number>(0);
  const [replayModeOn, setReplayModeOn] = useState<boolean>(board.gameOver);

  async function handleSaveGame(): Promise<void> {
    handleGameOverModalClose();
    onSaveGame();
    setTimeout(async () => {
      const savedOnDatabase = await storageApi_saveGame(
        currentGameSettings,
        user,
        board
      );
      setIsInfoMessageModalOpen(false);
      infoMessageModalMessage =
        'Game saved.' +
        (savedOnDatabase
          ? ''
          : ' Sign in to save your games across all your devices.');
      setTimeout(async () => {
        setIsInfoMessageModalOpen(true);
      }, internalSettings.dialogOpenDelay);
    }, internalSettings.dialogOpenDelay);
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

  const resetGame = useCallback(() => {
    if (DebugOn) console.log('Resetting game!');
    resetSettings(currentGameSettings, setNewCurrentGameSettings, false, false);
    resetBoard(
      currentGameSettings,
      setNewCurrentGameSettings,
      currentBoardData
    );
    setGameId(currentGameSettings.gameId);
    setReplayModeOn(false);
  }, [currentBoardData, currentGameSettings, setNewCurrentGameSettings]);

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
      const allSavedGames = await storageApi_loadGames(user);
      //console.log('saved games', allSavedGames);
      if (allSavedGames.length === 0) {
        infoMessageModalMessage = 'No saved games found!';
        setIsInfoMessageModalOpen(true);
      } else {
        setSavedGames(allSavedGames);
        setIsChooseGameToLoadModalOpen(true);
      }
      handleLoadGameModalClose();
    }, internalSettings.dialogOpenDelay);
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
    if (DebugOn) console.log('deleting game...');
    await storageApi_deleteGame(user, gameIdToDelete);
    infoMessageModalMessage = 'Game deleted.';
    setTimeout(async () => {
      setIsInfoMessageModalOpen(true);
    }, internalSettings.dialogOpenDelay);
    handleGameDeleteModalClose();
  }

  // A saved game is clicked either to load or delete:
  function onGameToLoadOrDeleteClicked(
    e: React.MouseEvent<HTMLDivElement>
  ): void {
    const target = e.target as HTMLElement;
    // Make sure we clicked on a saved game component to load:
    if (target.tagName === 'P') {
      if (DebugOn) console.log('Loading game...');
      // Loading a game....
      const $e = target as HTMLParagraphElement;
      const gameId = +$e.dataset.at!;
      let loadedGame = false,
        loadSuccess = false;
      // Find the id of the saved game to load:
      for (const g of savedGames!) {
        if (gameId === g.at) {
          // Prepare the board for replay of this saved game:
          loadSuccess = initBoardForGameReplay(
            currentGameSettings,
            setNewCurrentGameSettings,
            currentBoardData,
            g
          );
          loadedGame = true;
          break;
        }
      }
      if (loadedGame && loadSuccess) {
        setGameId(currentGameSettings.gameId);
        setReplayModeOn(true);
      } else resetGame();
      handleChooseGameToLoadModalClose();
      if (!loadSuccess) {
        infoMessageModalMessage =
          'Loading game failed! The game was not saved properly and will be deleted.';
        setTimeout(async () => {
          setIsInfoMessageModalOpen(true);
          await storageApi_deleteGame(user, gameId);
        }, internalSettings.dialogOpenDelay);
      }
    } else if (target.tagName === 'DIV') {
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
      handleChooseGameToLoadModalClose();
    }
  }

  /*
  if (!onlineGameAbortedCallbackSet) {
    onlineGameAbortedCallbackSet = true;
    onlineGameApi_globals.onlineGameAbortedCallback = handleOnlineGameAborted;
  }
    */

  return (
    <>
      <GamePanel
        currGameId={gameId}
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
                    <p
                      className="loaded-game-title dotted-border"
                      data-at={g.at}
                      key={g.at}>
                      {outcomes[g.outcome].replace('$OPPONENT', g.opponent) +
                        ' ♟ (' +
                        displayGameDuration(g.duration) +
                        ') ♟ ' +
                        new Date(g.at * 1000).toLocaleString()}
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
