export const JWT_SESSION_EXPIRES_IN = '1d';
export const JWT_REMEMBER_EXPIRES_IN = '30d';

export function getJwtExpiresIn(rememberMe?: boolean): string {
  return rememberMe ? JWT_REMEMBER_EXPIRES_IN : JWT_SESSION_EXPIRES_IN;
}

export function getJwtExpiresInSeconds(rememberMe?: boolean): number {
  return rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
}
