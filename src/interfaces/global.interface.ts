export interface ResponseData<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthUser {
  userId: number;
  username: string;
}
