document.addEventListener('DOMContentLoaded', function () {
  // Check if user data is already stored in localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
  } else {
    window.location.href = '../';
  }
});