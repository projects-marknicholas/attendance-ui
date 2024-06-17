$(document).ready(function () {
  // Function to fetch subject data
  function getSubjectData() {
    fetch('https://attendance-teacher.mchaexpress.com/api/v1/subject')
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Clear existing table rows
          $('#subjectTable tbody').empty();

          // Iterate over the data and append rows to the table
          data.data.forEach(subject => {
            $('#subjectTable tbody').append(`
              <tr>
                <td>${subject.subject_id}</td>
                <td>${subject.subject_code}</td>
                <td>${subject.subject}</td>
                <td>${subject.subject_unit}</td>
                <td>${subject.description}</td>
                <td>
                  <button class="btn btn-edit" data-toggle="modal" data-target="#editSubjectModal" data-subject-id="${subject.subject_id}">Edit</button>
                  <button class="btn btn-delete" data-subject-id="${subject.subject_id}">Delete</button>
                </td>
              </tr>
            `);
          });

          // Initialize DataTable after populating data
          $('#subjectTable').DataTable();
        } else {
          
        }
      })
      .catch();
  }

  // Initial call to fetch subject data
  getSubjectData();

  // Edit button click handler
  $('#subjectTable').on('click', '.btn-edit', function () {
    var subjectId = $(this).data('subject-id');
    var subjectCode = $(this).closest('tr').find('td:eq(1)').text();
    var subjectName = $(this).closest('tr').find('td:eq(2)').text();
    var unit = $(this).closest('tr').find('td:eq(3)').text();
    var description = $(this).closest('tr').find('td:eq(4)').text();

    // Set modal values
    $('#editSubjectModal').modal('show');
    $('#editSubjectModal').find('#editSubjectCode').val(subjectCode);
    $('#editSubjectModal').find('#editSubjectName').val(subjectName);
    $('#editSubjectModal').find('#editUnit').val(unit);
    $('#editSubjectModal').find('#editSubjectDescription').val(description);

    // Update button click handler
    $('#updateSubjectBtn').off('click').on('click', function () {
      var updatedSubjectCode = $('#editSubjectCode').val();
      var updatedSubjectName = $('#editSubjectName').val();
      var updatedUnit = $('#editUnit').val();
      var updatedDescription = $('#editSubjectDescription').val();

      // Example AJAX request for updating subject
      var updateData = new FormData();
      updateData.append('subject_code', updatedSubjectCode);
      updateData.append('subject', updatedSubjectName);
      updateData.append('subject_unit', updatedUnit);
      updateData.append('description', updatedDescription);

      fetch(`https://attendance-teacher.mchaexpress.com/api/v1/put_subject?subject_id=${subjectId}`, {
        method: 'POST', // Assuming the endpoint accepts POST method for updating
        body: updateData,
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            // Close modal after successful update
            $('#editSubjectModal').modal('hide');
            // Refresh subject table after update
            getSubjectData();
            // Show success message using SweetAlert2
            Swal.fire({
              icon: 'success',
              title: 'Success!',
              text: 'Subject updated successfully',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: data.message || 'Failed to update subject',
            });
          }
        })
        .catch(error => {
          // Handle errors or show appropriate message to the user
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: 'Failed to update subject',
          });
        });
    });
  });

  // Delete button click handler
  $('#subjectTable').on('click', '.btn-delete', function () {
    var subjectId = $(this).data('subject-id');

    // Confirm deletion
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this subject!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Example AJAX request for deleting subject
        fetch(`https://attendance-teacher.mchaexpress.com/api/v1/subject?subject_id=${subjectId}`, {
          method: 'DELETE',
        })
          .then(response => response.json())
          .then(data => {
            if (data.status === 'success') {
              // Refresh subject table after deletion
              getSubjectData();
              // Show success message using SweetAlert2
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Subject has been deleted.',
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: data.message || 'Failed to delete subject',
              });
            }
          })
          .catch(error => {
            // Handle errors or show appropriate message to the user
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: 'Failed to delete subject',
            });
          });
      }
    });
  });

  // Save new subject button click handler
  $('#saveSubjectBtn').click(function () {
    var newSubjectCode = $('#subjectCode').val();
    var newSubjectName = $('#subjectName').val();
    var newUnit = $('#unit').val();
    var newDescription = $('#subjectDescription').val();

    // Example AJAX request for saving new subject
    var newSubjectData = new FormData();
    newSubjectData.append('subject_code', newSubjectCode);
    newSubjectData.append('subject', newSubjectName);
    newSubjectData.append('subject_unit', newUnit);
    newSubjectData.append('description', newDescription);

    fetch('https://attendance-teacher.mchaexpress.com/api/v1/subject', {
      method: 'POST',
      body: newSubjectData,
    })
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success') {
          // Close modal after successful save
          $('#addSubjectModal').modal('hide');
          // Refresh subject table after adding new subject
          getSubjectData();
          // Show success message using SweetAlert2
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'New subject added successfully',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: data.message || 'Failed to add new subject',
          });
        }
      })
      .catch(error => {
        // Handle errors or show appropriate message to the user
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to add new subject',
        });
      });
  });
});