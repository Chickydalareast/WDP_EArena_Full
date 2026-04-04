export const AVATAR_PROVIDER_URL = 'https://ui-avatars.com/api/';

export const generateDefaultAvatar = (name: string): string => {
  return `${AVATAR_PROVIDER_URL}?name=${encodeURIComponent(name)}&background=random`;
};