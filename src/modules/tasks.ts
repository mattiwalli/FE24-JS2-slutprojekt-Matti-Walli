import { Task, databaseURL } from './firebase';
import { displayTasks, refreshTasks, } from "./function";



// Lägg till en ny uppgift via REST API
export async function addTask(task: Task): Promise<void> {
  const url = `${databaseURL}/tasks.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    throw new Error("Failed to add task");
  }

  const responseData = await response.json();
  const taskId = responseData.name; // Firebase returnerar ID i `name`

  // Uppdatera uppgiften med sitt ID
  await fetch(`${databaseURL}/tasks/${taskId}.json`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: taskId }), // Lägg till ID i uppgiften
  });
}


// Hämta alla uppgifter
export function loadTasks(): Promise<Task[]> {
  const url = `${databaseURL}/tasks.json`;
  return fetch(url)
    .then((response) => response.json())
    .then((data: { [key: string]: Task } | null) => {
      if (!data) return []; // Om Firebase är tom, returnera en tom array

      return Object.entries(data).map(([id, task]) => ({ ...task, id }));
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
      return [];
    });
}

export async function updateTaskStatus(taskId: string, status: "new" | "in-progress" | "done"): Promise<void> {
  const url = `${databaseURL}/tasks/${taskId}.json`;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task status. Status: ${response.status}`);
    }

    const updatedTask = await response.json(); // 🔥 Hämta svaret från Firebase
    console.log("Updated Task:", updatedTask); // 🔥 Debugging

    refreshTasks(); // 🔄 Uppdatera Scrum Board direkt efter statusändring
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}



export async function assignTaskToMember(taskId: string, memberId: string): Promise<void> {
  const memberUrl = `${databaseURL}/members/${memberId}.json`;
  
  try {
    const response = await fetch(memberUrl);
    const memberData = await response.json();

    if (memberData && memberData.name) {
      // Uppdatera uppgiften med medlemsnamnet istället för ID
      const taskUrl = `${databaseURL}/tasks/${taskId}.json`;
      await fetch(taskUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned: memberData.name, // Spara medlemsnamn
          status: "in-progress",
        }),
      });
      console.log("Task assigned to:", memberData.name);

      refreshTasks();
    } else {
      console.error("Member not found or member has no name.");
    }
  } catch (error) {
    console.error("Error assigning task:", error);
  }
}



// Ta bort en uppgift via REST API
export async function deleteTask(taskId: string): Promise<void> {
  const url = `${databaseURL}/tasks/${taskId}.json`;

  try {
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    refreshTasks(); // 🔄 Uppdatera Scrum Board direkt efter borttagning
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}


