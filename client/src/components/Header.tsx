import { Link, Outlet } from 'react-router-dom';

export function Header() {
  return (
    <div>
      <nav className="header px-4 text-white bg-gray-900">
        <ul>
          <li className="inline-block py-2 px-4">
            <Link to="/dicey-chess-web/" className="text-white">
              Game
            </Link>
          </li>
          <li className="inline-block py-2 px-4">
            <Link to="/dicey-chess-web/about" className="text-white">
              About
            </Link>
          </li>
          <li className="inline-block py-2 px-4">
            <Link to="/dicey-chess-web/credits" className="text-white">
              Credits
            </Link>
          </li>
        </ul>
      </nav>
      <Outlet />
    </div>
  );
}
