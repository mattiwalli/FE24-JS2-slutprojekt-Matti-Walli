import { Member, databaseURL } from './firebase';
import { displayTasks } from './function';
import { displayMemberDropdown } from './filter';

document.addEventListener("DOMContentLoaded", async () => {
  displayMembers();  
  displayTasks();   
  displayMemberDropdown()
});

//-----------------------------------------------------------------//
export async function getMembers(): Promise<Member[]> {
  
  try {
    const response = await fetch(`${databaseURL}/members.json`);
    if (!response.ok) throw new Error("Failed to fetch members");

    const data: Record<string, { name: string; roles: string | string[] }> | null = await response.json();
    
    if (!data) return []; 

    const members = Object.keys(data).map((key) => {
      const member = data[key];
      return {
        id: key,
        name: member.name ?? "No name",
        roles: Array.isArray(member.roles) ? member.roles : [member.roles],
      };
    });
    console.log("Mapped members:", members);
    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  
}


//-----------------------------------------------------------------------//
export async function displayMembers() {
  const memberList = document.getElementById("member-list");
  if (!memberList) return;

 
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
export async function addMember(member: Member): Promise<void> {
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
    if (!responseData) throw new Error('Failed to get response data');

    const memberList = document.getElementById("member-list");
    if (memberList) {
      if (![...memberList.children].some(li => li.textContent?.includes(member.name))) {
        const li = document.createElement("li");
        li.textContent = `${member.name} - ${member.roles.join(", ")}`;
        memberList.appendChild(li);
      }
    }

  } catch (error) {
    console.error('Error adding member:', error);
  }
}




//------------------------------------------------//
export function loadMembers(): Promise<Member[]> {
  const url = `${databaseURL}/members.json`;

  return fetch(url)
    .then((response) => response.json())
    .then((data: { [key: string]: Member } | null) => {
      if (!data) return []; 

      const members = Object.entries(data).map(([id, member]) => ({
        id,
        name: member.name ?? "Unknown", 
        roles: Array.isArray(member.roles) ? member.roles : ["No roles assigned"],
      }));
      return members;
    })
    .catch((error) => {
      console.error("Error loading members:", error);
      return [];
    });
}
