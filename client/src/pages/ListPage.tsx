import { Suspense, use } from "react";
import { useParams } from "react-router-dom";
import { type APIResponse, type List } from "../types";

export function ListPage() {
   const { listId } = useParams();
   const responsePromise = fetch(`/api/l/${listId}`);

   return (
      <Suspense fallback={<p>Loading...</p>}>
         <ListComponent promise={responsePromise.then((r) => r.json())} />
      </Suspense>
   );
}

interface ListComponentProps {
   promise: Promise<APIResponse<List>>;
}

function ListComponent({ promise }: ListComponentProps) {
   const response = use(promise);

   if (response.status === "error") {
      return <p>An error occurred.</p>;
   }

   return <p>{response.data.name}</p>;
}
