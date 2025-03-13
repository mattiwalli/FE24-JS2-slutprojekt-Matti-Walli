var _a;
import { loadTasks, updateTaskStatus, deleteTask, assignTaskToMember, addTask } from "./tasks.js";
import { loadMembers, addMember, showMembers } from "./member.js";
import { filterSortTasks, showMemberfilter } from "./filter.js";
//---------------------------------------//
document.addEventListener("DOMContentLoaded", async () => {
    showTasks();
    const addMemberButton = document.getElementById("add-member-btn");
    if (addMemberButton) {
        addMemberButton.addEventListener("click", async () => {
            const nameInput = document.getElementById("member-name");
            const roleSelect = document.getElementById("member-role");
            const name = nameInput.value.trim();
            const selectedRoles = Array.from(roleSelect.selectedOptions).map(option => option.value);
            if (!name || selectedRoles.length === 0) {
                alert("Please enter a name and select at least one role.");
                return;
            }
            await addMember({ name, roles: selectedRoles });
            showMembers();
            showMemberfilter();
            nameInput.value = "";
            roleSelect.selectedIndex = -1;
        });
    }
    else {
        console.error("Add Member button not found!");
    }
});
//----------------------------------------//
(_a = document.getElementById("addTaskBtn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", async () => {
    const titleInput = document.getElementById("task-title");
    const descriptionInput = document.getElementById("task-description");
    const categorySelect = document.getElementById("task-category");
    const title = titleInput.value.trim();
    const description = descriptionInput.value.trim();
    const category = categorySelect.value;
    if (!title || !description) {
        alert("Please fill in all fields.");
        return;
    }
    const newTask = {
        title,
        description,
        category: category,
        status: "new",
        timestamp: new Date().toISOString(),
        assigned: null,
    };
    await addTask(newTask);
    showTasks();
    titleInput.value = "";
    descriptionInput.value = "";
    categorySelect.selectedIndex = 0;
});
//----------------------------------------//
export async function showTasks(filteredTasksFromDb) {
    var _a;
    const tasks = filteredTasksFromDb || await loadTasks();
    const filterMemberSelect = document.getElementById("filter-member");
    const filterCategorySelect = document.getElementById("filter-category");
    const sortOptionSelect = document.getElementById("sort-option");
    const filterMember = filterMemberSelect ? filterMemberSelect.value : "";
    const filterCategory = filterCategorySelect ? filterCategorySelect.value : "";
    const sortOption = sortOptionSelect ? sortOptionSelect.value : "timestamp-desc";
    const tasksToDisplay = await filterSortTasks(tasks, filterMember, filterCategory, sortOption);
    if (tasksToDisplay.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No tasks available for the selected filters.";
        (_a = document.getElementById("tasks-container")) === null || _a === void 0 ? void 0 : _a.appendChild(message);
    }
    else {
        const newTasksColumn = document.getElementById("new-tasks");
        const inProgressColumn = document.getElementById("in-progress-tasks");
        const doneColumn = document.getElementById("done-tasks");
        newTasksColumn.innerHTML = "<h2>New Tasks</h2>";
        inProgressColumn.innerHTML = "<h2>In Progress</h2>";
        doneColumn.innerHTML = "<h2>Done</h2>";
        tasksToDisplay.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.classList.add("task");
            const titleElement = document.createElement("h3");
            titleElement.textContent = task.title;
            taskElement.appendChild(titleElement);
            const descriptionElement = document.createElement("p");
            descriptionElement.textContent = task.description;
            taskElement.appendChild(descriptionElement);
            const categoryElement = document.createElement("p");
            categoryElement.innerHTML = `<strong>Category:</strong> ${task.category}`;
            taskElement.appendChild(categoryElement);
            const timestampElement = document.createElement("p");
            timestampElement.innerHTML = `<strong>Timestamp:</strong> ${new Date(task.timestamp).toLocaleString()}`;
            taskElement.appendChild(timestampElement);
            if (task.assigned) {
                const assignedElement = document.createElement("p");
                assignedElement.innerHTML = `<strong>Assigned to:</strong> ${task.assigned}`;
                taskElement.appendChild(assignedElement);
            }
            if (task.status === "new") {
                const assignButton = document.createElement("button");
                assignButton.textContent = "Assign";
                assignButton.addEventListener("click", () => {
                    if (task.id) {
                        assignTask(task.id);
                    }
                    else {
                        console.error("Task ID is missing. Cannot assign task.");
                    }
                });
                taskElement.appendChild(assignButton);
                newTasksColumn.appendChild(taskElement);
            }
            else if (task.status === "in-progress") {
                const doneButton = document.createElement("button");
                doneButton.textContent = "Mark as Done";
                doneButton.addEventListener("click", async () => {
                    if (task.id) {
                        await updateTaskStatus(task.id, "done");
                        await showTasks();
                    }
                    else {
                        console.error("Task ID is missing. Cannot update task.");
                    }
                });
                taskElement.appendChild(doneButton);
                inProgressColumn.appendChild(taskElement);
            }
            else if (task.status === "done") {
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.addEventListener("click", () => {
                    if (task.id) {
                        deleteTask(task.id);
                    }
                    else {
                        console.error("Task ID is missing. Cannot delete task.");
                    }
                });
                taskElement.appendChild(deleteButton);
                doneColumn.appendChild(taskElement);
            }
        });
    }
}
//----------------------------------------//
async function assignTask(taskId) {
    const members = await loadMembers();
    if (members.length === 0) {
        alert("No members available to assign.");
        return;
    }
    const tasks = await loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error("Task not found.");
        return;
    }
    const memberSelect = document.createElement("select");
    members.forEach(member => {
        if (member.id) {
            const option = document.createElement("option");
            option.value = member.id;
            option.textContent = member.name;
            memberSelect.appendChild(option);
        }
    });
    const assignButton = document.createElement("button");
    assignButton.textContent = "Confirm Assignment";
    assignButton.addEventListener("click", async () => {
        const selectedMemberId = memberSelect.value;
        if (selectedMemberId) {
            const selectedMember = members.find(member => member.id === selectedMemberId);
            if (!selectedMember) {
                console.error("Selected member not found.");
                return;
            }
            if (!selectedMember.roles.includes(task.category)) {
                alert(`Member ${selectedMember.name} cannot be assigned to this task. This task requires a ${task.category} role.`);
                return;
            }
            await assignTaskToMember(taskId, selectedMemberId);
            await updateTaskStatus(taskId, "in-progress");
            showTasks();
        }
        else {
            console.error("Member ID is missing. Cannot assign task.");
        }
    });
    const assignDiv = document.getElementById("assign-container");
    if (assignDiv && assignDiv.children.length === 0) {
        assignDiv.appendChild(memberSelect);
        assignDiv.appendChild(assignButton);
    }
}
export async function refreshTasks() {
    await showTasks();
}
