export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  token: string;
  user: SafeUser;
}
