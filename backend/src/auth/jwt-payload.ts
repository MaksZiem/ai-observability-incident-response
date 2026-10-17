export type TokenType = 'access' | 'stream';

export interface JwtPayload {
  sub: string;
  email: string;
  type?: TokenType;
}
