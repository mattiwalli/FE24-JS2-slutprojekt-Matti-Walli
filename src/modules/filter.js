var _a;
import { showTasks } from "./function.js";
import { loadTasks } from "./tasks.js";
import { getMembers } from "./member.js";
///------------------------------------------------------------------------------------///
export async function filterSortTasks(tasks, filterMember, filterCategory, sortOption) {
    let filteredTasks = tasks;
    if (filterMember) {
        filteredTasks = filteredTasks.filter(task => task.assigned && task.assigned === filterMember);
    }
    if (filterCategory) {
        filteredTasks = filteredTasks.filter(task => task.category === filterCategory);
    }
    if (sortOption === 'timestamp1') {
        filteredTasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    else if (sortOption === 'timestamp2') {
        filteredTasks.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }
    else if (sortOption === 'title1') {
        filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
    }
    else if (sortOption === 'title2') {
        filteredTasks.sort((a, b) => b.title.localeCompare(a.title));
    }
    return filteredTasks;
}
///------------------------------------------------------------------------------------///
(_a = document.getElementById("apply-filters")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", async () => {
    const memberSelect = document.getElementById("filter-member");
    const selectedMember = memberSelect.value;
    const categorySelect = document.getElementById("filter-category");
    const selectedCategory = categorySelect.value;
    const sortOptionSelect = document.getElementById("sort-option");
    const selectedSortOption = sortOptionSelect.value;
    const tasks = await loadTasks();
    await filterSortTasks(tasks, selectedMember, selectedCategory, selectedSortOption);
    showTasks();
});
///------------------------------------------------------------------------------------///
export async function showMemberfilter() {
    const memberSelect = document.getElementById("filter-member");
    if (!memberSelect)
        return;
    const members = await getMembers();
    memberSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Member';
    memberSelect.appendChild(defaultOption);
    members.forEach(member => {
        var _a;
        const option = document.createElement('option');
        option.value = (_a = member.name) !== null && _a !== void 0 ? _a : '';
        option.textContent = `${member.name} - ${member.roles.join(", ")}`;
        memberSelect.appendChild(option);
    });
}
