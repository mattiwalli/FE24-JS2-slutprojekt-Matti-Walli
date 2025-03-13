import { databaseURL } from './firebase.js';
import { refreshTasks } from "./function.js";
//-----------------------------------------------------------------//
export async function addTask(task) {
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
export function loadTasks() {
    const url = `${databaseURL}/tasks.json`;
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
        if (!data)
            return [];
        return Object.entries(data).map(([id, task]) => (Object.assign(Object.assign({}, task), { id })));
    })
        .catch((error) => {
        console.error('Error loading tasks:', error);
        return [];
    });
}
//----------------------------------------------------------------//
export async function updateTaskStatus(taskId, status) {
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
    }
    catch (error) {
        console.error("Error updating task status:", error);
    }
}
//-----------------------------------------------------------------//
export async function assignTaskToMember(taskId, memberId) {
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
        }
        else {
            console.error("Member not found or member has no name.");
        }
    }
    catch (error) {
        console.error("Error assigning task:", error);
    }
}
//-----------------------------------------------------------------//
export async function deleteTask(taskId) {
    const url = `${databaseURL}/tasks/${taskId}.json`;
    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        refreshTasks();
    }
    catch (error) {
        console.error("Error deleting task:", error);
    }
}
