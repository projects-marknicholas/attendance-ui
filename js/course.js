$(document).ready(function () {
  // Function to fetch course data from API
  function fetchCourseData() {
    return fetch('https://attendance-teacher.mchaexpress.com/api/v1/course')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          return data.data;
        } else {
          throw new Error('Failed to fetch data');
        }
      })
      .catch(error => {
        return []
      });
  }

  // Function to initialize DataTable with fetched data
  function initializeDataTable(courseData) {
    $('#courseTable tbody').empty(); // Clear existing table rows

    courseData.forEach(course => {
      $('#courseTable tbody').append(`
        <tr>
          <td>${course.course_id}</td>
          <td>${course.course}</td>
          <td>${course.description}</td>
          <td>
            <button class="btn btn-edit" data-toggle="modal" data-target="#editCourseModal" data-course-id="${course.course_id}">Edit</button>
            <button class="btn btn-delete" data-course-id="${course.course_id}">Delete</button>
          </td>
        </tr>
      `);
    });

    // Initialize DataTable
    $('#courseTable').DataTable();
  }

  // Function to handle successful update
  function handleUpdateSuccess() {
    // Close modal after successful update
    $('#editCourseModal').modal('hide');
    // Display success alert using SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Course updated successfully',
    });
    // Refresh table after successful update
    refreshCourseTable();
  }

  // Function to handle successful course deletion
  function handleDeleteSuccess() {
    // Display success alert using SweetAlert
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Course deleted successfully',
    });
    // Refresh table after successful deletion
    refreshCourseTable();
  }

  // Function to refresh course table data
  function refreshCourseTable() {
    fetchCourseData()
      .then(courseData => initializeDataTable(courseData))
      .catch();
  }

  // Initial load of course data and table initialization
  fetchCourseData()
    .then(courseData => initializeDataTable(courseData))
    .catch();

  // Edit button click handler
  $('#courseTable').on('click', '.btn-edit', function () {
    var courseId = $(this).data('course-id');
    var courseName = $(this).closest('tr').find('td:eq(1)').text();
    var courseDescription = $(this).closest('tr').find('td:eq(2)').text();

    // Set modal values
    $('#editCourseModal').modal('show');
    $('#editCourseModal').find('#editCourseName').val(courseName);
    $('#editCourseModal').find('#editCourseDescription').val(courseDescription);

    // Save changes button click handler
    $('#updateCourseBtn').off('click').on('click', function () {
      var updatedCourseName = $('#editCourseName').val();
      var updatedCourseDescription = $('#editCourseDescription').val();

      // Example AJAX request for updating course
      var updateData = new FormData();
      updateData.append('course_id', courseId);
      updateData.append('course', updatedCourseName);
      updateData.append('description', updatedCourseDescription);

      fetch(`https://attendance-teacher.mchaexpress.com/api/v1/put_course?course_id=${courseId}`, {
        method: 'POST', // Assuming the endpoint accepts POST method for updating
        body: updateData,
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to update course');
        }
        return response.json();
      })
      .then(data => {
        handleUpdateSuccess();
      })
      .catch(error => {
        // Handle errors or show appropriate message to the user
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Failed to update course!',
        });
      });
    });
  });

  // Delete button click handler
  $('#courseTable').on('click', '.btn-delete', function () {
    var courseId = $(this).data('course-id');

    // Confirm deletion
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this course!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it'
    }).then((result) => {
      if (result.isConfirmed) {
        // Example AJAX request for deleting course
        fetch(`https://attendance-teacher.mchaexpress.com/api/v1/course?course_id=${courseId}`, {
          method: 'DELETE',
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to delete course');
          }
          return response.json();
        })
        .then(data => {
          handleDeleteSuccess();
        })
        .catch(error => {
          // Handle errors or show appropriate message to the user
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Failed to delete course!',
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cancelled',
          text: 'Your course is safe :)',
          icon: 'info'
        });
      }
    });
  });

  // Save new course button click handler
  $('#saveCourseBtn').click(function () {
    var newCourseName = $('#courseName').val();
    var newCourseDescription = $('#courseDescription').val();

    // Example AJAX request for saving new course
    var newCourseData = new FormData();
    newCourseData.append('course', newCourseName);
    newCourseData.append('description', newCourseDescription);

    fetch('https://attendance-teacher.mchaexpress.com/api/v1/course', {
      method: 'POST',
      body: newCourseData,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add new course');
      }
      return response.json();
    })
    .then(data => {
      // Close modal after successful save
      $('#addCourseModal').modal('hide');
      // Display success alert using SweetAlert
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'New course added successfully',
      });
      // Refresh table after adding new course
      refreshCourseTable();
    })
    .catch(error => {
      // Handle errors or show appropriate message to the user
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to add new course!',
      });
    });
  });
});