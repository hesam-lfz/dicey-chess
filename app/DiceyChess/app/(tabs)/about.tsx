import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Styles } from '@/styles/Styles';

export default function AboutTabScreen() {
  return (
    <ScrollView>
      <ThemedView
        style={{
          ...Styles.tabPage,
        }}>
        <ThemedView
          style={{
            ...Styles.mainPanel,
            ...Styles.paddedMainPanel,
            ...Styles.flex,
            ...Styles.flexCol,
            ...Styles.flexAlignCenter,
          }}>
          <ThemedText
            type="title"
            style={{ ...Styles.headerText, ...Styles.text }}>
            About
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
// });
