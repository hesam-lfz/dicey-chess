import { useEffect, useState } from 'react';
import kingW from './assets/king_w.svg';
import kingB from './assets/king_b.svg';
import queenW from './assets/queen_w.svg';
import queenB from './assets/queen_b.svg';
import bishopW from './assets/bishop_w.svg';
import bishopB from './assets/bishop_b.svg';
import knightW from './assets/knight_w.svg';
import knightB from './assets/knight_b.svg';
import rookW from './assets/rook_w.svg';
import rookB from './assets/rook_b.svg';
import pawnW from './assets/pawn_w.svg';
import pawnB from './assets/pawn_b.svg';
//import { Header } from './components/Header';

import './App.css';

export default function App() {
  const [serverData, setServerData] = useState('');

  useEffect(() => {
    async function readServerData() {
      const resp = await fetch('/api/hello');
      const data = await resp.json();

      console.log('Data from server:', data);

      setServerData(data.message);
    }

    readServerData();
  }, []);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={kingW} className="logo" alt="Vite logo" />
          <img src={kingB} className="logo" alt="Vite logo" />
          <img src={bishopW} className="logo" alt="Vite logo" />
          <img src={bishopB} className="logo" alt="Vite logo" />
          <img src={queenW} className="logo" alt="Vite logo" />
          <img src={queenB} className="logo" alt="Vite logo" />
          <img src={knightW} className="logo" alt="Vite logo" />
          <img src={knightB} className="logo" alt="Vite logo" />
          <img src={rookW} className="logo" alt="Vite logo" />
          <img src={rookB} className="logo" alt="Vite logo" />
          <img src={pawnW} className="logo" alt="Vite logo" />
          <img src={pawnB} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>{serverData}</h1>
    </>
  );
}
