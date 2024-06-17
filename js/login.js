document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from submitting

    const formData = new FormData(document.getElementById('loginForm'));

    // Validate username is not empty
    if (!formData.get('username').trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Login failed',
        text: 'Username is required.',
      });
      return;
    }

    // Send POST request using fetch API
    fetch('https://attendance-teacher.mchaexpress.com/api/auth/login', {
      method: 'POST',
      body: formData, // Send FormData directly
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 'success') {
        // Show success message using SweetAlert2
        Swal.fire({
          icon: 'success',
          title: 'Login successful',
          text: 'Welcome ' + data.user.full_name, // Replace with appropriate user data
        })
        .then((result) => {
          if (result.isConfirmed || result.isDismissed) { // Check if the user clicked "OK"
            // Redirect to /admin
            window.location.href = 'admin/';
          }
        });

        // Store data.user in localStorage with expiry
        const now = new Date();
        const expiration = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('user', JSON.stringify({
          data: data.user,
          expiration: expiration.getTime() // Store expiration time as timestamp
        }));
      } else {
        // Show error message using SweetAlert2
        Swal.fire({
          icon: 'error',
          title: 'Login failed',
          text: data.message,
        });
      }
    })
    .catch(error => {
      // Show error message using SweetAlert2
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message,
      });
    });
  });
});
