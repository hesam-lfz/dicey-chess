import { useState, useCallback, useRef } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { Modal } from '../components/Modal';
import {
  database_getUserPublicInfoByUsername,
  DebugOn,
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
const infoMessageModalMessageUsernameError = 'Username(s) incorrect!';
let infoMessageModalMessage = infoMessageModalMessageDefault;

export function Settings() {
  const { currentGameSettings, setNewCurrentGameSettings, user } =
    useCurrentGameSettings();
  const [
    isSigninToPlayFriendOnlineModalOpen,
    setIsSigninToPlayFriendOnlineModalOpen,
  ] = useState<boolean>(false);
  const [isInviteFriendOnlineModalOpen, setIsInviteFriendOnlineModalOpen] =
    useState<boolean>(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] =
    useState<boolean>(false);

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

  const onResetSettings = useCallback(() => {
    resetSettings(currentGameSettings, true);
    resetBoard(currentGameSettings);
    saveSettings(setNewCurrentGameSettings);
    setOnePlayer(settings.onePlayerMode);
    setOpponentIsAI(settings.opponentIsAI);
    setUserPlaysColor(settings.userPlaysColor);
    setUserPlaysColorRandomly(settings.userPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [currentGameSettings, setNewCurrentGameSettings]);

  const onPlayerModeChange = useCallback(
    (onePlayer: boolean, isOpponentAI: boolean) => {
      // If we're choosing play against online friend option:
      if (onePlayer && !isOpponentAI) {
        // Revert back to AI mode in the settings since this is just a one time thing...:
        isOpponentAI = true;
        if (user) {
          setIsInviteFriendOnlineModalOpen(true);
        } else {
          // They're not signed-in. Prompt them to do so:
          setIsSigninToPlayFriendOnlineModalOpen(true);
        }
      }
      setOnePlayer(onePlayer);
      setOpponentIsAI(isOpponentAI);
      settings.onePlayerMode = onePlayer;
      settings.opponentIsAI = isOpponentAI;
      resetBoard(currentGameSettings);
      saveSettings(setNewCurrentGameSettings);
    },
    [currentGameSettings, setNewCurrentGameSettings, user]
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
      resetBoard(currentGameSettings);
      saveSettings(setNewCurrentGameSettings);
    },
    [currentGameSettings, setNewCurrentGameSettings]
  );

  const onAISmartChange = useCallback(
    (checked: boolean) => {
      setAIPlayerIsSmart(checked);
      settings.AIPlayerIsSmart = checked;
      resetBoard(currentGameSettings);
      saveSettings(setNewCurrentGameSettings);
    },
    [currentGameSettings, setNewCurrentGameSettings]
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
    const formUsername = inviteFormUsernameRef?.current?.value;
    const formFriendUsername = inviteFormFriendUsernameRef?.current?.value;
    // Check if usernames entered are valid and existing in db:
    if (
      formUsername !== user?.username ||
      !formFriendUsername ||
      formUsername === formFriendUsername ||
      !(await database_getUserPublicInfoByUsername(formFriendUsername))
    ) {
      infoMessageModalMessage = infoMessageModalMessageUsernameError;
    } else {
      currentGameSettings.opponentIsAI = false;
      setNewCurrentGameSettings();
      console.log('invite sent', currentGameSettings);
      navigate(AppSubdomain);
    }
    setIsInfoMessageModalOpen(true);
  }

  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
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
            disabled={!DebugOn}
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
        <div className="modal-box">
          <p>Invite a friend online to a game.</p>
          <p>Enter your and your friend's username. </p>
          <p>Ask your friend to do the same at this time.</p>

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
