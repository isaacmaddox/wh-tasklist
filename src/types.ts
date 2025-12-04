export type APIResponse<TData> =
  | {
      status: "success";
      data: TData;
      error?: never;
    }
  | {
      status: "error";
      error: string;
      data?: never;
    };

export type WithSessionKey<T> = {
  content: T;
  session_key: string;
};

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
}
