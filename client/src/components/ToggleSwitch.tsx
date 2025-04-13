import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import './ToggleSwitch.css';

type Props = {
  label: string;
  initChecked: boolean;
  containerOnChange: (e: any) => void;
  disabled?: boolean;
};

export const ToggleSwitch = forwardRef(
  (
    { label, initChecked, containerOnChange, disabled }: Props,
    ref: React.ForwardedRef<unknown>
  ) => {
    const [checked, setChecked] = useState<boolean>(initChecked);

    useEffect(() => setChecked(initChecked), [initChecked]);

    const toggle = () => {
      setChecked(!checked);
    };

    useImperativeHandle(ref, () => ({
      toggle,
    }));

    const onChange = useCallback(
      (e: any) => {
        const newChecked = e.target.checked;
        setChecked(newChecked);
        containerOnChange(newChecked);
      },
      [containerOnChange]
    );

    return (
      <div className="input-element-container toggle-switch-container">
        <span>{label}</span>
        <div
          className={
            'toggle-switch-toggle-switch' + (disabled ? ' disabled' : '')
          }>
          <input
            type="checkbox"
            className="toggle-switch-checkbox"
            name={label}
            id={label}
            checked={checked}
            onChange={onChange}
            disabled={disabled ? true : false}
          />
          <label className="toggle-switch-label" htmlFor={label}>
            <span className="toggle-switch-inner" />
            <span className="toggle-switch-switch" />
          </label>
        </div>
      </div>
    );
  }
);
