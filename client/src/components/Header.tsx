import { Link, Outlet } from 'react-router-dom';
import LogoIcon from '../assets/dicey-chess-logo-c.png';

export function Header() {
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
        <div className="header-side header-right-side"></div>
      </div>
      <Outlet />
    </>
  );
}
