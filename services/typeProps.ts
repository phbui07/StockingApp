export interface InitPageProps {
  img: any;
  title: string;
  description: string;
}

export interface SignUpInputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure?: boolean;
}

export interface UserProfile {
  email: string;
  familyName: string | null;
  givenName: string | null;
  name: string | null;
  photoUrl: string | null;
}

export interface AccountInterface {
  name: string;
  email: string;
  pass: string;
  provider?: 'password' | 'google';
  phone?: string;
  photoUrl?: string;
}
