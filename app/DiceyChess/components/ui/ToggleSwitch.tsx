import { Switch, StyleSheet } from 'react-native';
import { vw } from 'react-native-css-vh-vw';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

// import './ToggleSwitch.css';

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
      <ThemedView
        style={{
          ...styles.inputElementContainer,
          ...styles.toggleSwitchContainer,
          ...styles.flex,
        }}>
        <ThemedText type="default" style={styles.text}>
          {label}
        </ThemedText>
        <ThemedView
          style={{
            ...styles.toggleSwitchToggleSwitch,
            // ...(disabled ? styles.disabled : {}),
          }}>
          <Switch
            disabled={!!disabled}
            value={checked}
            onValueChange={onChange}
            style={styles.ToggleSwitchCheckbox}
          />

          <label className="toggle-switch-label" htmlFor={label}>
            <span className="toggle-switch-inner" />
            <span className="toggle-switch-switch" />
          </label>
        </ThemedView>
      </ThemedView>
    );
  }
);

const styles = StyleSheet.create({
  inputElementContainer: {
    padding: vw(1),
  },
  toggleSwitchContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    fontSize: 25,
    width: vw(50),
    padding: vw(1),
  },
  toggleSwitchToggleSwitch: {
    position: 'relative',
    width: 75,
    // display: 'inline-block',
    textAlign: 'left',
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.1,
    cursor: 'none',
  },
  ToggleSwitchCheckbox: {},
  text: {
    fontFamily: 'Sono',
  },
});
