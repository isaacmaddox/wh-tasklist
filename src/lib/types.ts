export interface List {
   id: string;
   owner_id: string;
   name: string;
   password_protected: boolean;
   hash: string;
   salt: string;
   tasks?: Record<string, Task>;
   shares?: Record<string, boolean>;
}

export interface Task {
   list_id: string;
   name: string;
   completed: boolean;
   due_date: number;
   flagged?: boolean;
}

export interface UserSettings {
   function?: {
      soonDays?: number;
   };
   appearance?: {
      width?: "wide" | "standard" | "full";
   };
}
