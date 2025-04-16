import { Link, Outlet, useNavigate } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';
import { useCurrentGameContext } from './useCurrentGameContext';

import { AppSubdomain } from '../App';
import { shorten } from '../lib';
import { useRef } from 'react';

export function Header() {
  const { user, handleSignOut, currentBoardData } = useCurrentGameContext();
  const navigate = useNavigate();
  const nav1ElementRef = useRef<null | HTMLElement>(null);
  const nav2ElementRef = useRef<null | HTMLElement>(null);

  // To prevent navigation to different pages mess up the board when it's
  // busy making moves (by player or AI):
  function navigateIfBoardNotBusy(
    to: string,
    preNavigateCallback?: () => void
  ): void {
    if (currentBoardData.busyWaiting) {
      // Change the pointer look for a bit while to show its not allowed yet:
      [nav1ElementRef, nav2ElementRef].forEach((e) =>
        e?.current?.classList.add('waiting')
      );
      nav2ElementRef?.current?.classList.add('waiting');
      setInterval(() => {
        [nav1ElementRef, nav2ElementRef].forEach((e) =>
          e?.current?.classList.remove('waiting')
        );
      }, 1000);
      return;
    }
    if (preNavigateCallback) preNavigateCallback();
    navigate(to);
  }

  return (
    <>
      <div className="header rainbow-colored waiting">
        <div className="header-side header-left-side nav-bar">
          <nav ref={nav1ElementRef}>
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
          <nav ref={nav2ElementRef}>
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
                      //navigate(AppSubdomain);
                      navigateIfBoardNotBusy(AppSubdomain, handleSignOut);
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
