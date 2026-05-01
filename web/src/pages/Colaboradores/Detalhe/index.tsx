import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { colaboradores, trainingsMock } from "../../../mock";
import { UserCircle2 } from "lucide-react";

export default function ColaboradorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreateMode = id === "novo";

  const colaborador = colaboradores.find((c) => c.id === Number(id));

  const treinamentos = colaborador?.treinamentosIds?.map((tId) => {
    return trainingsMock.find((t) => t.id === tId);
  }) ?? [];

  const [form, setForm] = useState({
    nome: colaborador?.nome ?? "",
    sobrenome: colaborador?.sobrenome ?? "",
    cpf: colaborador?.cpf ?? "",
    email: colaborador?.email ?? "",
    telefone: colaborador?.telefone ?? "",
    cargo: colaborador?.cargo ?? "colaborador",
    situacao: colaborador?.situacao ?? "Ativo",
    dataContratacao: "12/03/2022",
    dataRegistro: "01/01/2022",
  });

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload = {
      id: isCreateMode ? Date.now() : colaborador?.id,
      ...form,
      treinamentosIds: colaborador?.treinamentosIds ?? [],
    };

    console.log(isCreateMode ? "NOVO COLABORADOR:" : "COLABORADOR ATUALIZADO:", payload);
    navigate("/painel/colaboradores");
  };

  if (!colaborador && !isCreateMode) {
    return <div>Nenhum colaborador com esse id</div>;
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen grid grid-cols-12 gap-6">
      {/* <div className="gap-6 mb-8 "> */}
      <div className="col-span-4 flex flex-col gap-6">
        <Card className="bg-primary-50 rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
          <UserCircle2 className="text-primary-400 size-20" />

          <div className="text-center flex flex-col gap-2">
            <span className="text-primary-700 text-lg font-bold">
              {form.nome || "Novo colaborador"}
            </span>
            <span className="text-primary-700 text-sm">
              {form.cargo}
            </span>
            <span className="bg-primary-500 rounded-full text-sm text-white py-1 px-3">
              {form.situacao}
            </span>
          </div>
        </Card>
        <Card className="rounded-xl shadow-md p-6 bg-primary-50">
          <h3 className="text-primary-700 font-semibold text-sm mb-4">
            Informações adicionais
          </h3>

          <div className="flex flex-col gap-3 text-sm">
            <div>
              <span className="text-gray-500">Data de contratação</span>
              <Input
                type="text"
                value={form.dataContratacao}
                onChange={(e) => handleFieldChange("dataContratacao", e.target.value)}
                className="bg-white mt-1"
              />
            </div>

            <div>
              <span className="text-gray-500">Data de registro</span>
              <Input
                type="text"
                value={form.dataRegistro}
                onChange={(e) => handleFieldChange("dataRegistro", e.target.value)}
                className="bg-white mt-1"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-8 flex flex-col gap-6">
        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4 border-b-4 border-primary">
            <span className="text-white font-semibold text-base">
              Dados Pessoais
            </span>
          </div>
          <div className="bg-primary-50 p-6">
            <form className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="profile_nome_input"
                  className="text-primary-700 font-semibold text-sm"
                >
                  Nome
                </Label>
                <Input
                  type="text"
                  placeholder="Digite seu nome"
                  className="bg-white"
                  value={form.nome}
                  onChange={(e) => handleFieldChange("nome", e.target.value)}
                  name="nome"
                  id="profile_nome_input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="profile_sobrenome_input"
                  className="text-primary-700 font-semibold text-sm"
                >
                  Sobrenome
                </Label>
                <Input
                  type="text"
                  placeholder="Digite seu sobrenome"
                  className="bg-white"
                  value={form.sobrenome}
                  onChange={(e) => handleFieldChange("sobrenome", e.target.value)}
                  name="sobrenome"
                  id="profile_sobrenome_input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="profile_email_input"
                  className="text-primary-700 font-semibold text-sm"
                >
                  E-mail
                </Label>
                <Input
                  type="email"
                  placeholder="Digite seu e-mail"
                  className="bg-white"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  name="email"
                  id="profile_email_input"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="profile_telefone_input"
                  className="text-primary-700 font-semibold text-sm"
                >
                  Telefone
                </Label>
                <Input
                  type="tel"
                  placeholder="(XX) XXXXX-XXXX"
                  className="bg-white"
                  value={form.telefone}
                  onChange={(e) => handleFieldChange("telefone", e.target.value)}
                  name="telefone"
                  id="profile_telefone_input"
                />
              </div>
            </form>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Cargo e Situação
            </span>
          </div>
          <div className="bg-primary-50 p-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <Label className="text-primary-700 font-semibold text-sm">
                  Cargo
                </Label>
                <Input
                  type="text"
                  value={form.cargo}
                  onChange={(e) => handleFieldChange("cargo", e.target.value)}
                  className="bg-white text-black"
                />
              </div>
              <div className="flex flex-col gap-3">
                <Label className="text-primary-700 font-semibold text-sm">Situação</Label>
                <select
                  value={form.situacao}
                  onChange={(e) => handleFieldChange("situacao", e.target.value)}
                  className="bg-white border rounded-xl h-10 px-3"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

          </div>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Treinamentos
            </span>
          </div>
          <div className="bg-primary-50 p-6">
            {!isCreateMode && treinamentos && treinamentos.length ? (
              <ul className="flex flex-col gap-3">
                {treinamentos.map((t) => (
                  t && (
                    <li
                      key={t.id}
                      className="bg-primary-50 rounded-md p-4 border border-primary-500 flex flex-col gap-3"
                    >
                      <h2 className="text-xl text-primary-500">{t.title}</h2>
                      <span className="text-black">{t.status}</span>
                      <button
                    type="button"
                    onClick={() => navigate(`/painel/gerenciar-treinamentos/${t.id}`)}
                    className="bg-primary-500 w-fit px-4 py-1 rounded-full text-white text-sm hover:bg-primary-300 cursor-pointer"
                  >
                    Visualizar treinamento
                  </button>
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">
                {isCreateMode
                  ? "Vincule treinamentos após salvar o colaborador"
                  : "Nenhum treinamento vinculado"}
              </span>
            )}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-primary text-white font-semibold px-8" onPress={handleSave}>
            {isCreateMode ? "Salvar Colaborador" : "Salvar Alterações"}
          </Button>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}
