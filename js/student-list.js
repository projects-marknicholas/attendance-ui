$(document).ready(function () {
  // Initialize DataTable
  var table = $('#attendanceTable').DataTable({
    "order": [],
    "columnDefs": [{
      "targets": [6],
      "orderable": false,
      "searchable": false
    }]
  });

  // Custom filtering by date and teacher
  $('#dateFilter, #teacherFilter').on('change', function () {
    var teacherValue = $('#teacherFilter').val();
    table.columns(1).search(teacherValue).draw();
  });

  // Select/Deselect all checkboxes
  $('#selectAll').on('click', function () {
    var isChecked = $(this).prop('checked');
    $('.studentCheckbox').prop('checked', isChecked);
  });

  $('.studentCheckbox').on('click', function () {
    if (!$(this).prop('checked')) {
      $('#selectAll').prop('checked', false);
    }
  });

  // Fetch and populate subjects
  fetch('https://attendance-teacher.mchaexpress.com/api/v1/all-subject')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        const subjectSelect = $('#subjectSelect');
        data.data.forEach(subject => {
          subjectSelect.append(new Option(subject.subject, subject.subject_code));
        });
      }
    })
    .catch(error => {
      console.error('Error fetching subjects:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was an error fetching subjects.'
      });
    });

  // Fetch and populate student data
  fetch('https://attendance-teacher.mchaexpress.com/api/v1/students')
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        const tableBody = $('#attendanceTable tbody');
        table.clear(); // Clear existing data
        data.data.forEach(student => {
          const row = `<tr>
            <td><input type="checkbox" class="studentCheckbox" data-course-id="${student.course_id}" data-course="${student.course}" data-student-id="${student.student_id}"></td>
            <td>${student.last_name}</td>
            <td>${student.first_name}</td>
            <td>${student.course}</td>
            <td>${student.year_level}</td>
            <td>${student.class_id}</td>
            <td><button class="btn btn-danger btn-delete" data-student-id="${student.student_id}">Delete</button></td>
          </tr>`;
          table.row.add($(row));
        });
        table.draw(); // Redraw the DataTable
      } else {
        
      }
    })
    .catch(error => {
      
    });

  // Save button click event
  $('#saveButton').on('click', function () {
    const selectedSubjectCode = $('#subjectSelect').val();
    if (!selectedSubjectCode) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please select a subject.'
      });
      return;
    }

    // Fetch the subject ID using the selected subject code
    fetch(`https://attendance-teacher.mchaexpress.com/api/v1/subject-id?subject_code=${selectedSubjectCode}`)
      .then(response => response.json())
      .then(subjectData => {
        if (subjectData.status === 'success') {
          const subjectId = subjectData.data[0].subject_id;

          const selectedData = [];
          $('.studentCheckbox:checked').each(function () {
            const courseId = $(this).data('course-id');
            const course = $(this).data('course');
            const studentId = $(this).data('student-id');
            selectedData.push({
              subject_id: subjectId,
              subject_code: selectedSubjectCode,
              course_id: courseId,
              course: course,
              student_id: studentId
            });
          });

          // Insert selected data into the database
          fetch('https://attendance-teacher.mchaexpress.com/api/v1/attendance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(selectedData)
          })
            .then(response => response.json())
            .then(insertData => {
              if (insertData.status === 'success') {
                Swal.fire({
                  icon: 'success',
                  title: 'Success',
                  text: 'Attendance data saved successfully.'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: insertData.message || 'There was an error saving attendance data.'
                });
              }
            })
            .catch(error => {
              console.error('Error saving attendance data:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an error saving attendance data.'
              });
            });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error fetching subject ID.'
          });
        }
      })
      .catch(error => {
        console.error('Error fetching subject ID:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'There was an error fetching subject ID.'
        });
      });
  });

  // Delete button click event
  $('#attendanceTable').on('click', '.btn-delete', function () {
    const studentId = $(this).data('student-id');
    console.log('Deleting student with ID:', studentId); // Log the student ID

    // Confirm deletion
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Send DELETE request to backend
        fetch(`https://attendance-teacher.mchaexpress.com/api/v1/students?student_id=${studentId}`, {
          method: 'DELETE'
        })
          .then(response => response.json())
          .then(deleteData => {
            if (deleteData.status === 'success') {
              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'The student has been deleted.'
              });
              // Remove the deleted row from the DataTable
              table.row($(this).closest('tr')).remove().draw();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: deleteData.message || 'There was an error deleting the student.'
              });
            }
          })
          .catch(error => {
            console.error('Error deleting student:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'There was an error deleting the student.'
            });
          });
      }
    });
  });

  // Fetch and populate teacher name when a subject is selected
  $('#subjectSelect').on('change', function () {
    const selectedSubjectCode = $(this).val();
    if (selectedSubjectCode) {
      fetch('https://attendance-teacher.mchaexpress.com/api/v1/class')
        .then(response => response.json())
        .then(data => {
          if (data.status === 'success') {
            const teacherName = findTeacherName(data.data, selectedSubjectCode);
            if (teacherName) {
              $('#teacherFilter').val(teacherName);
            } else {
              $('#teacherFilter').val('');
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No teacher found for this subject.'
              });
            }
          } else {
            $('#teacherFilter').val('');
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to fetch teacher information.'
            });
          }
        })
        .catch(error => {
          console.error('Error fetching teacher data:', error);
          $('#teacherFilter').val('');
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'There was an error fetching teacher information.'
          });
        });
    } else {
      $('#teacherFilter').val('');
    }
  });

  // Function to find teacher name based on subject code
  function findTeacherName(classData, subjectCode) {
    for (let i = 0; i < classData.length; i++) {
      if (classData[i].subject_code === subjectCode) {
        return classData[i].name;
      }
    }
    return null;
  }
});
