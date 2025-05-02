import { StyleSheet } from 'react-native';
import { vw, vh } from 'react-native-css-vh-vw';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';

export default function TabTwoScreen() {
  return (
    <ThemedView
      style={{
        ...styles.mainPanel,
        ...styles.paddedMainPanel,
        ...styles.flex,
        ...styles.flexCol,
        ...styles.flexAlignCenter,
      }}>
      <ThemedText type="title" style={styles.text}>
        Settings
      </ThemedText>
      <ThemedView
        style={{
          ...styles.flex,
          ...styles.flexCol,
          ...styles.flexAlignCenter,
        }}>
        <ThemedText style={styles.text}>Blah</ThemedText>
        <ToggleSwitch
          label="Play vs. AI"
          initChecked={false}
          containerOnChange={() => {}}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainPanel: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'center',
    height: vh(100),
    width: vw(100),
  },
  paddedMainPanel: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: vw(10),
    paddingRight: vw(10),
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  flexCol: {
    flexDirection: 'column',
  },
  flexAlignCenter: {
    alignItems: 'center',
  },
  text: {
    fontFamily: 'Sono',
  },
});
