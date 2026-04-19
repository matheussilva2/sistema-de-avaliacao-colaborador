import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Template from "./components/Template";
import Login from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Treinamentos } from "./pages/Treinamentos";
import { DetalhesTreinamento } from "./pages/DetalhesTreinamento";
import { AuthProvider } from "./providers/AuthProvider";
import { ManageUsers } from "./pages/ManageUsers";
import { UserData } from "./pages/UserData";
import { NewUser } from "./pages/NewUser";

function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="painel" element={<Template titulo="TESTE" />}>
          <Route index element={<>Início</>} />
          <Route path="meu-perfil" element={<MyProfile />} />
          <Route path="colaboradores" element={<ManageUsers />} />
          <Route path="colaboradores/criar" element={<NewUser />} />
          <Route path="colaboradores/:id" element={<UserData />} />
          <Route path="treinamentos/:id" element={<DetalhesTreinamento />} />
          <Route path="treinamentos" element={<Treinamentos />} />
          <Route path="gerenciar-treinamentos" element={<>Gerenciar Treinamentos</>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
