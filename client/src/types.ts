export type APIResponse<TData> =
   | {
        status: "success";
        data: TData;
     }
   | {
        status: "error";
        error: string;
     };

export interface List {
   id: string;
   name: string;
}
