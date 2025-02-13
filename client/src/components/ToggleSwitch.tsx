import { useCallback, useEffect, useState } from 'react';
import './ToggleSwitch.css';

type Props = {
  label: string;
  initChecked: boolean;
  containerOnChange: (e: any) => void;
};

export function ToggleSwitch({ label, initChecked, containerOnChange }: Props) {
  const [checked, setChecked] = useState<boolean>(initChecked);

  useEffect(() => setChecked(initChecked), [initChecked]);

  const onChange = useCallback(
    (e: any) => {
      const newChecked = e.target.checked;
      setChecked(newChecked);
      containerOnChange(newChecked);
    },
    [containerOnChange]
  );

  return (
    <div className="toggle-switch-container">
      <span>{label}</span>
      <div className="toggle-switch-toggle-switch">
        <input
          type="checkbox"
          className="toggle-switch-checkbox"
          name={label}
          id={label}
          checked={checked}
          onChange={onChange}
        />
        <label className="toggle-switch-label" htmlFor={label}>
          <span className="toggle-switch-inner" />
          <span className="toggle-switch-switch" />
        </label>
      </div>
    </div>
  );
}
