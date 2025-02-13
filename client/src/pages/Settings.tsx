import { useState, useCallback } from 'react';
import { ToggleSwitch } from '../components/ToggleSwitch';
import { settings } from '../lib';

export function Settings() {
  const [onePlayer, setOnePlayer] = useState<boolean>(settings.onePlayerMode);

  const onChange = useCallback((checked: boolean) => {
    setOnePlayer(checked);
    settings.onePlayerMode = checked;
  }, []);

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Settings</h2>
      <ToggleSwitch
        label="1-Player — Play vs AI"
        initChecked={onePlayer}
        containerOnChange={(checked: boolean) => onChange(checked)}
      />
      <ToggleSwitch
        label="2-Player — Play vs Human"
        initChecked={!onePlayer}
        containerOnChange={(checked: boolean) => onChange(!checked)}
      />
    </div>
  );
}
