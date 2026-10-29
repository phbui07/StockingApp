import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {readJSON, removeKey, writeJSON} from './storage';
import {AccountInterface, UserProfile} from './typeProps';
import {Accounts as demoAccounts} from './renderData';

// On-device accounts: everything lives in AsyncStorage on this phone.
// These keys predate this module and are kept so existing data still loads.
const ACCOUNTS_KEY = 'accountsStorage';
const SESSION_KEY = 'userLoginStorage';
const WELCOMED_KEY = 'stockline.welcomed';

// Guests get a session (and their own portfolio) without an account. The id
// has no "@", so it can never collide with a real account's email.
export const GUEST_ID = 'guest';

export type SessionErrorCode =
  | 'EMAIL_EXISTS'
  | 'WRONG_CREDENTIALS'
  | 'WRONG_PASSWORD'
  | 'NOT_FOUND';

export class SessionError extends Error {
  code: SessionErrorCode;
  constructor(code: SessionErrorCode) {
    super(code);
    this.code = code;
  }
}

export interface GoogleProfile {
  email: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  photo: string | null;
}

interface SessionValue {
  ready: boolean;
  user: UserProfile | null;
  account: AccountInterface | null;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<{firstTime: boolean}>;
  logInWithGoogle: (profile: GoogleProfile) => Promise<{firstTime: boolean}>;
  logInAsGuest: () => Promise<void>;
  isGuest: boolean;
  logOut: () => Promise<void>;
  findAccount: (email: string) => AccountInterface | undefined;
  updateName: (name: string) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
  resetPassword: (email: string, next: string) => Promise<void>;
  setPhone: (phone: string) => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

const toProfile = (account: AccountInterface): UserProfile => ({
  email: account.email,
  name: account.name,
  givenName: account.name,
  familyName: null,
  photoUrl: account.photoUrl ?? null,
});

export const SessionProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [accounts, setAccounts] = useState<AccountInterface[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [welcomed, setWelcomed] = useState<string[]>([]);

  useEffect(() => {
    Promise.all([
      readJSON<AccountInterface[]>(ACCOUNTS_KEY, []),
      readJSON<UserProfile | null>(SESSION_KEY, null),
      readJSON<string[]>(WELCOMED_KEY, []),
    ]).then(([storedAccounts, session, storedWelcomed]) => {
      const list = storedAccounts.length ? storedAccounts : demoAccounts;
      setAccounts(list.map(a => ({...a, email: normalizeEmail(a.email)})));
      setUser(session?.email ? session : null);
      setWelcomed(storedWelcomed);
      setReady(true);
    });
  }, []);

  const saveAccounts = useCallback(async (next: AccountInterface[]) => {
    setAccounts(next);
    await writeJSON(ACCOUNTS_KEY, next);
  }, []);

  const startSession = useCallback(
    async (account: AccountInterface) => {
      const profile = toProfile(account);
      setUser(profile);
      await writeJSON(SESSION_KEY, profile);
      const firstTime = !welcomed.includes(account.email);
      if (firstTime) {
        const next = [...welcomed, account.email];
        setWelcomed(next);
        await writeJSON(WELCOMED_KEY, next);
      }
      return {firstTime};
    },
    [welcomed],
  );

  const findAccount = useCallback(
    (email: string) => accounts.find(a => a.email === normalizeEmail(email)),
    [accounts],
  );

  const updateAccount = useCallback(
    async (email: string, patch: Partial<AccountInterface>) => {
      const next = accounts.map(a =>
        a.email === email ? {...a, ...patch} : a,
      );
      await saveAccounts(next);
      const updated = next.find(a => a.email === email);
      if (updated && user?.email === email) {
        const profile = toProfile(updated);
        setUser(profile);
        await writeJSON(SESSION_KEY, profile);
      }
    },
    [accounts, saveAccounts, user],
  );

  const value = useMemo<SessionValue>(
    () => ({
      ready,
      user,
      account: user ? findAccount(user.email) ?? null : null,
      findAccount,
      signUp: async (name, email, password) => {
        if (findAccount(email)) {
          throw new SessionError('EMAIL_EXISTS');
        }
        await saveAccounts([
          ...accounts,
          {
            name: name.trim(),
            email: normalizeEmail(email),
            pass: password,
            provider: 'password',
          },
        ]);
      },
      logIn: async (email, password) => {
        const account = findAccount(email);
        if (
          !account ||
          account.provider === 'google' ||
          account.pass !== password
        ) {
          throw new SessionError('WRONG_CREDENTIALS');
        }
        return startSession(account);
      },
      logInWithGoogle: async profile => {
        const email = normalizeEmail(profile.email);
        let account = findAccount(email);
        if (!account) {
          account = {
            name: profile.name || profile.givenName || email,
            email,
            pass: '',
            provider: 'google',
            photoUrl: profile.photo ?? undefined,
          };
          await saveAccounts([...accounts, account]);
        }
        return startSession(account);
      },
      logInAsGuest: async () => {
        const profile: UserProfile = {
          email: GUEST_ID,
          name: null,
          givenName: null,
          familyName: null,
          photoUrl: null,
        };
        setUser(profile);
        await writeJSON(SESSION_KEY, profile);
      },
      isGuest: user?.email === GUEST_ID,
      logOut: async () => {
        setUser(null);
        await removeKey(SESSION_KEY);
      },
      updateName: async name => {
        if (user) {
          await updateAccount(user.email, {name: name.trim()});
        }
      },
      changePassword: async (current, next) => {
        const account = user ? findAccount(user.email) : undefined;
        if (!account || account.pass !== current) {
          throw new SessionError('WRONG_PASSWORD');
        }
        await updateAccount(account.email, {pass: next});
      },
      resetPassword: async (email, next) => {
        const account = findAccount(email);
        if (!account) {
          throw new SessionError('NOT_FOUND');
        }
        await updateAccount(account.email, {pass: next});
      },
      setPhone: async phone => {
        if (user) {
          await updateAccount(user.email, {phone});
        }
      },
    }),
    [
      ready,
      user,
      accounts,
      findAccount,
      saveAccounts,
      startSession,
      updateAccount,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside SessionProvider');
  }
  return value;
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const MIN_PASSWORD_LENGTH = 6;
