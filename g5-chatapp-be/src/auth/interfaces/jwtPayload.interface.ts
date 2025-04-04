export interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}
