import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Template from "./components/Template";
import Login from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Treinamentos } from "./pages/Treinamentos";
import Colaboradores from "./pages/Colaboradores";
import ColaboradorDetalhe from "./pages/Colaboradores/Detalhe";
import Inicio from "./pages/Inicio";
import { GerenciarTreinamentos } from "./pages/Gerenciar-Treinamentos";
import TreinamentoDetalhes  from "./pages/Gerenciar-Treinamentos/Treinamento-Detalhe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="painel" element={<Template />}>
          <Route index element={<Inicio />} />
          <Route path="meu-perfil" element={<MyProfile />} />
          <Route path="colaboradores" element={<Colaboradores />} />
          <Route path="colaboradores/:id" element={<ColaboradorDetalhe />} />
          <Route path="treinamentos" element={<Treinamentos />} />

          <Route
            path="gerenciar-treinamentos"
            element={<GerenciarTreinamentos />}
          />
          <Route
            path="gerenciar-treinamentos/:id"
            element={<TreinamentoDetalhes />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
