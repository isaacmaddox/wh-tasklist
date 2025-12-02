import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ListPage } from "./pages/ListPage";

function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route index element={<HomePage />} />
            <Route path="/l/:listId" element={<ListPage />} />
         </Routes>
      </BrowserRouter>
   );
}

export default App;
