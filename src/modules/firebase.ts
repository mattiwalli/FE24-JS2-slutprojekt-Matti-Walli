const databaseURL = "https://test-project-e2cba-default-rtdb.europe-west1.firebasedatabase.app/";


export interface Task {
  id?: string; 
  title: string;
  description: string;
  category: "frontend" | "backend" | "ux";
  status: "new" | "in-progress" | "done";
  timestamp: string;
  assigned: string | null;
}

export interface Member {
  id?: string; 
  name: string;
  roles: string[];
}

export { databaseURL };



