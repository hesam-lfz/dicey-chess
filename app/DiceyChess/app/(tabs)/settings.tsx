import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';

export default function TabTwoScreen() {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.text}>
          Settings
        </ThemedText>
      </ThemedView>
      <ToggleSwitch
        label="Play vs. AI"
        initChecked={false}
        containerOnChange={() => {}}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontFamily: 'Sono',
  },
});
