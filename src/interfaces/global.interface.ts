export interface ResponseData<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthLogin {
  username: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  username: string;
}
