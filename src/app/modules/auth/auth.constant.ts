export const LOGIN_WITH= {
  GOOGLE : 'google',
  APPLE : 'apple',
  FACEBOOK : 'facebook',
  CREDENTIALS : 'credentials',
} as const

export type LOGIN_WITH_INTERFACE = typeof LOGIN_WITH[keyof typeof LOGIN_WITH];
export const LOGIN_WITH_ENUM = Object.values(LOGIN_WITH);