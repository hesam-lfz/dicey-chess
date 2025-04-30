import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={styles.text}>
          About
        </ThemedText>
      </ThemedView>
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
    gap: 8,
  },
  text: {
    fontFamily: 'Sono',
  },
});
