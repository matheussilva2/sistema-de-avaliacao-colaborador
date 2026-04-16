import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Template from "./components/Template";
import Login from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Treinamentos } from "./pages/Treinamentos";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="painel" element={<Template titulo="TESTE" />}>
          <Route index element={<>Início</>} />
          <Route path="meu-perfil" element={<MyProfile />} />
          <Route path="colaboradores" element={<>Colaboradores</>} />
          <Route path="treinamentos" element={<Treinamentos />} />
          <Route path="gerenciar-treinamentos" element={<>Gerenciar Treinamentos</>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
