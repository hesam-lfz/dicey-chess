import { useState, useCallback } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { resetSettings, saveSettings, settings } from '../lib';
import { Color, WHITE, BLACK } from 'chess.js';

export function Settings() {
  const { currentGameSettings, setNewCurrentGameSettings } =
    useCurrentGameSettings();

  const [onePlayer, setOnePlayer] = useState<boolean>(settings.onePlayerMode);
  const [humanPlaysColor, setHumanPlaysColor] = useState<Color | null>(
    settings.humanPlaysColor
  );
  const [humanPlaysColorRandomly, setHumanPlaysColorRandomly] =
    useState<boolean>(settings.humanPlaysColorRandomly);
  const [AIPlayerIsSmart, setAIPlayerIsSmart] = useState<boolean>(
    settings.AIPlayerIsSmart
  );

  const onOnePlayerChange = useCallback(
    (checked: boolean) => {
      setOnePlayer(checked);
      settings.onePlayerMode = checked;
      saveSettings(setNewCurrentGameSettings);
    },
    [setNewCurrentGameSettings]
  );

  const onHumanPlaysColorChange = useCallback(
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
      setHumanPlaysColor(colorToSet);
      setHumanPlaysColorRandomly(randomOn);
      settings.humanPlaysColor = colorToSet;
      settings.humanPlaysColorRandomly = randomOn;
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
    setHumanPlaysColor(settings.humanPlaysColor);
    setHumanPlaysColorRandomly(settings.humanPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [currentGameSettings, setNewCurrentGameSettings]);

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Settings</h2>
      <div className="dotted-border">
        <ToggleSwitch
          label="1-Player — Play vs. AI"
          initChecked={onePlayer}
          containerOnChange={(checked: boolean) => onOnePlayerChange(checked)}
        />
        <ToggleSwitch
          label="2-Player — Play vs. Human"
          initChecked={!onePlayer}
          containerOnChange={(checked: boolean) => onOnePlayerChange(!checked)}
        />
      </div>
      <div className="dotted-border">
        <ToggleSwitch
          label="Play White"
          initChecked={!humanPlaysColorRandomly && humanPlaysColor === WHITE}
          containerOnChange={(checked: boolean) =>
            onHumanPlaysColorChange(WHITE, checked)
          }
        />
        <ToggleSwitch
          label="Play Black"
          initChecked={!humanPlaysColorRandomly && humanPlaysColor !== WHITE}
          containerOnChange={(checked: boolean) =>
            onHumanPlaysColorChange(BLACK, checked)
          }
        />
        <ToggleSwitch
          label="Play White/Black randomly"
          initChecked={humanPlaysColorRandomly}
          containerOnChange={(checked: boolean) =>
            onHumanPlaysColorChange(null, checked)
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
