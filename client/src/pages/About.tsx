export function About() {
  return (
    <div className="main-panel">
      <div className="m-0 h-screen bg-center bg-no-repeat bg-[url('/hylian-emblem.svg')]">
        <div className="m-auto pt-20 w-1/2 text-center text-2xl">
          Dicey Chess
        </div>
        <h2>Rules</h2>
        <div className="dotted-border">
          Dicey Chess is a variation of the game of chess.
        </div>
        <h2>About Creators</h2>
        <h2>Credits</h2>
        <p>
          <div className="">
            Chess Rules API by:{' '}
            <a href="https://github.com/jhlywa/chess.js">chess.js</a>
          </div>
        </p>
        <p>
          <div className="">
            Chess AI Engine API by:{' '}
            <a href="https://chess-api.com/">chess-api.com</a>
          </div>
        </p>
        <p>
          <div className="">
            Chess piece icons by{' '}
            <a
              href="//commons.wikimedia.org/wiki/User:Cburnett"
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
              title="Creative Commons Attribution-Share Alike 3.0">
              CC BY-SA 3.0
            </a>
            ,{' '}
            <a href="https://commons.wikimedia.org/w/index.php?curid=1496683">
              Link
            </a>
          </div>
        </p>
        <p>
          <div className="">
            Dice graphics/lib by:{' '}
            <a href="https://github.com/Upmostly/react-dice">
              https://github.com/Upmostly/react-dice
            </a>
          </div>
        </p>
        <p>
          <div className="">Logo by: ChatGPT</div>
        </p>
      </div>
    </div>
  );
}
