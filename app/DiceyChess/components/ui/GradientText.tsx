// import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';
// import { Styles } from '@/styles/Styles';
import MaskedView from '@react-native-masked-view/masked-view';

export type GradientTextProps = {
  title: string;
};

export const GradientText = ({ title }: GradientTextProps) => {
  return (
    <MaskedView
      style={{ height: 24 }}
      maskElement={<ThemedText style={{ fontSize: 32 }}>{title}</ThemedText>}>
      <LinearGradient
        colors={['red', 'cadetblue', '#fabada']}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}>
        <ThemedText style={{ fontSize: 32 }}>{title}</ThemedText>
      </LinearGradient>
    </MaskedView>
  );
};
