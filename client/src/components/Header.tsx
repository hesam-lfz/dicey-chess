import { Link, Outlet, useNavigate } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';
import { useCurrentGameContext } from './useCurrentGameContext';

import { AppSubdomain } from '../App';
import { shorten } from '../lib';

export function Header() {
  const { user, handleSignOut, currentBoardData } = useCurrentGameContext();
  const navigate = useNavigate();

  // To prevent navigation to different pages mess up the board when it's
  // busy making moves (by player or AI):
  function navigateIfBoardNotBusy(to: string): void {
    if (currentBoardData.busyWaiting) return;
    navigate(to);
  }

  return (
    <>
      <div className="header rainbow-colored">
        <div className="header-side header-left-side nav-bar">
          <nav>
            <ul>
              <li className="inline-block header-logo-name">
                <Link to={AppSubdomain}>DICEY CHESS</Link>
              </li>
              <hr className="mobile-line-separator" />
              <li className="inline-block">
                {/*
                <Link to={AppSubdomain + 'about'} className={linkClassName}>
                  About
                </Link>
                */}
                <span
                  className="link-span"
                  onClick={() =>
                    navigateIfBoardNotBusy(AppSubdomain + 'about')
                  }>
                  About
                </span>
              </li>
            </ul>
          </nav>
        </div>
        <div className="header-logo-holder">
          <Link to={AppSubdomain}>
            <img className="header-logo" src={LogoIcon} alt="logo"></img>
          </Link>
        </div>
        <div className="header-side header-right-side">
          <nav>
            <ul>
              <li className="inline-block">
                {
                  //<Link to={AppSubdomain + 'settings'}>Settings</Link>
                }
                <span
                  className="link-span"
                  onClick={() =>
                    navigateIfBoardNotBusy(AppSubdomain + 'settings')
                  }>
                  Settings
                </span>
              </li>
              <hr className="mobile-line-separator" />
              <li className="inline-block">
                {user ? (
                  <span
                    onClick={() => {
                      handleSignOut();
                      //navigate(AppSubdomain);
                      navigateIfBoardNotBusy(AppSubdomain);
                    }}>
                    {'Sign out '}
                    <span className="small">
                      {'(' + shorten(user.username, 10) + ')'}
                    </span>
                  </span>
                ) : (
                  //<Link to={AppSubdomain + 'signin'}>Sign in</Link>
                  <span
                    className="link-span"
                    onClick={() =>
                      navigateIfBoardNotBusy(AppSubdomain + 'signin')
                    }>
                    Sign in
                  </span>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <Outlet />
    </>
  );
}
