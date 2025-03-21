import { Link, Outlet, useNavigate } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';
import { useCurrentGameSettings } from './useCurrentGameSettings';
import { AppSubdomain } from '../App';
import { shorten } from '../lib';

export function Header() {
  const { user, handleSignOut } = useCurrentGameSettings();
  const navigate = useNavigate();

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
                <Link to={AppSubdomain + 'about'}>About</Link>
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
                <Link to={AppSubdomain + 'settings'}>Settings</Link>
              </li>
              <hr className="mobile-line-separator" />
              <li className="inline-block">
                {user ? (
                  <span
                    onClick={() => {
                      handleSignOut();
                      navigate(AppSubdomain);
                    }}>
                    {'Sign out (' + shorten(user.username, 7) + ')'}
                  </span>
                ) : (
                  <Link to={AppSubdomain + 'signin'}>Sign in</Link>
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
