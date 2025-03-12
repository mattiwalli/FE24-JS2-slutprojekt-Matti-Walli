import { Member, databaseURL } from './firebase';
import { displayTasks } from './function';
import { displayMemberDropdown } from './filter';

document.addEventListener("DOMContentLoaded", async () => {
  displayMembers();  // Hämtar och visar medlemmarna när sidan laddas
  displayTasks();    // Visa uppgifter vid sidladdning
  displayMemberDropdown()
});


export async function getMembers(): Promise<Member[]> {
  
  try {
    const response = await fetch(`${databaseURL}/members.json`);
    if (!response.ok) throw new Error("Failed to fetch members");

    const data: Record<string, { name: string; roles: string | string[] }> | null = await response.json();
    
    console.log("Raw data from Firebase:", data);

    if (!data) return []; // Om inga medlemmar finns, returnera en tom array

    const members = Object.keys(data).map((key) => {
      const member = data[key];
      return {
        id: key, // Använd nyckeln som ID
        name: member.name ?? "No name", // Använd namn från databasen
        roles: Array.isArray(member.roles) ? member.roles : [member.roles], // Säkerställ att rollerna är en array
      };
    });
    console.log("Mapped members:", members);
    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
  
}



export async function displayMembers() {
  const memberList = document.getElementById("member-list");
  console.log("🔄 displayMembers() anropas");
  console.trace(); // 🔍 Visar varifrån funktionen anropas
  if (!memberList) return;

  // Töm listan med medlemmar innan vi lägger till nya
  memberList.innerHTML = "";

  const members = await loadMembers(); // Hämtar medlemmar från Firebase

  members.forEach(member => {
    // Säkerställ att rollen alltid är en array
    const rolesArray = Array.isArray(member.roles) ? member.roles : [member.roles];

    // Lägg till medlem i listan
    const li = document.createElement("li");
    li.textContent = `${member.name} - ${rolesArray.join(", ")}`;
    memberList.appendChild(li);
  });
}




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

    console.log('New member added with ID:', responseData.name);

    // 🔹 Uppdatera DOM direkt istället för att anropa displayMembers()
    const memberList = document.getElementById("member-list");
    if (memberList) {
      // ✅ Kontrollera så att medlemmen INTE redan finns i listan
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




// Hämta alla medlemmar på REST API
export function loadMembers(): Promise<Member[]> {
  const url = `${databaseURL}/members.json`;

  return fetch(url)
    .then((response) => response.json())
    .then((data: { [key: string]: Member } | null) => {
      console.log("Fetched members from Firebase:", data); // 🔥 Debug

      if (!data) return []; // Om Firebase är tom, returnera en tom array

      const members = Object.entries(data).map(([id, member]) => ({
        id,
        name: member.name ?? "Unknown", // Om name är undefined, sätt "Unknown"
        roles: Array.isArray(member.roles) ? member.roles : ["No roles assigned"], // Om roles saknas, sätt default
      }));

      console.log("Mapped members array:", members);
      return members;
    })
    .catch((error) => {
      console.error("Error loading members:", error);
      return [];
    });
}
