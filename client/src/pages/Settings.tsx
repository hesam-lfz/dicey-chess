import { useState, useCallback } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { settings } from '../lib';

export function Settings() {
  const [onePlayer, setOnePlayer] = useState<boolean>(settings.onePlayerMode);
  const [AIPlayerIsSmart, setAIPlayerIsSmart] = useState<boolean>(
    settings.AIPlayerIsSmart
  );

  const onOnePlayerChange = useCallback((checked: boolean) => {
    setOnePlayer(checked);
    settings.onePlayerMode = checked;
  }, []);

  const onAISmartChange = useCallback((checked: boolean) => {
    setAIPlayerIsSmart(checked);
    settings.AIPlayerIsSmart = checked;
  }, []);

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
    </div>
  );
}
