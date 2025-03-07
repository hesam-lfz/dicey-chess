import { Link, Outlet } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';
import { useCurrentGameSettings } from './useCurrentGameSettings';

export function Header() {
  const { user } = useCurrentGameSettings();

  return (
    <>
      <div className="header rainbow-colored">
        <div className="header-side header-left-side nav-bar">
          <nav>
            <ul>
              <li className="inline-block header-logo-name">
                <Link to="/dicey-chess-web/" className="">
                  DICEY CHESS
                </Link>
              </li>
              <hr className="mobile-line-separator" />
              <li className="inline-block">
                <Link to="/dicey-chess-web/about" className="">
                  About
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="header-logo-holder">
          <Link to="/dicey-chess-web/" className="">
            <img className="header-logo" src={LogoIcon} alt="logo"></img>
          </Link>
        </div>
        <div className="header-side header-right-side">
          <nav>
            <ul>
              <li className="inline-block">
                <Link to="/dicey-chess-web/settings" className="">
                  Settings
                </Link>
              </li>
              <hr className="mobile-line-separator" />
              <li className="inline-block">
                <Link to="/dicey-chess-web/signin" className="">
                  {user ? 'Sign out (' + user.username + ')' : 'Sign in'}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  );
}
