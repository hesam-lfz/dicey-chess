import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Game } from './pages/Game';
import { About } from './pages/About';
import { Credits } from './pages/Credits';
import { NotFound } from './pages/NotFound';

import './App.css';

export default function App() {
  return (
    <Routes>
      <Route
        path={'/' + import.meta.env.VITE_APP_SUB_DOMAIN}
        element={<Header />}>
        <Route index element={<Game />} />
        <Route
          path={'/' + import.meta.env.VITE_APP_SUB_DOMAIN + 'about'}
          element={<About />}
        />
        <Route
          path={'/' + import.meta.env.VITE_APP_SUB_DOMAIN + 'credits'}
          element={<Credits />}
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
