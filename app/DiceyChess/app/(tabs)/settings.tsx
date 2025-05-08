import { ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { Styles } from '@/styles/Styles';
import { useState } from 'react';

/*
const infoMessageModalMessageDefault =
  'Waiting for a connection between players...';
const infoMessageModalMessageUsernameError = 'Username(s) incorrect';
const infoMessageModalMessageInviteDeniedError =
  'Friend username incorrect or invite request disallowed!';
const infoMessageModalMessageGeneralError = 'Sending friend invite failed!';
const infoMessageModalMessageGameAbortedError =
  'Online game was aborted by a player or due to connection loss.';

let infoMessageModalMessage = infoMessageModalMessageDefault;
let inviteRequestSentWaitingResponse = false;
*/

export default function SettingsTabScreen() {
  const [
    onePlayer,
    //, setOnePlayer
  ] = useState<boolean>(true);
  const [
    opponentIsAI,
    //, setOpponentIsAI
  ] = useState<boolean>(true);
  const [
    userPlaysColorRandomly,
    //, setUserPlaysColorRandomly
  ] = useState<boolean>(false);
  const [
    AIPlayerIsSmart,
    //, setAIPlayerIsSmart
  ] = useState<boolean>(true);
  const [
    AIGameAffectsPlayerRank,
    //, setAIGameAffectsPlayerRank
  ] = useState<boolean>(true);
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
            Settings
          </ThemedText>
          <ThemedView
            style={{
              ...Styles.flex,
              ...Styles.flexCol,
              ...Styles.flexAlignCenter,
              ...Styles.dottedBorder,
            }}>
            <ToggleSwitch
              label="Play vs. AI"
              initChecked={onePlayer && opponentIsAI}
              containerOnChange={() => {}}
            />
            <ToggleSwitch
              label="Play vs. Online Friend"
              initChecked={onePlayer && !opponentIsAI}
              containerOnChange={() => {}}
              // ref={playVsFriendOnlineToggleSwitchRef}
            />
            <ToggleSwitch
              label="Play vs. Yourself"
              initChecked={!onePlayer}
              containerOnChange={() => {}}
            />
          </ThemedView>
          <ThemedView
            style={{
              ...Styles.flex,
              ...Styles.flexCol,
              ...Styles.flexAlignCenter,
              ...Styles.dottedBorder,
            }}>
            <ToggleSwitch
              label="Play White"
              initChecked={
                !userPlaysColorRandomly
                // && userPlaysColor === WHITE
              }
              containerOnChange={(checked: boolean) => checked}
            />
            <ToggleSwitch
              label="Play Black"
              initChecked={false}
              containerOnChange={(checked: boolean) => checked}
            />
            <ToggleSwitch
              label="Play White/Black randomly"
              initChecked={false}
              containerOnChange={(checked: boolean) => checked}
            />
          </ThemedView>
          <ThemedView
            style={{
              ...Styles.flex,
              ...Styles.flexCol,
              ...Styles.flexAlignCenter,
              ...Styles.dottedBorder,
            }}>
            <ToggleSwitch
              label="AI picks smart moves"
              initChecked={AIPlayerIsSmart}
              containerOnChange={(checked: boolean) => checked}
            />
            <ToggleSwitch
              label="AI picks random, stupid moves"
              initChecked={!AIPlayerIsSmart}
              containerOnChange={(checked: boolean) => checked}
            />
          </ThemedView>
          <ThemedView
            style={{
              ...Styles.flex,
              ...Styles.flexCol,
              ...Styles.flexAlignCenter,
              ...Styles.dottedBorder,
            }}>
            <ToggleSwitch
              label="Game vs. AI affects player rank"
              initChecked={AIGameAffectsPlayerRank}
              containerOnChange={(checked: boolean) => checked}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
// });
