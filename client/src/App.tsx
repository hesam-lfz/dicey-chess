import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Game } from './pages/Game';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';

import './App.css';

const AppSubdomain = '/' + import.meta.env.VITE_APP_SUB_DOMAIN;

export default function App() {
  return (
    <Routes>
      <Route path={AppSubdomain} element={<Header />}>
        <Route index element={<Game />} />
        <Route path={AppSubdomain + 'about'} element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
