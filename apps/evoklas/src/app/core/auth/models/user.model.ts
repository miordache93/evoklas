export interface User {
  id: number;
  email: string;
  name: string;
  surname: string;
  password?: string;
  password2?: string;
  fullName: string;
  accessToken?: string;
  role: string | null;
}
