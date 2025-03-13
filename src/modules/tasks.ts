import { Task, databaseURL } from './firebase';
import {refreshTasks} from "./function";



//-----------------------------------------------------------------//
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
  const taskId = responseData.name; 

  
  await fetch(`${databaseURL}/tasks/${taskId}.json`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: taskId }), 
  });
}


//-----------------------------------------------------------------//
export function loadTasks(): Promise<Task[]> {
  const url = `${databaseURL}/tasks.json`;
  return fetch(url)
    .then((response) => response.json())
    .then((data: { [key: string]: Task } | null) => {
      if (!data) return [];

      return Object.entries(data).map(([id, task]) => ({ ...task, id }));
    })
    .catch((error) => {
      console.error('Error loading tasks:', error);
      return [];
    });
}


//----------------------------------------------------------------//
export async function updateTaskStatus(taskId: string, status:
  "new" | "in-progress" | "done"): 
Promise<void> {

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

    refreshTasks(); 
  } catch (error) {
    console.error("Error updating task status:", error);
  }
}

//-----------------------------------------------------------------//
export async function assignTaskToMember(taskId: string, memberId:
   string): Promise<void> {
  const memberUrl = `${databaseURL}/members/${memberId}.json`;
  
  try {
    const response = await fetch(memberUrl);
    const memberData = await response.json();

    if (memberData && memberData.name) {
      
      const taskUrl = `${databaseURL}/tasks/${taskId}.json`;
      await fetch(taskUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assigned: memberData.name, 
          status: "in-progress",
        }),
      });
      
      refreshTasks();
    } else {
      console.error("Member not found or member has no name.");
    }
  } catch (error) {
    console.error("Error assigning task:", error);
  }
}



//-----------------------------------------------------------------//
export async function deleteTask(taskId: string): Promise<void> {
  const url = `${databaseURL}/tasks/${taskId}.json`;

  try {
    const response = await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    refreshTasks(); 
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}





