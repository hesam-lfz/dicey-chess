import { type FormEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { internalSettings, type User } from '../lib';
import { Modal } from '../components/Modal';
import { AppSubdomain } from '../App';

const infoMessageModalMessageDefault: string =
  'Registering failed. Please try again!';
let infoMessageModalMessage: string = infoMessageModalMessageDefault;

export function Register() {
  const usernameInputRef = useRef<null | HTMLInputElement>(null);
  const passwordInputRef = useRef<null | HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInfoMessageModalOpen, setIsInfoMessageModalOpen] =
    useState<boolean>(false);
  const [isSuccessMessageModalOpen, setIsSuccessMessageModalOpen] =
    useState<boolean>(false);

  const navigate = useNavigate();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let formCheckError = 0;
    try {
      setIsLoading(true);
      const formData = new FormData(event.currentTarget);
      const userData = Object.fromEntries(formData) as Record<any, any>;
      // add the initial player rank to user data:
      userData.rank = internalSettings.initPlayerRank;
      const username = userData.username as string;
      const usernameLength = username.length;
      const passwordLength = (userData.password as string).length;
      if (!/^[a-z0-9_.@]+$/.test(username)) {
        formCheckError = 1;
        infoMessageModalMessage =
          'Username should only contain lowercase alphanumeric characters!';
        throw new Error(infoMessageModalMessage);
      } else if (usernameLength < 5 || usernameLength > 15) {
        formCheckError = 2;
        infoMessageModalMessage =
          'Username should be 5-15 characters. Please try again!';
        throw new Error(infoMessageModalMessage);
      } else if (passwordLength < 5 || passwordLength > 20) {
        formCheckError = 3;
        infoMessageModalMessage =
          'Password should be 5-20 characters. Please try again!';
        throw new Error(infoMessageModalMessage);
      }
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/register', req);
      if (!res.ok) {
        formCheckError = 4;
        throw new Error(`fetch Error ${res.status}`);
      }
      const user = (await res.json()) as User;
      console.log('Registered', user);
      infoMessageModalMessage = `Successfully registered ${user.username}.`;
      console.log(infoMessageModalMessage);
      handleSuccessMessageOpen();
    } catch (err) {
      console.error(`Error registering user: ${err}`);
      handleInfoMessageOpen(formCheckError);
    } finally {
      setIsLoading(false);
    }
  }

  function handleInfoMessageOpen(formCheckError: number) {
    passwordInputRef!.current!.value = '';
    passwordInputRef!.current!.focus();
    if (formCheckError < 3) {
      usernameInputRef!.current!.value = '';
      usernameInputRef!.current!.focus();
    }
    setIsInfoMessageModalOpen(true);
  }

  function handleInfoMessageDone() {
    infoMessageModalMessage = infoMessageModalMessageDefault;
    setIsInfoMessageModalOpen(false);
  }

  function handleSuccessMessageOpen() {
    setIsSuccessMessageModalOpen(true);
  }

  function handleSuccessMessageDone() {
    navigate(AppSubdomain + 'signin');
  }

  return (
    <div className="main-panel padded-main-panel flex flex-col flex-align-center">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="dotted-border">
          <div className="input-element-container">
            <label>
              Username
              <input
                required
                name="username"
                type="text"
                ref={usernameInputRef}
              />
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
          <button
            disabled={isLoading}
            className="align-middle text-center border rounded py-1 px-3 bg-blue-600 text-white">
            Register
          </button>
        </span>
        <p>
          Already have an account?{' '}
          <Link to={AppSubdomain + 'signin'}>Sign in</Link>
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
      <Modal isOpen={isSuccessMessageModalOpen} onClose={() => {}}>
        <div className="modal-box">
          <p>{infoMessageModalMessage}</p>
          <div className="modal-actions">
            <span className="rainbow-colored-border">
              <button onClick={handleSuccessMessageDone} autoFocus>
                OK
              </button>
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
