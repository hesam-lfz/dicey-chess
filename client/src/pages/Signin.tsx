import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { type User } from '../lib';

type AuthData = {
  user: User;
  token: string;
};

export function Signin() {
  const { handleSignIn } = useCurrentGameSettings();

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData);
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/sign-in', req);
      if (!res.ok) {
        throw new Error(`fetch Error ${res.status}`);
      }
      const { user, token } = (await res.json()) as AuthData;
      handleSignIn(user, token);
      console.log('Signed In', user);
      console.log('Received token:', token);
      navigate('/');
    } catch (err) {
      alert(`Error signing in: ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Sign in</h2>

      <form onSubmit={handleSubmit}>
        <div className="dotted-border">
          <div className="input-element-container">
            <label className="mb-1 block">
              Username
              <input
                required
                name="username"
                type="text"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
          </div>
        </div>
        <div className="dotted-border">
          <div className="input-element-container">
            <label className="mb-1 block">
              Password
              <input
                required
                name="password"
                type="password"
                className="block border border-gray-600 rounded p-2 h-8 w-full mb-2"
              />
            </label>
          </div>
        </div>
        <span className="rainbow-colored-border">
          <button
            disabled={isLoading}
            className="align-middle text-center border rounded py-1 px-3 bg-blue-600 text-white">
            Sign in
          </button>
        </span>
      </form>
    </div>
  );
}
