import { Route, Routes } from 'react-router-dom';
import { CurrentGameContextProvider } from './components/CurrentGameContext';
import { Header } from './components/Header';
import { Game } from './pages/Game';
import { About } from './pages/About';
import { Settings } from './pages/Settings';
import { Signin } from './pages/Signin';
import { Register } from './pages/Register';
import { NotFound } from './pages/NotFound';

import './App.css';

export const AppSubdomain = '/' + import.meta.env.VITE_APP_SUB_DOMAIN;

export default function App() {
  return (
    <CurrentGameContextProvider>
      <Routes>
        <Route path={AppSubdomain} element={<Header />}>
          <Route index element={<Game />} />
          <Route path={AppSubdomain + 'about'} element={<About />} />
          <Route path={AppSubdomain + 'settings'} element={<Settings />} />
          <Route path={AppSubdomain + 'signin'} element={<Signin />} />
          <Route path={AppSubdomain + 'register'} element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </CurrentGameContextProvider>
  );
}
