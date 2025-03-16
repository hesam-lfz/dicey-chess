import { useState, useCallback } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { resetSettings, saveSettings, settings } from '../lib';
import { Color, WHITE, BLACK } from 'chess.js';

export function Settings() {
  const { currentGameSettings, setNewCurrentGameSettings } =
    useCurrentGameSettings();

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

  const onPlayerModeChange = useCallback(
    (onePlayer: boolean, isOpponentAI: boolean) => {
      setOnePlayer(onePlayer);
      setOpponentIsAI(isOpponentAI);
      settings.onePlayerMode = onePlayer;
      settings.opponentIsAI = isOpponentAI;
      saveSettings(setNewCurrentGameSettings);
    },
    [setNewCurrentGameSettings]
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

  const onResetSettings = useCallback(() => {
    resetSettings(currentGameSettings, true);
    saveSettings(setNewCurrentGameSettings);
    setOnePlayer(settings.onePlayerMode);
    setUserPlaysColor(settings.userPlaysColor);
    setUserPlaysColorRandomly(settings.userPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [currentGameSettings, setNewCurrentGameSettings]);

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Settings</h2>
      <div className="dotted-border">
        <ToggleSwitch
          label="Play vs. AI"
          initChecked={onePlayer && opponentIsAI}
          containerOnChange={(checked: boolean) =>
            onPlayerModeChange(checked, true)
          }
        />
        <ToggleSwitch
          label="Play vs. Online Friend"
          initChecked={onePlayer}
          containerOnChange={(checked: boolean) =>
            onPlayerModeChange(checked, false)
          }
        />
        <ToggleSwitch
          label="Play vs. Yourself"
          initChecked={!onePlayer}
          containerOnChange={(checked: boolean) =>
            onPlayerModeChange(!checked, false)
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
  );
}
