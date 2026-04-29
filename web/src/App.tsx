import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Template from "./components/Template";
import Login from "./pages/Login";
import { MyProfile } from "./pages/MyProfile";
import { Treinamentos } from "./pages/Treinamentos";
import Colaboradores from "./pages/Colaboradores";
import ColaboradorDetalhe from "./pages/Colaboradores/Detalhe";
import AdicionarColaborador from "./pages/Colaboradores/AdicionarColaborador";
import Inicio from "./pages/Inicio";
import { GerenciarTreinamentos } from "./pages/Gerenciar-Treinamentos";
import TreinamentoDetalhes from "./pages/Gerenciar-Treinamentos/Treinamento-Detalhe";
import AdicionarAluno from "./pages/Gerenciar-Treinamentos/AdicionarAluno";
import CriarTreinamento from "./pages/Gerenciar-Treinamentos/Novo-Treinamento";
import TreinamentoAluno from "./pages/Treinamentos/Treinamento-Detalhe";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Login />} />
        <Route path="painel" element={<Template />}>
          <Route index element={<Inicio />} />
          <Route path="meu-perfil" element={<MyProfile />} />
          <Route path="colaboradores" element={<Colaboradores />} />
          <Route path="colaboradores/adicionar" element={<AdicionarColaborador />} />
          <Route path="colaboradores/novo" element={<AdicionarColaborador />} />
          <Route path="colaboradores/:id" element={<ColaboradorDetalhe />} />
          <Route path="treinamentos" element={<Treinamentos />} />
          <Route path="treinamentos/:id" element={<TreinamentoAluno />} />

          <Route
            path="gerenciar-treinamentos"
            element={<GerenciarTreinamentos />}
          />

          <Route
            path="gerenciar-treinamentos/novo-treinamento"
            element={<CriarTreinamento />}
          />
          <Route path="gerenciar-treinamentos/:id/adicionar-alunos" element={<AdicionarAluno />} />
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
