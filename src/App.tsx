import { SettingsProvider } from "@/components/providers/settings-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthPage } from "@/layouts/auth-page";
import { RequireAuth } from "@/layouts/require-auth";
import { HomePage } from "@/pages/home";
import { LoginPage } from "@/pages/login";
import { RegisterPage } from "@/pages/register";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

function App() {
   return (
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
         <SettingsProvider>
            <main className="bg-background max-w-full overflow-hidden px-4 mx-auto py-8 min-h-full grid grid-cols-1 place-items-center">
               <BrowserRouter>
                  <Routes>
                     <Route path="/" element={<RequireAuth />}>
                        <Route index element={<HomePage />} />
                     </Route>
                     <Route path="/" element={<AuthPage />}>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                     </Route>
                  </Routes>
               </BrowserRouter>
            </main>
            <Toaster />
         </SettingsProvider>
      </ThemeProvider>
   );
}

export default App;
