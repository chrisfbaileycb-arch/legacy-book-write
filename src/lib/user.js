/**
 * User identifier helper functions.
 */

export const getAppUserId = () => {
  try {
    const raw = localStorage.getItem('uspk_auth_user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.id) return u.id;
    }
  } catch (e) {}
  return 'user_default';
};

export const getAnonymousId = () => {
  let anon = localStorage.getItem('uspk_anon_id');
  if (!anon) {
    anon = 'anon_' + Math.random().toString(36).slice(2, 11);
    localStorage.setItem('uspk_anon_id', anon);
  }
  return anon;
};
