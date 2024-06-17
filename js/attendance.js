$(document).ready(function () {
  // Initialize DataTable
  var attendanceTable = $('#attendanceTable').DataTable({
    "order": [],
    "columnDefs": [{
      "targets": [3],
      "orderable": false,
      "searchable": false
    }]
  });

  // Custom filtering by date
  $('#dateFilter').on('change', function () {
    var dateValue = $(this).val();
    attendanceTable.column(1).search(dateValue).draw();
  });

  // Fetch data from API and populate table
  function fetchDataAndPopulateTable() {
    fetch('https://attendance-teacher.mchaexpress.com/api/v1/attendance')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Clear existing rows in the table
          attendanceTable.clear().draw();

          // Populate table with API data
          data.data.forEach(item => {
            attendanceTable.row.add([
              item.attendance_id,
              item.created_at.split(' ')[0], // Extract date only
              item.subject,
              `<button class="btn btn-view" data-toggle="modal" data-target="#attendanceModal" data-subject-id="${item.subject_id}" data-subject-code="${item.subject_code}" data-attendance-id="${item.attendance_id}">View</button>
               <button class="btn btn-delete" data-attendance-id="${item.attendance_id}">Delete</button>`
            ]).draw(false);
          });

        } else {
          throw new Error('API request failed');
        }
      })
      .catch(error => {
        console.error('Error fetching attendance data:', error);
        // Optionally, show error message to user
      });
  }

  fetchDataAndPopulateTable();

  // Handle Delete button click
  $('#attendanceTable').on('click', '.btn-delete', function () {
    var attendanceId = $(this).data('attendance-id');

    // Confirm deletion using SweetAlert2
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this attendance record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Proceed with deletion
        fetch(`https://attendance-teacher.mchaexpress.com/api/v1/attendance?attendance_id=${attendanceId}`, {
            method: 'DELETE'
          })
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.status === 'success') {
              // Reload table data after deletion
              fetchDataAndPopulateTable();
              Swal.fire(
                'Deleted!',
                'The attendance record has been deleted.',
                'success'
              );
            } else {
              throw new Error('Delete request failed');
            }
          })
          .catch(error => {
            console.error('Error deleting attendance record:', error);
            Swal.fire(
              'Error!',
              'Failed to delete attendance record.',
              'error'
            );
          });
      }
    });
  });

  // Initialize modal
  $('#attendanceModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget); // Button that triggered the modal
    var modal = $(this);
    var subjectId = button.data('subject-id');
    var subjectCode = button.data('subject-code');
    var attendanceId = button.data('attendance-id');

    // Make API call to fetch detailed attendance information
    fetch(`https://attendance-teacher.mchaexpress.com/api/v1/view-attendance?subject_id=${subjectId}&subject_code=${subjectCode}&attendance_id=${attendanceId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Clear existing rows in the modal table
          modal.find('#studentAttendanceTable tbody').empty();

          // Populate modal table with detailed attendance data
          data.data.forEach(student => {
            modal.find('#studentAttendanceTable tbody').append(`
              <tr>
                <td>${student.student_id}</td>
                <td>${student.student_name}</td>
                <td>${student.course}</td>
                <td>${student.created_at}</td>
                <td>Present</td>
              </tr>
            `);
          });
        } else {
          throw new Error('API request failed');
        }
      })
      .catch(error => {
        console.error('Error fetching detailed attendance data:', error);
        // Optionally, show error message to user
      });

    modal.find('.modal-title').text('View Student Attendance - ' + subjectCode);
  });
});