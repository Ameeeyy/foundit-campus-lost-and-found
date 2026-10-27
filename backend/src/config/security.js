const EXAMPLE_JWT_SECRET = 'replace-this-with-a-random-secret-of-at-least-32-characters';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a value of at least 32 characters.');
  }

  if (process.env.NODE_ENV === 'production' && secret === EXAMPLE_JWT_SECRET) {
    throw new Error('Replace the example JWT_SECRET with a unique production secret.');
  }

  return secret;
};

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 1000 * 60 * 60 * 24 * 7,
});
