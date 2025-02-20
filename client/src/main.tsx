//import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  /* Disabling StrictMode since it causes double rendering in dev move. Not good for this application since it'll cause double moves! */
  /*<React.StrictMode>*/
  <BrowserRouter>
    <App />
  </BrowserRouter>
  /*</React.StrictMode>*/
);
