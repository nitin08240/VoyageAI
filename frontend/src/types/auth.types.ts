export interface IUser {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  preferences?: IUserPreferences;
  createdAt?: string;
}

export interface IUserPreferences {
  travelStyle?: 'budget' | 'comfort' | 'luxury';
  food?: string[];
  activities?: string[];
  accommodation?: string;
  currency?: string;
  notifications?: INotificationPrefs;
}

export interface INotificationPrefs {
  email: boolean;
  browser: boolean;
  tripReminders: boolean;
}

export interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  acceptTerms?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: IUser;
  token?: string;
}
