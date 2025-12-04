import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthPage } from "./layouts/AuthPage";
import { RequireAuth } from "./layouts/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { ListPage } from "./pages/ListPage";
import { LoginPage } from "./pages/LoginPage";

function App() {
  return (
    <>
      <main className="bg-background w-240 max-w-full overflow-hidden px-4 mx-auto py-8 min-h-full grid grid-cols-1 place-items-center">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RequireAuth />}>
              <Route index element={<HomePage />} />
              <Route path="/l/:listId" element={<ListPage />} />
            </Route>
            <Route path="/" element={<AuthPage />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </main>
      <Toaster closeButton theme="dark" richColors />
    </>
  );
}

export default App;
