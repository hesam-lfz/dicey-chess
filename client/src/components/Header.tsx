import { Link, Outlet } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';

export function Header() {
  return (
    <>
      <div className="header">
        <div className="header-side header-left-side nav-bar">
          <nav>
            <ul>
              <li className="inline-block header-logo-name">DICEY CHESS</li>
              <li className="inline-block">
                <Link to="/dicey-chess-web/" className="text-white">
                  Game
                </Link>
              </li>
              <li className="inline-block">
                <Link to="/dicey-chess-web/about" className="text-white">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="header-logo-holder">
          <img className="header-logo" src={LogoIcon} alt="logo"></img>
        </div>
        <div className="header-side header-right-side"></div>
      </div>
      <Outlet />
    </>
  );
}
