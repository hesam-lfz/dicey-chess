import { ScrollView } from 'react-native';
// import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Styles } from '@/styles/Styles';
import { GradientText } from '@/components/ui/GradientText';

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
          <ThemedView
            style={{
              ...Styles.rainbowColored,
            }}>
            <GradientText title="GradientText" />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
// });
