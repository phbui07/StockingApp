export interface InitPageProps {
  img: any;
  title: string;
  description: string;
}

export interface SignUpInputFieldProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
}

export interface StockHomeData1Interface {
  name: string;
  logo: any;
  shortName: string;
  isIncrease: boolean;
  value: number;
}

export interface StockHomeData2Interface {
  logo: any;
  name: string;
  shortName: string;
  isIncrease: boolean;
  value: number;
  chart: any;
}

export interface StockHomeData3Interface {
  logo: any;
  name: string;
  shortName: string;
  isIncrease: boolean;
  value: number;
  chart: any;
  amount: string;
}

export interface InforStatusViewProps {
  label: string;
  amount: string;
  icon: any;
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
}

export interface LoginISFirstTimeProps {
  isFirst: String[];
  setIsFirst: React.Dispatch<React.SetStateAction<string[]>>;
}
