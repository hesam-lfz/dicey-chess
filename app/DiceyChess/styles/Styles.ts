import { StyleSheet } from 'react-native';
import { vw, vh } from 'react-native-css-vh-vw';

export const Styles = StyleSheet.create({
  tabPage: {
    paddingBottom: 50,
    width: vw(100),
    minHeight: vh(100) - 49,
  },
  mainPanel: {
    display: 'flex',
    // justifyContent: 'center',
    alignItems: 'flex-start',
    alignSelf: 'center',
    overflowY: 'scroll',
  },
  paddedMainPanel: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingLeft: vw(10),
    paddingRight: vw(10),
  },
  dottedBorder: {
    borderWidth: 1.5,
    borderStyle: 'dotted',
    borderColor: 'white',
    padding: 10,
    borderRadius: 15,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 0,
    marginRight: 0,
  },
  rainbowColoredBorder: {
    padding: 5,
    borderRadius: 15,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 0,
    marginRight: 0,
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
  disabled: {
    opacity: 0.1,
    cursor: 'none',
  },
  headerText: {
    marginTop: 20,
    marginBottom: 20,
  },
  text: {
    fontFamily: 'Sono',
  },
});
