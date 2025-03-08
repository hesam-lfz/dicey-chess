import { type FormEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type User } from '../lib';
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
      const userData = Object.fromEntries(formData);
      if ((userData.username as string).length < 5) {
        formCheckError = 1;
        infoMessageModalMessage = 'Username is too short. Please try again!';
        throw new Error(infoMessageModalMessage);
      } else if ((userData.password as string).length < 5) {
        formCheckError = 2;
        infoMessageModalMessage = 'Password is too short. Please try again!';
        throw new Error(infoMessageModalMessage);
      }
      const req = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      };
      const res = await fetch('/api/auth/register', req);
      if (!res.ok) {
        formCheckError = 3;
        throw new Error(`fetch Error ${res.status}`);
      }
      const user = (await res.json()) as User;
      console.log('Registered', user);
      console.log(
        `You can check the database with: psql -d userManagement -c 'select * from users'`
      );
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
    if (formCheckError < 2) {
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
      <h2 className="red">
        Warning: USE FAKE USERNAMES AND PASSWORDS ONLY. DON'T USE YOUR REAL
        USERNAMES AND PASSWORDS AS THIS CONNECTION IS NOT SECURE.
      </h2>
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
                ref={usernameInputRef}
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
            Register
          </button>
        </span>
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
