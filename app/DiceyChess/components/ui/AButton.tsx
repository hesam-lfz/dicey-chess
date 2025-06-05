import { Text, Pressable } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { Styles } from '@/styles/Styles';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonProps = {
  title: string;
  onPress: () => void;
};

export const AButton = ({ title, onPress }: ButtonProps) => {
  return (
    <ThemedView
      style={{
        ...Styles.flex,
        ...Styles.flexCol,
        ...Styles.flexAlignCenter,
        ...Styles.rainbowColoredBorder,
      }}>
      <LinearGradient
        colors={['#00c0ff', '#ffcf00', '#fc4f4f']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <Pressable style={Styles.button} onPress={onPress}>
          <Text style={Styles.buttonText}>{title}</Text>
        </Pressable>
      </LinearGradient>
    </ThemedView>
  );
};
