import { type FormEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCurrentGameContext } from '../components/useCurrentGameContext';
import { type Auth } from '../lib';
import { Modal } from '../components/Modal';
import { AppSubdomain } from '../App';

const infoMessageModalMessageDefault: string =
  'Sign in incorrect. Please try again!';
const infoMessageModalMessageOffline: string =
  'Problem connecting to the database!';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Signin() {
  const { handleSignIn } = useCurrentGameContext();
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
        console.error('Sign in failed', res);
        infoMessageModalMessage =
          res.status === 401
            ? infoMessageModalMessageDefault
            : infoMessageModalMessageOffline;
        handleInfoMessageOpen();
        throw new Error(`fetch Error ${res.status}`);
      }
      const { user, token } = (await res.json()) as Auth;
      handleSignIn(user, token);
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
      <form onSubmit={handleSubmit}>
        <div className="dotted-border">
          <div className="input-element-container">
            <label>
              Username
              <input required name="username" type="text" />
            </label>
          </div>
        </div>
        <div className="dotted-border">
          <div className="input-element-container">
            <label>
              Password
              <input
                required
                name="password"
                type="password"
                ref={passwordInputRef}
              />
            </label>
          </div>
        </div>
        <span className="rainbow-colored-border">
          <button disabled={isLoading}>Sign in</button>
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
