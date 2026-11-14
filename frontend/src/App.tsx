import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CheckinPage } from "./pages/CheckinPage";
import { LoginPage } from "./pages/LoginPage";
import { PainelGestor } from "./pages/PainelGestor";
import { RotaProtegida } from "./components/RotaProtegida";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RotaProtegida>
              <PainelGestor />
            </RotaProtegida>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/checkin/:eventoId" element={<CheckinPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
