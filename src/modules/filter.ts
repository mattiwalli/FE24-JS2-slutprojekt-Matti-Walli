import { displayTasks } from "./function";
import { Task } from './firebase';
import { loadTasks } from "./tasks";
import { getMembers } from "./member";



// Funktion som filtrerar och sorterar uppgifter


document.getElementById("apply-filters")?.addEventListener("click", async () => {
    const memberSelect = document.getElementById("filter-member") as HTMLSelectElement;
    const selectedMember = memberSelect.value;
  
    const categorySelect = document.getElementById("filter-category") as HTMLSelectElement;
    const selectedCategory = categorySelect.value;
  
    const sortOptionSelect = document.getElementById("sort-option") as HTMLSelectElement;
    const selectedSortOption = sortOptionSelect.value;
  
    // Hämta uppgifter
    const tasks = await loadTasks(); // Se till att du har en funktion för att hämta alla uppgifter
  
    // Filtrera och sortera uppgifterna
    const filteredTasks = await filterAndSortTasks(tasks, selectedMember, selectedCategory, selectedSortOption);
  
    // Visa de filtrerade uppgifterna
    displayTasks();
  });

  export async function displayMemberDropdown() {
    const memberSelect = document.getElementById("filter-member") as HTMLSelectElement;
    if (!memberSelect) return;
  
    const members = await getMembers();
    memberSelect.innerHTML = '';
  
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Member';
    memberSelect.appendChild(defaultOption);
  
    members.forEach(member => {
      const option = document.createElement('option');
      // Sätt värdet till medlemens namn
      option.value = member.name ?? '';
      option.textContent = `${member.name} - ${member.roles.join(", ")}`;
      memberSelect.appendChild(option);
    });
  }
  
  
  
  // Funktion som filtrerar och sorterar uppgifter
  export async function filterAndSortTasks(
    tasks: Task[], 
    filterMember: string, 
    filterCategory: string, 
    sortOption: string
  ): Promise<Task[]> {
    let filteredTasks = tasks;
  
    // Filtrera på medlem (jämför medlemsnamn)
    if (filterMember) {
      filteredTasks = filteredTasks.filter(task => task.assigned && task.assigned === filterMember);
    }
  
    // Filtrera på kategori
    if (filterCategory) {
      filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }
  
    // Sortering
    if (sortOption === 'timestamp-desc') {
      filteredTasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else if (sortOption === 'timestamp-asc') {
      filteredTasks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } else if (sortOption === 'title-asc') {
      filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === 'title-desc') {
      filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
    }
  
    return filteredTasks;
  }
  