export const JWT_CONSTANTS = {
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30m',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
