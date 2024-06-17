$(document).ready(function () {

  // Function to fetch and populate class_id dropdown
  function fetchAndPopulateClassDropdown() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/class',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var classes = response.data;

          // Clear existing options
          $('#class').empty();

          // Add default option
          $('#class').append($('<option>', {
            value: '',
            text: '-- Select Class --'
          }));

          // Add each class_id option
          $.each(classes, function (index, classInfo) {
            $('#class').append($('<option>', {
              value: classInfo.class_id,
              text: classInfo.class_id
            }));
          });
        } else {
          // Handle case where API returns error status
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch class data: ' + response.message
          });
        }
      },
      error: function (error) {
        
      }
    });
  }

  // Call the function to fetch and populate class dropdown on document ready
  fetchAndPopulateClassDropdown();

  // Function to fetch courses and populate add student form dropdown
  function fetchCoursesAndPopulateAddDropdown() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/course',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var courses = response.data;

          // Clear existing options
          $('#course').empty();

          // Add default option
          $('#course').append($('<option>', {
            value: '',
            text: '-- Select Course --'
          }));

          // Add each course option
          $.each(courses, function (index, course) {
            $('#course').append($('<option>', {
              value: course.course,
              text: course.course
            }));
          });
        } else {
          
        }
      },
      error: function (error) {
        
      }
    });
  }

  fetchCoursesAndPopulateAddDropdown();

  // Function to fetch and populate student data
  function fetchAndPopulateStudentTable() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/students',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var studentTable = $('#studentTable').DataTable();
          studentTable.clear().draw(); // Clear existing table data

          // Iterate over each student data and add to DataTable
          $.each(response.data, function (index, student) {
            var rowData = [
              '<img src="https://attendance-teacher.mchaexpress.com/uploads/students/' + student.image + '" alt="Student Image" class="img-thumbnail" style="width: 100px;">',
              student.student_id,
              student.last_name,
              student.first_name,
              student.course,
              student.year_level,
              student.class_id,
              '<button class="btn btn-edit btn-primary" data-student-id="' + student.student_id + '">Edit</button> <button class="btn btn-delete" data-student-id="' + student.student_id + '">Delete</button>'
            ];
            studentTable.row.add(rowData).draw(false); // Add new row and redraw table
          });
        } else {
          
        }
      },
      error: function (error) {
        
      }
    });
  }

  // Initialize DataTable
  var studentTable = $('#studentTable').DataTable();

  // Fetch and populate student data on page load
  fetchAndPopulateStudentTable();

  // Edit button click handler to populate modal with selected data
  $('#studentTable').on('click', '.btn-edit', function () {
    var studentId = $(this).data('student-id');

    // Find the row in the DataTable based on student_id
    var rowData = studentTable.rows(function (idx, data, node) {
      return data[1] === studentId; // Check if student_id matches
    }).data()[0]; // Get the data of the first matching row

    // Populate modal fields with selected data
    $('#editStudentModal').modal('show');
    $('#editStudentModal').find('#editStudentId').val(rowData[1]); // Student ID
    $('#editStudentModal').find('#editLastName').val(rowData[2]); // Last Name
    $('#editStudentModal').find('#editFirstName').val(rowData[3]); // First Name
    $('#editStudentModal').find('#editCourse').val(rowData[4]); // Course
    $('#editStudentModal').find('#editYearLevel').val(rowData[5]); // Year Level
    $('#editStudentModal').find('#editClass').val(rowData[6]); // Class

    // Fetch and populate courses in edit modal dropdown
    fetchCoursesAndPopulateEditDropdown(rowData[4]); // Pass current course as default

    // Save changes button click handler
    $('#updateStudentBtn').off('click').on('click', function () {
      // Implement your update logic here (e.g., AJAX request)
      $('#editStudentModal').modal('hide');
    });
  });

  // Form submission event handler
  $('#editStudentForm').on('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Serialize form data
    var formData = $(this).serialize();

    // Find the student ID to update
    var studentId = $('#editStudentId').val();

    // AJAX request to update student
    $.ajax({
      url: `https://attendance-teacher.mchaexpress.com/api/v1/put_students?student_id=${studentId}`,
      method: 'POST',
      data: formData,
      success: function (response) {
        if (response.status === 'success') {
          // Hide modal after successful update
          $('#editStudentModal').modal('hide');
          // Refresh table after updating student
          fetchAndPopulateStudentTable();
          // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student updated successfully'
          });
        } else {
          $('#editStudentModal').modal('hide');
          fetchAndPopulateStudentTable();
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student updated successfully'
          });
        }
      },
      error: function (error) {
        
      }
    });
  });

  // Example code to open the modal and populate fields (simplified)
  $('#studentTable').on('click', '.btn-edit', function () {
    // Example code to find and populate the modal with student data
    $('#editStudentModal').modal('show');
  });

  // Fetch and populate student data on page load
  fetchAndPopulateStudentTable();

  // Function to fetch courses and populate edit modal dropdown
  function fetchCoursesAndPopulateEditDropdown(defaultCourse) {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/course',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var courses = response.data;

          // Clear existing options
          $('#editCourse').empty();

          // Check if default course exists in fetched courses
          var defaultCourseExists = courses.some(function (course) {
            return course.course === defaultCourse;
          });

          // Add default option
          $('#editCourse').append($('<option>', {
            value: defaultCourse,
            text: defaultCourse
          }));

          // Add each course option
          $.each(courses, function (index, course) {
            $('#editCourse').append($('<option>', {
              value: course.course_id,
              text: course.course
            }));
          });

          // Set default course if available
          if (defaultCourseExists) {
            $('#editCourse').val(defaultCourse);
          } else {
            console.log('Default course not found or invalid:', defaultCourse);
            // Optionally handle this case, e.g., show a message to the user
          }
        } else {
          console.error('Failed to fetch courses:', response.message);
          // Handle error case
        }
      },
      error: function (error) {
        console.error('Error fetching courses:', error);
        // Handle error case
      }
    });
  }

  // Delete button click handler
  $('#studentTable').on('click', '.btn-delete', function () {
    var studentIdToDelete = $(this).data('student-id');

    // Show confirmation dialog
    Swal.fire({
      icon: 'warning',
      title: 'Delete Student',
      text: 'Are you sure you want to delete this student?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(function (result) {
      if (result.isConfirmed) {
        // AJAX DELETE request to delete student
        $.ajax({
          url: `https://attendance-teacher.mchaexpress.com/api/v1/students?student_id=${studentIdToDelete}`,
          method: 'DELETE',
          success: function (response) {
            if (response.status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Student deleted successfully'
              });
              fetchAndPopulateStudentTable(); // Refresh table after deletion
            } else {
              Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Student deleted successfully'
              });
              fetchAndPopulateStudentTable();
            }
          },
          error: function (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error deleting student: ' + error.responseText
            });
          }
        });
      }
    });
  });

  // Save button click handler for adding a new student
  $('#saveStudentBtn').on('click', function () {
    // Prepare FormData object
    var formData = new FormData();
    formData.append('student_id', $('#studentId').val());
    formData.append('first_name', $('#firstName').val());
    formData.append('last_name', $('#lastName').val());
    formData.append('course', $('#course').val());
    formData.append('year_level', $('#yearLevel').val());
    formData.append('class_id', $('#class').val());
    formData.append('image', $('#studentImage').prop('files')[0]);

    // AJAX request to add new student
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/students',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.status === 'success') {
          // Reset form after successful addition
          $('#addStudentForm')[0].reset();
          $('#addStudentModal').modal('hide');
          // Refresh table after adding new student
          fetchAndPopulateStudentTable();
          // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student added successfully'
          });
        } else {
          // Reset form after successful addition
          $('#addStudentForm')[0].reset();
          $('#addStudentModal').modal('hide');
          // Refresh table after adding new student
          fetchAndPopulateStudentTable();
          // Show success message using SweetAlert
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Student added successfully'
          });
        }
      },
      error: function (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error adding student: ' + error.responseText
        });
      }
    });
  });

});