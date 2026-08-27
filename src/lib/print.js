/**
 * Print utility.
 */

export const print = {
  window: () => {
    if (typeof window !== 'undefined') window.print();
  },
};
