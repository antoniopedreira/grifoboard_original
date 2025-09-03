/**
 * Utility to handle auth redirects based on URL hash
 */
export const handleAuthRedirect = () => {
  const hash = window.location.hash;
  
  // Check if this is a password reset link
  if (hash.includes('type=recovery')) {
    // Clear the hash and redirect to reset password page
    window.history.replaceState({}, document.title, window.location.pathname);
    window.location.href = '/reset-password';
    return true;
  }
  
  return false;
};