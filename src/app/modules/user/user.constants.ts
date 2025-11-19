export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
  VENDOR: 'VENDOR',
} as const;

export const gender = ['Male', 'Female', 'Others'] as const;
// 1️⃣ Array of roles: ['admin', 'passenger', ...]
export type USER_ROLE_INTERFACE = typeof USER_ROLE[keyof typeof USER_ROLE];
export const USER_ROLE_ENUM = Object.values(USER_ROLE);
