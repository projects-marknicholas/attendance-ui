$(document).ready(function () {
  // Function to fetch and populate table data
  function fetchAndPopulateTable() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/class',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var dataTable = $('#classTable').DataTable();
          dataTable.clear().draw(); // Clear existing table data

          // Iterate over each class data and add to DataTable
          $.each(response.data, function (index, classData) {
            var rowData = [
              classData.class_id,
              classData.subject_code,
              classData.subject,
              classData.name,
              '<button class="btn btn-edit" data-toggle="modal" data-target="#editClassModal" data-class-id="' + classData.class_id + '">Edit</button> ' +
              '<button class="btn btn-delete" data-subject-code="' + classData.subject_code + '">Delete</button>'
            ];
            dataTable.row.add(rowData).draw(false); // Add new row and redraw table
          });
        } else {
          // Handle error response
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error fetching class data: ' + response.message
          });
        }
      },
      error: function (error) {
        // Handle AJAX error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error fetching class data: ' + error.responseText
        });
      }
    });
  }

  // Initialize DataTable with columns
  var classTable = $('#classTable').DataTable({
    columns: [
      { title: "Class ID" },
      { title: "Subject Code" },
      { title: "Subject Name" },
      { title: "Faculty Name" },
      { title: "Action" }
    ]
  });

  // Fetch and populate table on page load
  fetchAndPopulateTable();

  // Edit button click handler to populate modal with selected data
  $('#classTable').on('click', '.btn-edit', function () {
    var classId = $(this).data('class-id');

    // Find the row in the DataTable based on class_id
    var rowData = classTable.rows(function (idx, data, node) {
      return data[0] === classId; // Check if class_id matches
    }).data()[0]; // Get the data of the first matching row

    // Populate modal fields with selected data
    $('#editClassModal').modal('show');
    $('#editClassModal').find('#editClassId').val(rowData[0]); // Class ID
    $('#editClassModal').find('#editSubjectCode').val(rowData[1]); // Subject Code
    $('#editClassModal').find('#editSubject').val(rowData[2]); // Subject
    $('#editClassModal').find('#editFaculty').val(rowData[3]); // Faculty Name

    // Save changes button click handler
    $('#updateClassBtn').off('click').on('click', function () {
      // Implement your update logic here (e.g., AJAX request)
      $('#editClassModal').modal('hide');
    });
  });

  // Delete button click handler
  $('#classTable').on('click', '.btn-delete', function () {
    var subjectCode = $(this).data('subject-code');

    // Confirm deletion
    Swal.fire({
      icon: 'warning',
      title: 'Confirm',
      text: 'Are you sure you want to delete this class?',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it'
    }).then(function (result) {
      if (result.isConfirmed) {
        // Perform AJAX DELETE request
        $.ajax({
          url: 'https://attendance-teacher.mchaexpress.com/api/v1/class?subject_code=' + subjectCode,
          method: 'DELETE',
          success: function (response) {
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Class deleted successfully'
            });
            // Reload table data after deletion
            fetchAndPopulateTable();
          },
          error: function (error) {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Error deleting class: ' + error.responseText
            });
          }
        });
      }
    });
  });

  // Function to fetch subjects and populate dropdown
  function fetchAndPopulateSubjectsDropdown() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/all-subject',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var selectSubject = $('#selectSubject');
          selectSubject.empty(); // Clear existing options

          // Populate dropdown with subjects
          $.each(response.data, function (index, subject) {
            selectSubject.append('<option value="' + subject.subject_code + '">' + subject.subject + '</option>');
          });
        } else {
          // Handle error response
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error fetching subjects: ' + response.message
          });
        }
      },
      error: function (error) {
        // Handle AJAX error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error fetching subjects: ' + error.responseText
        });
      }
    });
  }

  // Function to fetch faculties and populate dropdown
  function fetchAndPopulateFacultiesDropdown() {
    $.ajax({
      url: 'https://attendance-teacher.mchaexpress.com/api/v1/faculty',
      method: 'GET',
      dataType: 'json',
      success: function (response) {
        if (response.status === 'success') {
          var selectFaculty = $('#selectFaculty');
          selectFaculty.empty(); // Clear existing options

          // Populate dropdown with faculties
          $.each(response.data, function (index, faculty) {
            selectFaculty.append('<option value="' + faculty.id_no + '" data-faculty-name="' + faculty.name + '">' + faculty.name + '</option>');
          });
        } else {
          // Handle error response
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error fetching faculties: ' + response.message
          });
        }
      },
      error: function (error) {
        // Handle AJAX error
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error fetching faculties: ' + error.responseText
        });
      }
    });
  }

  // Fetch subjects and faculties on page load
  fetchAndPopulateSubjectsDropdown();
  fetchAndPopulateFacultiesDropdown();

  // Save button click handler for adding a new class
  $('#saveClassBtn').on('click', function () {
    // Trigger form submission
    $('#addClassForm').submit();
  });

  // Form submission handler for adding a new class
  $('#addClassForm').on('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    var form = $(this);

    // Check if the form is valid
    if (form[0].checkValidity() === false) {
      event.stopPropagation();
    } else {
      // Get selected class ID (e.g., "1-A", "2-B")
      var selectedClass = $('#selectClass').val();
      var classId = selectedClass; // Use selectedClass as it already includes the dash (e.g., "1-A")
      var subjectCode = $('#selectSubject').val();
      var facultyId = $('#selectFaculty').val();
      console.log(facultyId);
      var facultyName = $('#selectFaculty option:selected').data('faculty-name'); // Get selected faculty name from data attribute

      // Create FormData object
      var formData = new FormData();
      formData.append('class_id', classId);
      formData.append('subject_code', subjectCode);
      formData.append('faculty_id', facultyId);

      // Send AJAX POST request to add new class
      $.ajax({
        url: 'https://attendance-teacher.mchaexpress.com/api/v1/class',
        method: 'POST',
        processData: false,  // Prevent jQuery from processing data or setting contentType
        contentType: false,  // Prevent jQuery from setting contentType
        data: formData,
        success: function (response) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Class added successfully'
          });
          $('#addClassForm')[0].reset();
          // Optionally, clear form inputs or perform any other actions
          $('#addClassModal').modal('hide');
          fetchAndPopulateTable(); // Refresh table data
        },
        error: function (error) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error adding class: ' + error.responseText
          });
        }
      });
    }
  });
});
