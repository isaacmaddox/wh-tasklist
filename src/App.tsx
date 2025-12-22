import { ThemeProvider } from "@/components/ThemeProvider";
import { RegisterPage } from "@/pages/RegisterPage";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { SettingsProvider } from "./components/SettingsProvider";
import { AuthPage } from "./layouts/AuthPage";
import { RequireAuth } from "./layouts/RequireAuth";
import { HomePage } from "./pages/HomePage";
import { ListPage } from "./pages/ListPage";
import { LoginPage } from "./pages/LoginPage";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <SettingsProvider>
        <main className="bg-background max-w-full overflow-hidden px-4 mx-auto py-8 min-h-full grid grid-cols-1 place-items-center">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<RequireAuth />}>
                <Route index element={<HomePage />} />
                <Route path="/l/:listId" element={<ListPage />} />
              </Route>
              <Route path="/" element={<AuthPage />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </main>
        <Toaster closeButton theme="dark" richColors />
      </SettingsProvider>
    </ThemeProvider>
  );
}

export default App;
