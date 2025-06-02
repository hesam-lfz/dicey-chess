import { AppVersion } from '../App';
import { diceSVGs } from '../lib';

export function About() {
  return (
    <div className="main-panel padded-main-panel">
      <div className="m-0 h-screen bg-center bg-no-repeat bg-[url('/hylian-emblem.svg')]">
        <div className="m-auto pt-20 w-1/2 text-center text-2xl rainbow-colored">
          <h3 className="header-logo-name">DICEY CHESS</h3>
          <a
            className="app-version"
            href="https://github.com/hesam-lfz/dicey-chess/"
            target="_blank">
            <span>V{AppVersion}</span>
          </a>
        </div>
        <h2>Rules</h2>
        <div className="dotted-border">
          <p>
            Dicey Chess is a variation of the game of chess. On each turn, the
            player rolls 2 dice and then makes N consecutive chess moves, where
            N is the difference between the number of dots between the 2 dice:
          </p>
          <p>
            For example, <strong className="underlined">4</strong> moves if the
            dice roll was
            <img
              className="about-dice-icon"
              src={diceSVGs.Icon_Dice5}
              alt="dice5-logo"
            />
            &amp;
            <img
              className="about-dice-icon"
              src={diceSVGs.Icon_Dice1}
              alt="dice1-logo"
            />
            . And <strong className="underlined">0</strong> moves if the dice
            roll was
            <img
              className="about-dice-icon"
              src={diceSVGs.Icon_Dice5}
              alt="dice5-logo"
            />
            &amp;
            <img
              className="about-dice-icon"
              src={diceSVGs.Icon_Dice5}
              alt="dice5-logo"
            />
            .
          </p>
          <p>
            A <em>check</em> move can only be performed on the last move per
            dice roll. If a player is <em>in check</em> but rolls a{' '}
            <strong className="underlined">0</strong>, the player will repeat
            the dice roll until a <em>none-zero</em> roll is made.
          </p>
        </div>
        <h2>About Creators</h2>

        <div className="">
          <div>
            <a href="https://www.semigames.us/" target="_blank">
              <img
                className="header-logo"
                src="https://www.semigames.us/images/semi-games-logo.png"
              />
            </a>
          </div>
          This chess variation game and{' '}
          <a href="https://github.com/hesam-lfz/dicey-chess/" target="_blank">
            open-source
          </a>{' '}
          full-stack TypeScript ReactJS website is designed &amp; developed by:
          <br />
          <a href="https://hesam.us" target="_blank">
            Hesam (Sam) Samimi
          </a>{' '}
          at{' '}
          <a href="https://www.semigames.us/" target="_blank">
            Semi Games
          </a>
        </div>
        <h2>Credits</h2>
        <div className="">
          Chess Rules API by:{' '}
          <a href="https://github.com/jhlywa/chess.js" target="_blank">
            chess.js
          </a>
        </div>
        <div className="">
          Chess AI Engine API by:{' '}
          <a href="https://chess-api.com/" target="_blank">
            chess-api.com
          </a>
        </div>
        <div className="">
          ToggleSwitch React Component by:{' '}
          <a
            href="https://www.geeksforgeeks.org/how-to-create-a-toggle-switch-in-react-as-a-reusable-component/"
            target="_blank">
            geeksforgeeks.org
          </a>
        </div>
        <div className="">
          Chess piece icons by:{' '}
          <a
            href="//commons.wikimedia.org/wiki/User:Cburnett"
            target="_blank"
            title="User:Cburnett">
            Cburnett
          </a>{' '}
          -{' '}
          <span className="int-own-work" lang="en">
            Own work
          </span>
          ,{' '}
          <a
            href="http://creativecommons.org/licenses/by-sa/3.0/"
            title="Creative Commons Attribution-Share Alike 3.0"
            target="_blank">
            CC BY-SA 3.0
          </a>
          ,{' '}
          <a
            href="https://commons.wikimedia.org/w/index.php?curid=1496683"
            target="_blank">
            Link
          </a>
        </div>
        <div className="">
          Dice logo icon by:{' '}
          <a
            href="https://en.m.wikipedia.org/wiki/User:Steaphan_Greene"
            target="_blank">
            Steaphan Greene
          </a>
        </div>
        <div className="">
          Dice logo icon by:{' '}
          <a href="https://www.svgrepo.com/vectors/" target="_blank">
            https://www.svgrepo.com/vectors/
          </a>
        </div>
        <div className="">Logo by: ChatGPT</div>
      </div>
    </div>
  );
}
