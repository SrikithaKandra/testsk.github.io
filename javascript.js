// To open tabs
function openTab(evt, cityName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}

// To drag tasks between columns
var tasks = [];

$(function() {
  $(".columns").sortable({
    connectWith: ".column",
    items: ".task",
    update: function(event, ui) {
      var taskId = ui.item.attr("id");
      var newStatus = ui.item.parent().attr("id");
      updateTaskStatus(taskId, newStatus);
    }
  }).disableSelection();

  $(".column").sortable({
    connectWith: ".column",
    items: ".task",
    receive: function(event, ui) {
      var taskId = ui.item.attr("id");
      var newStatus = $(this).attr("id");
      updateTaskStatus(taskId, newStatus);
    }
  }).on({
    drop: function(event) {
      drop(event);
    },
    dragover: function(event) {
      allowDrop(event);
    }
  });

  $(".task").draggable({
    revert: "invalid",
    helper: "clone"
  });
});

// Additional methods for kanban board. 
function openAddTaskModal(dateText) {
  $("#addTaskModal").css("display", "flex");
  const formattedDate = $.datepicker.formatDate("yy-mm-dd", new Date(dateText));
  $("#selectedDate").val(formattedDate);
}

function closeAddTaskModal() {
  document.getElementById("addTaskModal").style.display = "none";
  document.getElementById("addTaskForm").reset();
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event) {
  event.preventDefault();
  var data = event.dataTransfer.getData("text");
  var draggedElement = document.getElementById(data);

  if (event.target.className === "column" || event.target.className === "task") {
    event.target.appendChild(draggedElement);
  }
}

function completeTask(taskId) {
  var taskItem = document.getElementById(taskId);
  var completedTasksColumn = document.getElementById("completedTasks");
  var allTasksColumn = document.getElementById("allTasks");
  var upcomingTasksColumn = document.getElementById("upcomingTasks");

  if (taskItem && completedTasksColumn && allTasksColumn) {
    if (taskItem.parentNode === completedTasksColumn) {
      // Task is currently in the "Completed Tasks" column
      // Move it back to "All Tasks" and change button to "Complete"
      allTasksColumn.appendChild(taskItem);
      taskItem.querySelector("button").innerText = "Complete";
    } else if (taskItem.parentNode === allTasksColumn || taskItem.parentNode === upcomingTasksColumn){
      // Task is currently in "All Tasks" or "Upcoming Tasks"
      // Move it to "Completed Tasks" and change button to "Incomplete"
      completedTasksColumn.appendChild(taskItem);
      taskItem.querySelector("button").innerText = "Incomplete";
    } else {
      taskItem.querySelector("button").innerText = "Edit";
    }
  }
}


