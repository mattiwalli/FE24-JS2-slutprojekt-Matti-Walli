import { databaseURL } from './firebase.js';
import { showTasks } from './function.js';
import { showMemberfilter } from './filter.js';
document.addEventListener("DOMContentLoaded", async () => {
    showMembers();
    showTasks();
    showMemberfilter();
});
//-----------------------------------------------------------------//
export async function getMembers() {
    try {
        const response = await fetch(`${databaseURL}/members.json`);
        if (!response.ok)
            throw new Error("Failed to fetch members");
        const data = await response.json();
        if (!data)
            return [];
        const members = Object.keys(data).map((key) => {
            var _a;
            const member = data[key];
            return {
                id: key,
                name: (_a = member.name) !== null && _a !== void 0 ? _a : "No name",
                roles: Array.isArray(member.roles) ? member.roles : [member.roles],
            };
        });
        return members;
    }
    catch (error) {
        console.error("Error fetching members:", error);
        return [];
    }
}
//-----------------------------------------------------------------------//
export async function showMembers() {
    const memberList = document.getElementById("member-list");
    if (!memberList)
        return;
    memberList.innerHTML = "";
    const members = await loadMembers();
    members.forEach(member => {
        const rolesArray = Array.isArray(member.roles) ? member.roles : [member.roles];
        const li = document.createElement("li");
        li.textContent = `${member.name} - ${rolesArray.join(", ")}`;
        memberList.appendChild(li);
    });
}
//--------------------------------------------------------------------//
export async function addMember(member) {
    const url = `${databaseURL}/members.json`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: member.name,
                roles: member.roles,
            }),
        });
        const responseData = await response.json();
        if (!responseData)
            throw new Error('Failed to get response data');
        const memberList = document.getElementById("member-list");
        if (memberList) {
            if (![...memberList.children].some(li => { var _a; return (_a = li.textContent) === null || _a === void 0 ? void 0 : _a.includes(member.name); })) {
                const li = document.createElement("li");
                li.textContent = `${member.name} - ${member.roles.join(", ")}`;
                memberList.appendChild(li);
            }
        }
    }
    catch (error) {
        console.error('Error adding member:', error);
    }
}
//------------------------------------------------//
export function loadMembers() {
    const url = `${databaseURL}/members.json`;
    return fetch(url)
        .then((response) => response.json())
        .then((data) => {
        if (!data)
            return [];
        const members = Object.entries(data).map(([id, member]) => {
            var _a;
            return ({
                id,
                name: (_a = member.name) !== null && _a !== void 0 ? _a : "Unknown",
                roles: Array.isArray(member.roles) ? member.roles : ["No roles assigned"],
            });
        });
        return members;
    })
        .catch((error) => {
        console.error("Error loading members:", error);
        return [];
    });
}
