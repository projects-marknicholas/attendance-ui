$(document).ready(function () {
  // Function to fetch data from API and populate table
  function fetchAndPopulateTable() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/faculty',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var facultyData = response.data;

          // Clear existing table rows
          $('#facultyTable tbody').empty();

          // Populate table with fetched data
          $.each(facultyData, function (index, faculty) {
            var row = '<tr>' +
                        '<td>' + faculty.faculty_id + '</td>' +
                        '<td>' + faculty.id_no + '</td>' +
                        '<td>' + faculty.name + '</td>' +
                        '<td>' +
                          '<button class="btn btn-edit" data-toggle="modal" data-target="#editFacultyModal" data-faculty-id="' + faculty.faculty_id + '">Edit</button> ' +
                          '<button class="btn btn-delete" data-faculty-id="' + faculty.faculty_id + '">Delete</button>' +
                        '</td>' +
                      '</tr>';
            $('#facultyTable tbody').append(row);
          });

          // Reinitialize DataTable after populating data
          $('#facultyTable').DataTable();
        } else {
          showErrorAlert('Failed to fetch data');
        }
      },
      error: function (error) {
        showErrorAlert('Error fetching data');
      }
    });
  }

  // Call fetchAndPopulateTable function on document ready
  fetchAndPopulateTable();

  // Add new faculty button click handler
  $('#saveFacultyBtn').click(function () {
    var idNo = $('#facultyIdNo').val();
    var name = $('#facultyName').val();

    // Perform AJAX request to add new faculty
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/faculty',
      method: 'POST',
      dataType: 'json',
      data: {
        id_no: idNo,
        name: name
      },
      success: function (response) {
        if (response.status === 'success') {
          // Close modal after successful addition
          $('#addFacultyModal').modal('hide');
          $('#addFacultyForm')[0].reset();
          // Refresh table after addition
          fetchAndPopulateTable();
          showSuccessAlertWithConfirm('Faculty added successfully');
        } else {
          showErrorAlertWithConfirm('Failed to add faculty');
        }
      },
      error: function (error) {
        showErrorAlertWithConfirm('Error adding faculty');
      }
    });
  });

  // Edit button click handler (delegated for dynamic buttons)
  $('#facultyTable').on('click', '.btn-edit', function () {
    var facultyId = $(this).data('faculty-id');
    var facultyIdNo = $(this).closest('tr').find('td:eq(1)').text();
    var facultyName = $(this).closest('tr').find('td:eq(2)').text();

    // Set modal values
    $('#editFacultyModal').modal('show');
    $('#editFacultyModal').find('#editFacultyIdNo').val(facultyIdNo);
    $('#editFacultyModal').find('#editFacultyName').val(facultyName);

    // Save changes button click handler for updating faculty
    $('#updateFacultyBtn').off('click').on('click', function () {
      var updatedIdNo = $('#editFacultyIdNo').val();
      var updatedName = $('#editFacultyName').val();

      // Perform AJAX request to update faculty data
      $.ajax({
        url: 'https://attendance-teacher.mchaexpress.com/api/v1/put_faculty?faculty_id=' + facultyId,
        method: 'POST', // Assuming this is a POST request for updating
        dataType: 'json',
        data: {
          id_no: updatedIdNo,
          name: updatedName
        },
        success: function (response) {
          if (response.status === 'success') {
            // Close modal after successful update
            $('#editFacultyModal').modal('hide');
            // Refresh table after update
            fetchAndPopulateTable();
            showSuccessAlertWithConfirm('Faculty updated successfully');
          } else {
            showErrorAlertWithConfirm('Failed to update faculty');
          }
        },
        error: function (error) {
          showErrorAlertWithConfirm('Error updating faculty');
        }
      });
    });
  });

  // Delete button click handler (delegated for dynamic buttons)
  $('#facultyTable').on('click', '.btn-delete', function () {
    var facultyId = $(this).data('faculty-id');

    // Show confirmation dialog for deletion
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it'
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform AJAX request to delete faculty data
        $.ajax({
          url: 'https://attendance-teacher.mchaexpress.com/api/v1/faculty?faculty_id=' + facultyId,
          method: 'DELETE',
          dataType: 'json',
          success: function (response) {
            if (response.status === 'success') {
              // Refresh table after deletion
              fetchAndPopulateTable();
              showSuccessAlertWithConfirm('Faculty deleted successfully');
            } else {
              showErrorAlertWithConfirm('Failed to delete faculty');
            }
          },
          error: function (error) {
            showErrorAlertWithConfirm('Error deleting faculty');
          }
        });
      }
    });
  });

  // Function to show success alert with confirm button
  function showSuccessAlertWithConfirm(message) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonText: 'OK'
    }).then((result) => {
      // Optionally handle confirm button click
    });
  }

  // Function to show error alert with confirm button
  function showErrorAlertWithConfirm(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonText: 'OK'
    }).then((result) => {
      // Optionally handle confirm button click
    });
  }
});