export type User = {
  userId: number;
  username: string;
  rank: number;
  plus: boolean;
};

export type Auth = {
  user: User;
  token: string;
};

const localStorageKeyPrefix = import.meta.env.VITE_APP_NAME;
const authKey = localStorageKeyPrefix + '-auth';

export function saveAuth(user: User, token: string): void {
  const auth: Auth = { user, token };
  localStorage.setItem(authKey, JSON.stringify(auth));
}

export function removeAuth(): void {
  localStorage.removeItem(authKey);
}

export function readUser(): User | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).user;
}

export function readToken(): string | undefined {
  const auth = localStorage.getItem(authKey);
  if (!auth) return undefined;
  return (JSON.parse(auth) as Auth).token;
}
