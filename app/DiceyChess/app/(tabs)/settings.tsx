import { ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import { useCurrentGameContext } from '@/hooks/useCurrentGameContext';
import { Styles } from '@/styles/Styles';
import { useState, useEffect, useCallback, useRef } from 'react';

import {
  type InviteRequestResponse,
  database_sendInviteFriendRequestByUsername,
  DebugOn,
  gameGlobals,
  internalSettings,
  onlineGameApi_globals,
  onlineGameApi_initialize,
  resetBoard,
  resetSettings,
  saveSettings,
  settings,
} from '@/lib';

import { Color, WHITE, BLACK } from 'chess.js';

const infoMessageModalMessageDefault =
  'Waiting for a connection between players...';
const infoMessageModalMessageUsernameError = 'Username(s) incorrect';
const infoMessageModalMessageInviteDeniedError =
  'Friend username incorrect or invite request disallowed!';
const infoMessageModalMessageGeneralError = 'Sending friend invite failed!';
const infoMessageModalMessageGameAbortedError =
  'Online game was aborted by a player or due to connection loss.';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let infoMessageModalMessage = infoMessageModalMessageDefault;
let inviteRequestSentWaitingResponse = false;

export default function SettingsTabScreen() {
  const {
    currentGameSettings,
    setNewCurrentGameSettings,
    getCurrentBoardData,
    setNewCurrentBoardData,
    user,
  } = useCurrentGameContext();
  const [
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isSigninToPlayFriendOnlineModalOpen,
    setIsSigninToPlayFriendOnlineModalOpen,
  ] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isInviteFriendOnlineModalOpen, setIsInviteFriendOnlineModalOpen] =
    useState<boolean>(false);
  const [
    isWaitingForFriendInviteModalOpen,
    setIsWaitingForFriendInviteModalOpen,
  ] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] = useState<boolean>(
    onlineGameApi_globals.aborted
  );

  const [onePlayer, setOnePlayer] = useState<boolean>(settings.onePlayerMode);
  const [opponentIsAI, setOpponentIsAI] = useState<boolean>(
    settings.opponentIsAI
  );
  const [userPlaysColor, setUserPlaysColor] = useState<Color | null>(
    settings.userPlaysColor
  );
  const [userPlaysColorRandomly, setUserPlaysColorRandomly] = useState<boolean>(
    settings.userPlaysColorRandomly
  );
  const [AIPlayerIsSmart, setAIPlayerIsSmart] = useState<boolean>(
    settings.AIPlayerIsSmart
  );
  const [AIGameAffectsPlayerRank, setAIGameAffectsPlayerRank] =
    useState<boolean>(settings.AIGameAffectsPlayerRank);

  const playVsFriendOnlineToggleSwitchRef = useRef<null | any>(null);
  const inviteFormUsernameRef = useRef<null | HTMLInputElement>(null);
  const inviteFormFriendUsernameRef = useRef<null | HTMLInputElement>(null);
  const router = useRouter();

  // Show any messages that might have been set globally (currently, falling back
  // to stupid ai when ai engine API is blocked):
  useEffect(() => {
    if (gameGlobals.dialogMessagesToShow.length > 0) {
      infoMessageModalMessage = gameGlobals.dialogMessagesToShow.shift()!;
      setIsInfoMessageModalOpen(true);
    }
  });

  const resetBoardAndSaveSettings = useCallback(() => {
    resetBoard(
      currentGameSettings,
      setNewCurrentGameSettings,
      setNewCurrentBoardData
    );
    saveSettings(currentGameSettings, setNewCurrentGameSettings);
  }, [currentGameSettings, setNewCurrentBoardData, setNewCurrentGameSettings]);

  const onResetSettings = useCallback(() => {
    resetSettings(currentGameSettings, setNewCurrentGameSettings, true, true);
    resetBoardAndSaveSettings();
    setOnePlayer(settings.onePlayerMode);
    setOpponentIsAI(settings.opponentIsAI);
    setUserPlaysColor(settings.userPlaysColor);
    setUserPlaysColorRandomly(settings.userPlaysColorRandomly);
    setAIPlayerIsSmart(settings.AIPlayerIsSmart);
  }, [
    currentGameSettings,
    resetBoardAndSaveSettings,
    setNewCurrentGameSettings,
  ]);

  const onPlayerModeChange = useCallback(
    (onePlayer: boolean, isOpponentAI: boolean) => {
      // If we're choosing play against online friend option:
      if (onePlayer && !isOpponentAI) {
        // Revert back to AI mode in the settings since this is just a one time thing...:
        isOpponentAI = true;
        if (user) setIsInviteFriendOnlineModalOpen(true);
        // They're not signed-in. Prompt them to do so:
        else setIsSigninToPlayFriendOnlineModalOpen(true);
      }
      setOnePlayer(onePlayer);
      setOpponentIsAI(isOpponentAI);
      settings.onePlayerMode = onePlayer;
      settings.opponentIsAI = isOpponentAI;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings, user]
  );

  const onUserPlaysColorChange = useCallback(
    (color: Color | null, checked: boolean) => {
      let colorToSet: Color | null = null;
      let randomOn: boolean = false;
      if (checked) {
        randomOn = color === null;
        colorToSet = color;
      } else {
        if (color === null) {
          colorToSet = WHITE;
          randomOn = false;
        } else {
          colorToSet = null;
          randomOn = true;
        }
      }
      setUserPlaysColor(colorToSet);
      setUserPlaysColorRandomly(randomOn);
      settings.userPlaysColor = colorToSet;
      settings.userPlaysColorRandomly = randomOn;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings]
  );

  const onAISmartChange = useCallback(
    (checked: boolean) => {
      setAIPlayerIsSmart(checked);
      settings.AIPlayerIsSmart = checked;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings]
  );

  const onAIGameAffectsRankChange = useCallback(
    (checked: boolean) => {
      setAIGameAffectsPlayerRank(checked);
      settings.AIGameAffectsPlayerRank = checked;
      resetBoardAndSaveSettings();
    },
    [resetBoardAndSaveSettings]
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSigninToPlayFriendOnlineModalClose(): void {
    // toggle the setting to play online friend back off right away
    // (since this is just a one time thing...):
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsSigninToPlayFriendOnlineModalOpen(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleSigninToPlayFriendOnline(): void {
    router.navigate('/signin');
  }

  function handleInviteFriendOnlineModalClose(): void {
    // toggle the setting to play online friend back off right away
    // (since this is just a one time thing...):
    playVsFriendOnlineToggleSwitchRef?.current?.toggle();
    setIsInviteFriendOnlineModalOpen(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleInviteFriendOnline(): Promise<void> {
    handleInviteFriendOnlineModalClose();
    const formUsername = inviteFormUsernameRef?.current?.value
      .toLowerCase()
      .replace(/ /g, '');
    const formFriendUsername = inviteFormFriendUsernameRef?.current?.value
      .toLowerCase()
      .replace(/ /g, '');
    // Check if usernames entered are valid and existing in db:
    if (
      formUsername !== user?.username ||
      !formFriendUsername ||
      formUsername === formFriendUsername
    ) {
      infoMessageModalMessage = infoMessageModalMessageUsernameError;
      setIsInfoMessageModalOpen(true);
    } else {
      try {
        sendInviteFriendRequestAndHandleResponse(formFriendUsername, false);
      } catch (error) {
        console.error('Error sending invitation', error);
        infoMessageModalMessage = infoMessageModalMessageGeneralError;
        setIsWaitingForFriendInviteModalOpen(false);
        setIsInfoMessageModalOpen(true);
      }
    }
  }

  // This is called once a socket connection is establish to play an online friend
  // It'll navigate to game to start:
  function onOnlineGameReadyCallback(
    friendUsername: string,
    userPlaysColor: Color
  ): void {
    setIsWaitingForFriendInviteModalOpen(false);
    currentGameSettings.opponentIsAI = false;
    currentGameSettings.opponent = friendUsername;
    currentGameSettings.userPlaysColor = userPlaysColor;
    setNewCurrentGameSettings();
    if (DebugOn)
      console.log(
        'online game ready',
        'currentGameSettings',
        currentGameSettings
      );
    router.navigate('/');
  }

  // Sends an invite to play online friend and waits for friend to do the same
  // If 2-way invites have been sent, we're ready to start a websocket connection
  // to play online game:
  async function sendInviteFriendRequestAndHandleResponse(
    formFriendUsername: string,
    isRecheck: boolean,
    recheckAttemptNumber: number = 0
  ): Promise<void> {
    if (inviteRequestSentWaitingResponse) return;
    inviteRequestSentWaitingResponse = true;
    const requestResponse: InviteRequestResponse | null =
      await database_sendInviteFriendRequestByUsername(
        formFriendUsername,
        isRecheck
      );
    inviteRequestSentWaitingResponse = false;
    if (!requestResponse) {
      infoMessageModalMessage = infoMessageModalMessageInviteDeniedError;
      setIsInviteFriendOnlineModalOpen(false);
      setIsInfoMessageModalOpen(true);
    } else {
      const { status, pin } = requestResponse;
      if (DebugOn) console.log('invite sent -> response =', requestResponse);
      if (!isWaitingForFriendInviteModalOpen)
        setIsWaitingForFriendInviteModalOpen(true);
      if (status === 0) {
        // if status = 0 (both parties have sent 2-way invites and we are
        // ready to start web socket connection to start game):

        onlineGameApi_initialize(
          currentGameSettings,
          getCurrentBoardData,
          setNewCurrentBoardData,
          user!,
          pin!,
          // this callback is called when online game is ready:
          (userPlaysColor: Color) =>
            onOnlineGameReadyCallback(formFriendUsername, userPlaysColor),
          // this callback is called if online game connection fails:
          (error: Event) => {
            console.error('Socket connection failed! ', error);
            infoMessageModalMessage = infoMessageModalMessageGeneralError;
            setIsWaitingForFriendInviteModalOpen(false);
            setIsInfoMessageModalOpen(true);
          },
          // this callback is called if game is aborted by online opponent:
          () => {
            onlineGameApi_globals.aborted = true;
            if (DebugOn) console.log('game abort handler');
            infoMessageModalMessage = infoMessageModalMessageGameAbortedError;
            resetSettings(
              currentGameSettings,
              setNewCurrentGameSettings,
              false,
              false
            );
            resetBoard(
              currentGameSettings,
              setNewCurrentGameSettings,
              setNewCurrentBoardData
            );
            setIsInfoMessageModalOpen(true);
            router.navigate('/settings');
          }
        );
      } else if (
        recheckAttemptNumber <
        internalSettings.friendInviteRequestRecheckMaxAttempts
      ) {
        // if status = 1 (we are still waiting for friend to send
        // the invite our way to complete the 2-way invite):
        // check back after a bit of time...:
        setTimeout(
          () =>
            sendInviteFriendRequestAndHandleResponse(
              formFriendUsername,
              true,
              recheckAttemptNumber + 1
            ),
          internalSettings.friendInviteRequestRecheckTimeout
        );
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleWaitingForFriendInviteMessageDone() {
    setIsWaitingForFriendInviteModalOpen(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
    onlineGameApi_globals.aborted = false;
    setIsInfoMessageModalOpen(false);
  }

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
              containerOnChange={(checked: boolean) =>
                onPlayerModeChange(checked, checked)
              }
            />
            <ToggleSwitch
              label="Play vs. Online Friend"
              initChecked={onePlayer && !opponentIsAI}
              containerOnChange={(checked: boolean) =>
                onPlayerModeChange(checked, !checked)
              }
              ref={playVsFriendOnlineToggleSwitchRef}
            />
            <ToggleSwitch
              label="Play vs. Yourself"
              initChecked={!onePlayer}
              containerOnChange={(checked: boolean) =>
                onPlayerModeChange(!checked, !checked)
              }
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
              initChecked={!userPlaysColorRandomly && userPlaysColor === WHITE}
              containerOnChange={(checked: boolean) =>
                onUserPlaysColorChange(WHITE, checked)
              }
            />
            <ToggleSwitch
              label="Play Black"
              initChecked={!userPlaysColorRandomly && userPlaysColor !== WHITE}
              containerOnChange={(checked: boolean) =>
                onUserPlaysColorChange(BLACK, checked)
              }
            />
            <ToggleSwitch
              label="Play White/Black randomly"
              initChecked={userPlaysColorRandomly}
              containerOnChange={(checked: boolean) =>
                onUserPlaysColorChange(null, checked)
              }
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
              containerOnChange={(checked: boolean) => onAISmartChange(checked)}
            />
            <ToggleSwitch
              label="AI picks random, stupid moves"
              initChecked={!AIPlayerIsSmart}
              containerOnChange={(checked: boolean) =>
                onAISmartChange(!checked)
              }
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
              containerOnChange={(checked: boolean) =>
                onAIGameAffectsRankChange(checked)
              }
            />
          </ThemedView>
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
              <button onClick={onResetSettings}>Reset Settings</button>
            </LinearGradient>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

// const styles = StyleSheet.create({
// });