function addTask() {
  var title = document.getElementById("taskTitle").value;
  var description = document.getElementById("taskDescription").value;
  var course = document.getElementById("courseOptions").value;
  var selectedDate = document.getElementById("selectedDate").value;
  var priorityColor = "";
  var priority = document.getElementById("taskPriority").value;
  if (priority === "low") {
    priorityColor = "green";
  } else if (priority === "medium") {
    priorityColor = "orange";
  } else if (priority === "high") {
    priorityColor = "red";
  }
  // Regular expression to match disallowed characters
  var disallowedCharsRegex = /[\/\\?*:“<>~;'"[\]{}()&^%$.]/;

  // Check if title or description contain disallowed characters
  if (disallowedCharsRegex.test(title) || disallowedCharsRegex.test(description)) {
    alert("Task name and description cannot contain the following characters: / \\ ? * : “ < > ~ ; ' [ ] { } ( ) & ^ % . $");
    return false; // Prevent form submission
  }
  var editMode = document.getElementById("addTaskForm").getAttribute("data-edit-mode") === "true";
  var taskId = document.getElementById("addTaskForm").getAttribute("data-task-id");

  if (title.trim() !== "") {
    if (!selectedDate) {
      // If no date is selected, set today's date
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
      var yyyy = today.getFullYear();
      selectedDate = yyyy + '-' + mm + '-' + dd;
      document.getElementById("selectedDate").value = selectedDate; // Set the input field value
    }

    if (editMode && taskId) {
      // If in edit mode, update the existing task
      var taskItem = document.getElementById(taskId);
      taskItem.querySelector("h3").innerText = `${title} - ${course}`;
      taskItem.querySelector("p").innerText = description;
      taskItem.querySelector("p:nth-child(4)").innerHTML = `<strong> Deadline </strong>: ${selectedDate}`; // Update the date field
      taskItem.querySelector("p:nth-child(3)").innerHTML = `<strong> Priority </strong>: ${priority}`; // Update the priority field
      // Update other task details if needed

      closeAddTaskModal();
    } else {
      // If not in edit mode, add a new task
      var allTasksColumn = document.getElementById("allTasks");
      var taskItem = document.createElement("div");
      var taskId = "task" + Date.now();

      taskItem.setAttribute("class", "task");
      taskItem.setAttribute("id", taskId);
      taskItem.setAttribute("draggable", "true");
      taskItem.setAttribute("ondragstart", "drag(event)");

      taskItem.innerHTML = `
      <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
      <h3 style="color: ${priorityColor};display: inline-block;">${title} - ${course}</h3>
      <div<button class="button-container" style="color: black;" onclick="toggleDetails('${taskId}')">View Details</button></div>
      </h3>
      </div>
      <div class="details" style="display: none;">
      <p style="color: ${priorityColor};">${description}</p>
      <p><b>Priority:</b> ${priority}</p> 
      <p><b>Deadline:</b> ${selectedDate}</p> 
      </div>
      <div style="margin-top: 10px;"> 
      <button class="complete-button" onclick="completeTask('${taskId}')">Complete</button>
      <button class="edit-button" onclick="editTask('${taskId}')">Edit</button>
      <button class="delete-button" onclick="deleteTask('${taskId}')">Delete</button>
      </div>
      `;
      allTasksColumn.appendChild(taskItem);
      closeAddTaskModal();
    }
    return false;
  } else {
    alert("Please enter a task title.");
  }
}

function toggleDetails(taskId) {
  var details = document.getElementById(taskId).querySelector(".details");
  if (details.style.display === "none") {
      details.style.display = "block";
  } else {
      details.style.display = "none";
  }
}


function updateTaskStatus(taskId, newStatus) {
  var taskItem = document.getElementById(taskId);
  var targetColumn = document.getElementById(newStatus);

  if (taskItem.querySelector("button").innerText === "Edit") {
    return;
  }
  if (taskItem && targetColumn) {
    var completeButton = taskItem.querySelector("button");
    // Update the button text based on the target column
    if (newStatus === "completedTasks") {
      completeButton.innerText = "Incomplete";
    } else {
      completeButton.innerText = "Complete";
    }

    taskItem.parentNode.removeChild(taskItem);
    targetColumn.appendChild(taskItem);

    if (newStatus === "calendar") {
      // Get the date from the task
      var taskDate = taskItem.querySelector("p:nth-child(3)").innerText;

      // Find the date cell on the calendar and append the task title
      $(".ui-datepicker-calendar td a:contains(" + taskDate + ")").parent().append('<div class="calendar-task">' + taskTitle + '</div>');
      showCalendar();
    }
  }
}

function editTask(taskId) {
  var taskItem = document.getElementById(taskId);
  var title = taskItem.querySelector("h3").innerText.split(" - ")[0];
  var course = taskItem.querySelector("h3").innerText.split(" - ")[1];
  var description = taskItem.querySelector(".details > p:first-child").innerText;
  var selectedDate = taskItem.querySelector(".details > p:nth-child(3)").innerText.split(": ")[1];
  var priority = taskItem.querySelector(".details > p:nth-child(2)").innerText.split(": ")[1];

  // Set form fields with task details for editing
  document.getElementById("taskTitle").value = title;
  document.getElementById("taskDescription").value = description;
  document.getElementById("selectedDate").value = selectedDate;
  document.getElementById("taskPriority").value = priority;
  document.getElementById("courseOptions").value = course;

  // Open the AddTaskModal window
  openAddTaskModal(selectedDate);

  // Set attributes to indicate edit mode and task ID
  document.getElementById("addTaskForm").setAttribute("data-edit-mode", "true");
  document.getElementById("addTaskForm").setAttribute("data-task-id", taskId);
}


// // Flag and event handler for delete confirmation.
// var deleteOption = false;
// document.getElementById("yesDeleteTask").onclick = function() {

// }

function deleteTask(taskId) {
  var taskItem = document.getElementById(taskId);
  // Ask for confirmation before deleting.
  if (window.confirm("Are you sure you want to delete this?") && taskItem) {
    // Show the undo popup before deleting the task
    showUndoPopup(taskId);
    taskItem.parentNode.removeChild(taskItem);
  }
}

// Global variable to store the last deleted task
var lastDeletedTask = null;

// Function to show the undo popup
function showUndoPopup(taskId) {
  // Store the task information before deleting it
  lastDeletedTask = document.getElementById(taskId).cloneNode(true);

  // Show the undo popup
  var undoPopup = document.getElementById("undoPopup");
  undoPopup.style.display = "block";

  // Set a timeout to automatically close the popup after a few seconds
  setTimeout(function() {
    closeUndoPopup();
  }, 5000); // Adjust the time as needed
}

// Function to close the undo popup
function closeUndoPopup() {
  var undoPopup = document.getElementById("undoPopup");
  undoPopup.style.display = "none";
}

// Function to undo the last deletion
function undoDeletion() {
  if (lastDeletedTask) {
    var allTasksColumn = document.getElementById("allTasks");
    allTasksColumn.appendChild(lastDeletedTask);
    lastDeletedTask = null;
    closeUndoPopup();
  }
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

// Functions for Course tab
/* Used to open the add course window. */
function openAddCourseWindow() {
  document.getElementById("addCourse").style.display = "flex";
}

/* Used to close the course menu. */
function closeAddCourseWindow() {
  document.getElementById("addCourse").style.display = "none";
  document.getElementById("addCourseForm").reset();
}

/* Used to add courses. */
function addCourse() {
  var name = document.getElementById("courseName").value;
  var description = document.getElementById("courseDescription").value;
  var courseColumn = document.getElementById("courseListSpring");
  var courseItem = document.createElement("div");
  var courseId = name;
  // Dropdown bar for the options of courses in Add Task.
  var courseOptionsBar = document.getElementById("courseOptions");
  var option = document.createElement("option");

  // Set the course attributes and add to the course list.
  courseItem.setAttribute("class", "task");
  courseItem.setAttribute("id", courseId);
  courseItem.innerHTML = `
      <div style="display: flex; flex-direction: row; justify-content: flex-start; gap: 20px; align-items: center;">
      <h4 style="display: inline-block;">${name}</h3>
      <p style="display: inline-block;">${description}</p>
      <button onclick="editCourse('${courseId}')" style="display: inline-block;">Edit</button>
      <button onclick="removeCourse('${courseId}')" style="display: inline-block;">Remove</button>      
      </div>
      `;
  courseColumn.appendChild(courseItem);

  // Also update the dropdown bar.
  option.value = name;
  option.textContent = name;
  courseOptionsBar.appendChild(option);

  closeAddCourseWindow();
  return false; // Prevent form submission
}

/* Used to edit courses. */
function editCourse(courseId) {
  var course = document.getElementById(courseId);
  var name = course.querySelector("h4").innerText;
  var description = course.querySelector("p").innerText;
  var courseOptionsBar = document.getElementById("courseOptions");
  var options = courseOptionsBar.options;

  document.getElementById("courseName").value = name;
  document.getElementById("courseDescription").value = description;

  // Remove the task item from the list
  course.parentNode.removeChild(course);

  // Also remove the course from the add task course options.
  for (var i = 0; i < options.length; i++) {
    if (options[i].textContent === courseId) {
      courseOptionsBar.removeChild(options[i]);
      break;
    }
  }
  openAddCourseWindow();
}

function removeCourse(courseId) {
  var course = document.getElementById(courseId);
  var courseOptionsBar = document.getElementById("courseOptions");
  var options = courseOptionsBar.options;

  if (window.confirm("Are you sure you would like to delete this?") && course) {
    course.parentNode.removeChild(course);
    // This is to make sure users cannot choose the deleted course when adding tasks.
    for (var i = 0; i < options.length; i++) {
      if (options[i].textContent === courseId) {
        courseOptionsBar.removeChild(options[i]);
        break;
      }
    }
  }
}

function toggleColors() {
    var body = document.body;
    body.classList.toggle("dark-mode");
    document.getElementById("course-menu-title").style.color="black";
}



// Functions for Calendar tab
function showCalendar() {
  // Show a larger calendar initially
  $("#calendarSection").css({
    "display": "flex",
    "flex-direction": "column",
    "align-items": "center",
    "justify-content": "center"
  });

  // // Add a close button to the calendar section
  // $("#calendarSection").html(`
  //     <button onclick="closeCalendar()" class="close-calendar-button">Close</button>
  //     <div id="calendar" class="calendar"></div>
  // `);

  $("#calendar").datepicker({
    onSelect: function(dateText) {
      // Open the add task modal when a date is selected
      openAddTaskModal(dateText);

      // Hide the calendar after selecting a date
      closeCalendar();
    }
  });

  // Highlight the current date
  var currentDate = new Date();
  var day = currentDate.getDate();
  $(".ui-datepicker-calendar td a:contains(" + day + ")").parent().addClass("highlight");

  console.log("Tasks:", tasks);
  tasks.forEach(function(task) {
    var taskDate = task.deadline;

    console.log("Task Date:", taskDate);

    // Find the date cell on the calendar and append the task title
    var matchingDateCell = $(".ui-datepicker-calendar td a:contains(" + taskDate + ")").parent();

    if (matchingDateCell.length > 0) {
      matchingDateCell.append('<div class="calendar-task">' + task.title + '</div>');
    } else {
      console.warn("No matching date cell found for task:", task);
    }
  });
}

// function closeCalendar() {
//   $("#calendarSection").hide();
// }
