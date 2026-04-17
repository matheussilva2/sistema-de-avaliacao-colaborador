import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Template from "./components/Template";
import Login from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Treinamentos } from "./pages/Treinamentos";
import { DetalhesTrainamento } from "./pages/DetalhesTrainamento";
import { AuthProvider } from "./providers/AuthProvider";

function App() {

  return (
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="painel" element={<Template titulo="TESTE" />}>
          <Route index element={<>Início</>} />
          <Route path="meu-perfil" element={<MyProfile />} />
          <Route path="colaboradores" element={<>Colaboradores</>} />
          <Route path="treinamentos/:id" element={<DetalhesTrainamento />} />
          <Route path="treinamentos" element={<Treinamentos />} />
          <Route path="gerenciar-treinamentos" element={<>Gerenciar Treinamentos</>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  )
}

export default App
