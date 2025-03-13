import { showTasks } from "./function";
import { Task } from './firebase';
import { loadTasks } from "./tasks";
import { getMembers } from "./member";



///------------------------------------------------------------------------------------///
export async function filterSortTasks(
  tasks: Task[], 
  filterMember: string, 
  filterCategory: string, 
  sortOption: string
): Promise<Task[]> {
  let filteredTasks = tasks;

  
  if (filterMember) {
    filteredTasks = filteredTasks.filter(task => task.assigned && task.assigned === filterMember);
  }

  
  if (filterCategory) {
    filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
  }

  
  if (sortOption === 'timestamp1') {
    filteredTasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } else if (sortOption === 'timestamp2') {
    filteredTasks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } else if (sortOption === 'title1') {
    filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === 'title2') {
    filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
  }

  return filteredTasks;
}




///------------------------------------------------------------------------------------///
document.getElementById("apply-filters")?.addEventListener("click", async () => {
    const memberSelect = document.getElementById("filter-member") as HTMLSelectElement;

    const selectedMember = memberSelect.value;
  
    const categorySelect = document.getElementById("filter-category") as HTMLSelectElement;

    const selectedCategory = categorySelect.value;
  
    const sortOptionSelect = document.getElementById("sort-option") as HTMLSelectElement;

    const selectedSortOption = sortOptionSelect.value;
  
    const tasks = await loadTasks(); 
  
    await filterSortTasks(tasks, selectedMember, selectedCategory, selectedSortOption);
    showTasks();
  });





///------------------------------------------------------------------------------------///
  export async function showMemberfilter() {
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
      option.value = member.name ?? '';
      option.textContent = `${member.name} - ${member.roles.join(", ")}`;
      memberSelect.appendChild(option);
    });
  }
  
  
  
  
