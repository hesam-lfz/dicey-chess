import { useState, useCallback, useRef } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { Modal } from '../components/Modal';
import { resetSettings, saveSettings, settings } from '../lib';
import { Color, WHITE, BLACK } from 'chess.js';
import { useNavigate } from 'react-router-dom';
import { AppSubdomain } from '../App';

export function Settings() {
  const { currentGameSettings, setNewCurrentGameSettings, user } =
    useCurrentGameSettings();
  const [
    isSigninToPlayFriendOnlineModalOpen,
    setIsSigninToPlayFriendOnlineModalOpen,
  ] = useState<boolean>(false);
  const [isInviteFriendOnlineModalOpen, setIsInviteFriendOnlineModalOpen] =
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
  const navigate = useNavigate();

  const onResetSettings = useCallback(() => {
    resetSettings(currentGameSettings, true);
    saveSettings(setNewCurrentGameSettings);
    setOnePlayer(settings.onePlayerMode);
    setOpponentIsAI(settings.opponentIsAI);
    setUserPlaysColor(settings.userPlaysColor);
    setUserPlaysColorRandomly(settings.userPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [currentGameSettings, setNewCurrentGameSettings]);

  const onPlayerModeChange = useCallback(
    (onePlayer: boolean, isOpponentAI: boolean) => {
      if (onePlayer && !isOpponentAI) {
        if (user) {
          setIsInviteFriendOnlineModalOpen(true);
        } else {
          isOpponentAI = true;
          setIsSigninToPlayFriendOnlineModalOpen(true);
        }
      }
      setOnePlayer(onePlayer);
      setOpponentIsAI(isOpponentAI);
      settings.onePlayerMode = onePlayer;
      settings.opponentIsAI = isOpponentAI;
      saveSettings(setNewCurrentGameSettings);
    },
    [setNewCurrentGameSettings, user]
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
      saveSettings(setNewCurrentGameSettings);
    },
    [setNewCurrentGameSettings]
  );

  const onAISmartChange = useCallback(
    (checked: boolean) => {
      setAIPlayerIsSmart(checked);
      settings.AIPlayerIsSmart = checked;
      saveSettings(setNewCurrentGameSettings);
    },
    [setNewCurrentGameSettings]
  );

  function handleSigninToPlayFriendOnlineModalClose(): void {
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsSigninToPlayFriendOnlineModalOpen(false);
  }

  function handleSigninToPlayFriendOnline(): void {
    navigate(AppSubdomain + 'signin');
  }

  function handleInviteFriendOnlineModalClose(): void {
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsInviteFriendOnlineModalOpen(false);
  }

  function handleInviteFriendOnline(): void {
    alert('invite...');
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
            //disabled={true}
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
          <div className="modal-actions">
            <div className="input-element-container">
              <label className="mb-1 block">
                Friend's Username
                <input
                  required
                  name="username"
                  type="text"
                  className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
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
    </>
  );
}
