import { LoadingPage } from "@//components/loading-page";
import { ListHeader } from "@/components/list-header";
import { ListPageContext } from "@/components/providers/list/context";
import { ListPageProvider } from "@/components/providers/list/provider";
import { PageWrapper } from "@/layouts/page-wrapper";
import { auth } from "@/lib/firebase";
import { transformEmailToDatabase } from "@/lib/utils";
import { Suspense, useContext, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate, useParams } from "react-router-dom";

export function ListPage() {
   const { listId } = useParams();

   return (
      <Suspense fallback={<LoadingPage />}>
         <ListPageProvider listId={listId}>
            <List />
         </ListPageProvider>
      </Suspense>
   );
}

export function List() {
   const [user] = useAuthState(auth);
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { list } = ctx;

   useEffect(() => {
      document.title = list.name;
   }, [list]);

   // Access controls
   if (
      !user ||
      !user.email ||
      (list.owner_id !== user.uid && list?.shares?.[transformEmailToDatabase(user.email)] !== true)
   ) {
      return <Navigate to="/" />;
   }

   return (
      <PageWrapper>
         <ListHeader />
      </PageWrapper>
   );
}
