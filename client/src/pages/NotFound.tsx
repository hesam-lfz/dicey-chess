import { Link } from 'react-router-dom';
import { AppSubdomain } from '../App';

export function NotFound() {
  return (
    <div className="flex">
      <div className="flex-1 py-12 text-center">
        <h3>Uh oh, we could not find the page you were looking for!</h3>
        <Link to={AppSubdomain} className="text-gray-700">
          Return to the game
        </Link>
      </div>
    </div>
  );
}
