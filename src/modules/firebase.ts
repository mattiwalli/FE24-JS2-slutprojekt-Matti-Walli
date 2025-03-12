const databaseURL = "https://test-project-e2cba-default-rtdb.europe-west1.firebasedatabase.app/";

// Gränssnitt för uppgifter och medlemmar
export interface Task {
  id?: string; // Lägg till id som valfritt (Firebase skapar ID automatiskt)
  title: string;
  description: string;
  category: "frontend" | "backend" | "ux";
  status: "new" | "in-progress" | "done";
  timestamp: string;
  assigned: string | null;
}

export interface Member {
  id?: string; // Lägg till detta så att varje medlem har ett valfritt id
  name: string;
  roles: string[];
}

export { databaseURL };



