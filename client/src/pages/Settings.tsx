import { useState, useCallback, useRef } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import { Modal } from '../components/Modal';
import {
  type InviteRequestResponse,
  database_sendInviteFriendRequestByUsername,
  DebugOn,
  internalSettings,
  onlineGameApi_globals,
  onlineGameApi_initialize,
  resetBoard,
  resetSettings,
  saveSettings,
  settings,
} from '../lib';
import { Color, WHITE, BLACK } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { AppSubdomain } from '../App';

const infoMessageModalMessageDefault =
  'Waiting for a connection between players...';
const infoMessageModalMessageUsernameError = 'Username(s) incorrect';
const infoMessageModalMessageInviteDeniedError =
  'Friend username incorrect or invite request disallowed!';
const infoMessageModalMessageGeneralError = 'Sending friend invite failed!';
const infoMessageModalMessageGameAbortedError =
  'Online game was aborted by a player or due to connection loss.';

let infoMessageModalMessage = infoMessageModalMessageDefault;
let inviteRequestSentWaitingResponse = false;

export function Settings() {
  const {
    currentGameSettings,
    setNewCurrentGameSettings,
    getCurrentBoardData,
    setNewCurrentBoardData,
    user,
  } = useCurrentGameContext();
  const [
    isSigninToPlayFriendOnlineModalOpen,
    setIsSigninToPlayFriendOnlineModalOpen,
  ] = useState<boolean>(false);
  const [isInviteFriendOnlineModalOpen, setIsInviteFriendOnlineModalOpen] =
    useState<boolean>(false);
  const [
    isWaitingForFriendInviteModalOpen,
    setIsWaitingForFriendInviteModalOpen,
  ] = useState<boolean>(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] = useState<boolean>(
    onlineGameApi_globals.aborted
  );

  const [onePlayer, setOnePlayer] = useState<boolean>(settings.onePlayerMode);
  const [opponentIsAI, setOpponentIsAI] = useState<boolean>(
    settings.opponentIsAI
  );
  const [userPlaysColor, setUserPlaysColor] = useState<Color | null>(
    settings.userPlaysColor
  );
  const [userPlaysColorRandomly, setUserPlaysColorRandomly] = useState<boolean>(
    settings.userPlaysColorRandomly
  );
  const [AIPlayerIsSmart, setAIPlayerIsSmart] = useState<boolean>(
    settings.AIPlayerIsSmart
  );

  const playVsFriendOnlineToggleSwitchRef = useRef<null | any>(null);
  const inviteFormUsernameRef = useRef<null | HTMLInputElement>(null);
  const inviteFormFriendUsernameRef = useRef<null | HTMLInputElement>(null);
  const navigate = useNavigate();

  const resetBoardAndSaveSettings = useCallback(() => {
    resetBoard(
      currentGameSettings,
      setNewCurrentGameSettings,
      setNewCurrentBoardData
    );
    saveSettings(currentGameSettings, setNewCurrentGameSettings);
  }, [currentGameSettings, setNewCurrentBoardData, setNewCurrentGameSettings]);

  const onResetSettings = useCallback(() => {
    resetSettings(currentGameSettings, setNewCurrentGameSettings, true, true);
    resetBoardAndSaveSettings();
    setOnePlayer(settings.onePlayerMode);
    setOpponentIsAI(settings.opponentIsAI);
    setUserPlaysColor(settings.userPlaysColor);
    setUserPlaysColorRandomly(settings.userPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [
    currentGameSettings,
    resetBoardAndSaveSettings,
    setNewCurrentGameSettings,
  ]);

  const onPlayerModeChange = useCallback(
    (onePlayer: boolean, isOpponentAI: boolean) => {
      // If we're choosing play against online friend option:
      if (onePlayer && !isOpponentAI) {
        // Revert back to AI mode in the settings since this is just a one time thing...:
        isOpponentAI = true;
        if (user) setIsInviteFriendOnlineModalOpen(true);
        // They're not signed-in. Prompt them to do so:
        else setIsSigninToPlayFriendOnlineModalOpen(true);
      }
      setOnePlayer(onePlayer);
      setOpponentIsAI(isOpponentAI);
      settings.onePlayerMode = onePlayer;
      settings.opponentIsAI = isOpponentAI;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings, user]
  );

  const onUserPlaysColorChange = useCallback(
    (color: Color | null, checked: boolean) => {
      let colorToSet: Color | null = null;
      let randomOn: boolean = false;
      if (checked) {
        randomOn = color === null;
        colorToSet = color;
      } else {
        if (color === null) {
          colorToSet = WHITE;
          randomOn = false;
        } else {
          colorToSet = null;
          randomOn = true;
        }
      }
      setUserPlaysColor(colorToSet);
      setUserPlaysColorRandomly(randomOn);
      settings.userPlaysColor = colorToSet;
      settings.userPlaysColorRandomly = randomOn;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings]
  );

  const onAISmartChange = useCallback(
    (checked: boolean) => {
      setAIPlayerIsSmart(checked);
      settings.AIPlayerIsSmart = checked;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings]
  );

  function handleSigninToPlayFriendOnlineModalClose(): void {
    // toggle the setting to play online friend back off right away
    // (since this is just a one time thing...):
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsSigninToPlayFriendOnlineModalOpen(false);
  }

  function handleSigninToPlayFriendOnline(): void {
    navigate(AppSubdomain + 'signin');
  }

  function handleInviteFriendOnlineModalClose(): void {
    // toggle the setting to play online friend back off right away
    // (since this is just a one time thing...):
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsInviteFriendOnlineModalOpen(false);
  }

  async function handleInviteFriendOnline(): Promise<void> {
    handleInviteFriendOnlineModalClose();
    const formUsername = inviteFormUsernameRef?.current?.value
      .toLowerCase()
      .replace(/ /g, '');
    const formFriendUsername = inviteFormFriendUsernameRef?.current?.value
      .toLowerCase()
      .replace(/ /g, '');
    // Check if usernames entered are valid and existing in db:
    if (
      formUsername !== user?.username ||
      !formFriendUsername ||
      formUsername === formFriendUsername
    ) {
      infoMessageModalMessage = infoMessageModalMessageUsernameError;
      setIsInfoMessageModalOpen(true);
    } else {
      try {
        sendInviteFriendRequestAndHandleResponse(formFriendUsername, false);
      } catch (error) {
        console.error('Error sending invitation', error);
        infoMessageModalMessage = infoMessageModalMessageGeneralError;
        setIsWaitingForFriendInviteModalOpen(false);
        setIsInfoMessageModalOpen(true);
      }
    }
  }

  // This is called once a socket connection is establish to play an online friend
  // It'll navigate to game to start:
  function onOnlineGameReadyCallback(
    friendUsername: string,
    userPlaysColor: Color
  ): void {
    setIsWaitingForFriendInviteModalOpen(false);
    currentGameSettings.opponentIsAI = false;
    currentGameSettings.opponent = friendUsername;
    currentGameSettings.userPlaysColor = userPlaysColor;
    setNewCurrentGameSettings();
    if (DebugOn)
      console.log(
        'online game ready',
        'currentGameSettings',
        currentGameSettings
      );
    navigate(AppSubdomain);
  }

  // Sends an invite to play online friend and waits for friend to do the same
  // If 2-way invites have been sent, we're ready to start a websocket connection
  // to play online game:
  async function sendInviteFriendRequestAndHandleResponse(
    formFriendUsername: string,
    isRecheck: boolean,
    recheckAttemptNumber: number = 0
  ): Promise<void> {
    if (inviteRequestSentWaitingResponse) return;
    inviteRequestSentWaitingResponse = true;
    const requestResponse: InviteRequestResponse | null =
      await database_sendInviteFriendRequestByUsername(
        formFriendUsername,
        isRecheck
      );
    inviteRequestSentWaitingResponse = false;
    if (!requestResponse) {
      infoMessageModalMessage = infoMessageModalMessageInviteDeniedError;
      setIsInviteFriendOnlineModalOpen(false);
      setIsInfoMessageModalOpen(true);
      return;
    } else {
      const { status, pin } = requestResponse;
      if (DebugOn) console.log('invite sent -> response =', requestResponse);
      if (!isWaitingForFriendInviteModalOpen)
        setIsWaitingForFriendInviteModalOpen(true);
      if (status === 0) {
        // if status = 0 (both parties have sent 2-way invites and we are
        // ready to start web socket connection to start game):

        onlineGameApi_initialize(
          currentGameSettings,
          getCurrentBoardData,
          setNewCurrentBoardData,
          user!,
          pin!,
          // this callback is called when online game is ready:
          (userPlaysColor: Color) =>
            onOnlineGameReadyCallback(formFriendUsername, userPlaysColor),
          // this callback is called if online game connection fails:
          (error: Event) => {
            console.error('Socket connection failed! ', error);
            infoMessageModalMessage = infoMessageModalMessageGeneralError;
            setIsWaitingForFriendInviteModalOpen(false);
            setIsInfoMessageModalOpen(true);
          },
          // this callback is called if game is aborted by online opponent:
          () => {
            onlineGameApi_globals.aborted = true;
            if (DebugOn) console.log('game abort handler');
            infoMessageModalMessage = infoMessageModalMessageGameAbortedError;
            resetSettings(
              currentGameSettings,
              setNewCurrentGameSettings,
              false,
              false
            );
            resetBoard(
              currentGameSettings,
              setNewCurrentGameSettings,
              setNewCurrentBoardData
            );
            setIsInfoMessageModalOpen(true);
            navigate(AppSubdomain + 'settings');
          }
        );
      } else if (
        recheckAttemptNumber <
        internalSettings.friendInviteRequestRecheckMaxAttempts
      ) {
        // if status = 1 (we are still waiting for friend to send
        // the invite our way to complete the 2-way invite):
        // check back after a bit of time...:
        setTimeout(
          () =>
            sendInviteFriendRequestAndHandleResponse(
              formFriendUsername,
              true,
              recheckAttemptNumber + 1
            ),
          internalSettings.friendInviteRequestRecheckTimeout
        );
      }
    }
  }

  function handleWaitingForFriendInviteMessageDone() {
    setIsWaitingForFriendInviteModalOpen(false);
  }

  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
    onlineGameApi_globals.aborted = false;
    setIsInfoMessageModalOpen(false);
  }

  return (
    <>
      <div className="main-panel padded-main-panel flex flex-col flex-align-center">
        <h2>Settings</h2>
        <div className="dotted-border">
          <ToggleSwitch
            label="Play vs. AI"
            initChecked={onePlayer && opponentIsAI}
            containerOnChange={(checked: boolean) =>
              onPlayerModeChange(checked, checked)
            }
          />
          <ToggleSwitch
            label="Play vs. Online Friend"
            initChecked={onePlayer && !opponentIsAI}
            // disabled={!DebugOn}
            containerOnChange={(checked: boolean) =>
              onPlayerModeChange(checked, !checked)
            }
            ref={playVsFriendOnlineToggleSwitchRef}
          />
          <ToggleSwitch
            label="Play vs. Yourself"
            initChecked={!onePlayer}
            containerOnChange={(checked: boolean) =>
              onPlayerModeChange(!checked, !checked)
            }
          />
        </div>
        <div className="dotted-border">
          <ToggleSwitch
            label="Play White"
            initChecked={!userPlaysColorRandomly && userPlaysColor === WHITE}
            containerOnChange={(checked: boolean) =>
              onUserPlaysColorChange(WHITE, checked)
            }
          />
          <ToggleSwitch
            label="Play Black"
            initChecked={!userPlaysColorRandomly && userPlaysColor !== WHITE}
            containerOnChange={(checked: boolean) =>
              onUserPlaysColorChange(BLACK, checked)
            }
          />
          <ToggleSwitch
            label="Play White/Black randomly"
            initChecked={userPlaysColorRandomly}
            containerOnChange={(checked: boolean) =>
              onUserPlaysColorChange(null, checked)
            }
          />
        </div>
        <div className="dotted-border">
          <ToggleSwitch
            label="AI picks smart moves"
            initChecked={AIPlayerIsSmart}
            containerOnChange={(checked: boolean) => onAISmartChange(checked)}
          />
          <ToggleSwitch
            label="AI picks random, stupid moves"
            initChecked={!AIPlayerIsSmart}
            containerOnChange={(checked: boolean) => onAISmartChange(!checked)}
          />
        </div>
        <div className="flex flex-align-center">
          <span className="rainbow-colored-border">
            <button onClick={onResetSettings}>Reset Settings</button>
          </span>
        </div>
      </div>
      <Modal isOpen={isSigninToPlayFriendOnlineModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>Sign in to enable playing with friends online.</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleSigninToPlayFriendOnlineModalClose}>
                Cancel
              </button>
            </span>
            <span className="rainbow-colored-border">
              <button onClick={handleSigninToPlayFriendOnline} autoFocus>
                Sign in
              </button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isInviteFriendOnlineModalOpen} onClose={() => {}}>
        <div className="modal-box compact-p">
          <p>Invite a friend online to a game.</p>
          <p>Enter your and your friend's username. </p>
          <p>Ask your friend to do the same at this time.</p>
          <p>
            <em className="smaller pink">
              Invites will expire in 2 minutes...
            </em>
          </p>
          <div className="modal-actions flex-end-inputs">
            <div className="input-element-container">
              <label>
                Your Username
                <input
                  required
                  name="username"
                  type="text"
                  ref={inviteFormUsernameRef}
                />
              </label>
            </div>
            <div className="input-element-container">
              <label>
                Friend's Username
                <input
                  required
                  name="friend-username"
                  type="text"
                  ref={inviteFormFriendUsernameRef}
                />
              </label>
            </div>
            <span className="rainbow-colored-border">
              <button onClick={handleInviteFriendOnlineModalClose}>
                Cancel
              </button>
            </span>
            <span className="rainbow-colored-border">
              <button onClick={handleInviteFriendOnline} autoFocus>
                Send Invite
              </button>
            </span>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isWaitingForFriendInviteModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>Waiting to receive your friend's invite back...</p>
          <p>
            <em className="smaller pink">
              Invites will expire in 2 minutes...
            </em>
          </p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleWaitingForFriendInviteMessageDone}>
                Cancel
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
              <button onClick={handleInfoMessageDone}>Cancel</button>
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
