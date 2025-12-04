import ErrorBoundary from "@/components/ErrorBoundary";
import { ListHeader } from "@/components/list/ListHeader";
import { ListPageContext, ListPageProvider } from "@/components/list/ListPageProvider";
import { ListPasswordForm } from "@/components/list/ListPasswordForm";
import { ListTasks } from "@/components/list/ListTasks";
import { Button } from "@/components/ui/button";
import { PageWrapper } from "@/layouts/PageWrapper";
import { db } from "@/lib/firebase";
import { transformEmailToDatabase } from "@/lib/utils";
import { get, onValue, ref } from "firebase/database";
import { Suspense, useContext, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

export function ListPage() {
  const { listId } = useParams();
  const listRef = ref(db, `lists/${listId}`);

  document.title = "Loading list...";

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary fallback={<p>An error occurred</p>}>
        <ListPageProvider listRef={listRef} listPromise={get(listRef)}>
          <List />
        </ListPageProvider>
      </ErrorBoundary>
    </Suspense>
  );
}

export function List() {
  const ctx = useContext(ListPageContext);
  if (!ctx) throw new Error("Not in context");
  const { list, setList, listRef, doLiveUpdates, isAccessible, user, setIsAccessible } = ctx;

  useEffect(() => {
    if (list !== null && doLiveUpdates) {
      return onValue(listRef, (snapshot) => {
        setList(snapshot.val());
      });
    }
  }, [listRef, doLiveUpdates]);

  if (list === null) {
    document.title = "List not found";

    return (
      <div className="grid gap-3 justify-items-start">
        <p>This list doesn't exist or was deleted by its owners.</p>
        <Button variant="secondary" asChild>
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  if (!user || !user.email || (list.owner_id !== user.uid && list?.shares?.[transformEmailToDatabase(user.email)] !== true)) {
    return <Navigate to="/" />;
  }

  document.title = list.name;

  if (!isAccessible) {
    return <ListPasswordForm list={list} setIsAccessible={setIsAccessible} />;
  }

  return (
    <PageWrapper>
      <ListHeader />
      <ListTasks />
    </PageWrapper>
  );
}
