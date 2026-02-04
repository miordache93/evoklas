export class User {
  id!: number;
  email!: string;
  password?: string;
  password2?: string;
  fullName!: string;
  accessToken?: string;
  role!: string | null;
}
