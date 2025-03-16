import { type FormEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentGameSettings } from '../components/useCurrentGameSettings';
import { type Auth } from '../lib';
import { Modal } from '../components/Modal';
import { AppSubdomain } from '../App';

const infoMessageModalMessageDefault: string =
  'Sign in incorrect. Please try again!';
const infoMessageModalMessageOffline: string =
  'Problem connecting to the database!';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Signin() {
  const { handleSignIn } = useCurrentGameSettings();
  const passwordInputRef = useRef<null | HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] =
    useState<boolean>(false);

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
      const res = await fetch('/api/auth/signin', req);
      if (!res.ok) {
        console.log(res);
        infoMessageModalMessage =
          res.status === 401
            ? infoMessageModalMessageDefault
            : infoMessageModalMessageOffline;
        handleInfoMessageOpen();
        throw new Error(`fetch Error ${res.status}`);
      }
      const { user, token } = (await res.json()) as Auth;
      handleSignIn(user, token);
      console.log('Signed In', user);
      console.log('Received token:', token);

      navigate(AppSubdomain);
    } catch (err) {
      console.error(`Error signing in: ${err}`);
      handleInfoMessageOpen();
    } finally {
      setIsLoading(false);
    }
  }

  function handleInfoMessageOpen() {
    passwordInputRef!.current!.value = '';
    passwordInputRef!.current!.focus();
    setIsInfoMessageModalOpen(true);
  }

  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
    setIsInfoMessageModalOpen(false);
  }

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Sign in</h2>
      {/*<h2 className="red">
        Warning: USE FAKE USERNAMES AND PASSWORDS ONLY. DON'T USE YOUR REAL
        USERNAMES AND PASSWORDS AS THIS CONNECTION IS NOT SECURE.
      </h2>*/}
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
                ref={passwordInputRef}
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
        <p>
          Need an account? <Link to={AppSubdomain + 'register'}>Sign up</Link>
        </p>
      </form>
      <Modal isOpen={isInfoMessageModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>{infoMessageModalMessage}</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleInfoMessageDone} autoFocus>
                OK
              </button>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
