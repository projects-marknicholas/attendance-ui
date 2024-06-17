document.addEventListener('DOMContentLoaded', function () {
  // Check if user data is stored in localStorage
  const storedUser = localStorage.getItem('user');

  if (storedUser) {
    // Parse the stored user data from localStorage
    const userData = JSON.parse(storedUser);

    // Update the welcome message with user's full_name
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = `${userData.data.full_name}!`;
  }
});
