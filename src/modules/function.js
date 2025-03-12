var _a;
import { loadTasks, updateTaskStatus, deleteTask, assignTaskToMember, addTask } from "./tasks.js";
import { loadMembers, addMember, displayMembers } from "./member.js";
import { filterAndSortTasks } from "./filter.js";
// När sidan laddas, hämta och visa data
document.addEventListener("DOMContentLoaded", async () => {
    displayTasks(); // Visa uppgifter vid sidladdning
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
            // Lägg till medlemmen i Firebase och invänta resultatet
            await addMember({ name, roles: selectedRoles });
            // Uppdatera medlemmarna på sidan
            displayMembers();
            // Töm fälten efter att medlemmen har lagts till
            nameInput.value = "";
            roleSelect.selectedIndex = -1;
        });
    }
    else {
        console.error("Add Member button not found!");
    }
});
// Lägg till en uppgift via formuläret
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
    displayTasks();
    titleInput.value = "";
    descriptionInput.value = "";
    categorySelect.selectedIndex = 0;
});
// Visa uppgifter i Scrum Board
export async function displayTasks(filteredTasksFromDb) {
    var _a;
    const tasks = filteredTasksFromDb || await loadTasks();
    const filterMemberSelect = document.getElementById("filter-member");
    const filterCategorySelect = document.getElementById("filter-category");
    const sortOptionSelect = document.getElementById("sort-option");
    const filterMember = filterMemberSelect ? filterMemberSelect.value : "";
    const filterCategory = filterCategorySelect ? filterCategorySelect.value : "";
    const sortOption = sortOptionSelect ? sortOptionSelect.value : "timestamp-desc";
    // Filtrera och sortera uppgifterna
    const tasksToDisplay = await filterAndSortTasks(tasks, filterMember, filterCategory, sortOption);
    // Om inga uppgifter finns efter filtrering, visa ett meddelande
    if (tasksToDisplay.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No tasks available for the selected filters.";
        (_a = document.getElementById("tasks-container")) === null || _a === void 0 ? void 0 : _a.appendChild(message);
    }
    else {
        // Annars fortsätter vi med att visa uppgifterna i kolumnerna
        const newTasksColumn = document.getElementById("new-tasks");
        const inProgressColumn = document.getElementById("in-progress-tasks");
        const doneColumn = document.getElementById("done-tasks");
        // Rensa kolumnerna innan vi lägger till nya uppgifter
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
                        await displayTasks();
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
// Tilldela en uppgift till en medlem
async function assignTask(taskId) {
    console.log("Assign button clicked! Task ID:", taskId); // 🔥 Testutskrift
    const members = await loadMembers(); // Hämta alla medlemmar från Firebase
    console.log("Loaded members:", members); // 🔥 Testutskrift
    if (members.length === 0) {
        alert("No members available to assign.");
        return;
    }
    // Hämta uppgiften för att kolla vilken kategori den tillhör
    const tasks = await loadTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
        console.error("Task not found.");
        return;
    }
    // Skapa en dropdown för att välja medlem
    const memberSelect = document.createElement("select");
    members.forEach(member => {
        if (member.id) { // ✅ Kontrollera att medlemmen har ett ID
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
        if (selectedMemberId) { // ✅ Kontrollera att vi har ett giltigt ID
            const selectedMember = members.find(member => member.id === selectedMemberId);
            if (!selectedMember) {
                console.error("Selected member not found.");
                return;
            }
            // Kontrollera om medlemmen har rätt roll för uppgiften
            if (!selectedMember.roles.includes(task.category)) {
                alert(`Member ${selectedMember.name} cannot be assigned to this task. This task requires a ${task.category} role.`);
                return; // Förhindrar att uppgiften går till "in-progress"
            }
            await assignTaskToMember(taskId, selectedMemberId);
            // Uppdatera uppgiften till 'in-progress'
            await updateTaskStatus(taskId, "in-progress"); // Uppdatera statusen till "in-progress"
            displayTasks(); // Uppdatera Scrum Board
        }
        else {
            console.error("Member ID is missing. Cannot assign task.");
        }
    });
    // Visa dropdown och knapp för att bekräfta val
    const assignDiv = document.getElementById("assign-container");
    if (assignDiv && assignDiv.children.length === 0) { // 🆕 Kontrollera att det inte redan finns en dropdown
        assignDiv.appendChild(memberSelect);
        assignDiv.appendChild(assignButton);
    }
}
export async function refreshTasks() {
    await displayTasks(); // Laddar om uppgiftslistan
}
