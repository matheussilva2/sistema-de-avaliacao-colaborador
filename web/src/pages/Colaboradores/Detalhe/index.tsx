import { useParams } from "react-router-dom";

import { useState } from "react";
import { Card, Input, Label, Checkbox } from "@heroui/react";
import type { Permission } from "../../../types/Permission";
import { colaboradores, trainingsMock } from "../../../mock";
import { UserCircle2 } from "lucide-react";

const permissionsMock: Permission[] = [
  {
    name: "manage_trainings",
    label: "Gerenciar Treinamentos",
    isEnabled: true,
  },
  {
    name: "manage_users",
    label: "Gerenciar usuários",
    isEnabled: false,
  },
];

export default function ColaboradorDetalhe() {
  const { id } = useParams();

  const colaborador = colaboradores.find((c) => c.id === Number(id));

  const treinamentos = colaborador?.treinamentosIds.map((tId) => {
    return trainingsMock.find((t) => t.id === tId);
  });

  // const [isEditing, setIsEditing] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>(permissionsMock);

  const handlePermissionChange = (permissionName: string) => {
    const updatedPermissions = permissions.map((permission) => {
      if (permission.name === permissionName) {
        return { ...permission, isEnabled: !permission.isEnabled };
      }
      return permission;
    });

    setPermissions(updatedPermissions);
  };

  if (!colaborador) {
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
              {colaborador.nome}
            </span>
            <span className="text-primary-700 text-sm">
              {colaborador.cargo}
            </span>
            <span className="bg-primary-500 rounded-full text-sm text-white py-1 px-3">
              {colaborador.situacao}
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
              <p className="font-medium">12/03/2022</p>
            </div>

            <div>
              <span className="text-gray-500">Data de registro</span>
              <p className="font-medium">01/01/2022</p>
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
                  value={colaborador.nome}
                  name="nome"
                  disabled
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
                  disabled
                  value={colaborador.sobrenome}
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
                  disabled
                  value={colaborador.email}
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
                  disabled
                  value={colaborador.telefone}
                  name="telefone"
                  id="profile_telefone_input"
                />
              </div>
              {/* <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="profile_password_input"
                    className="text-primary-700 font-semibold text-sm"
                  >
                    Alterar Senha
                  </Label>
                  <Input
                    type="text"
                    placeholder="Nova senha"
                    className="bg-white"
                    disabled={!isEditing}
                    name="password"
                    id="profile_password_input"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="profile_repassword_input"
                    className="text-primary-700 font-semibold text-sm"
                  >
                    Confirmar Senha
                  </Label>
                  <Input
                    type="text"
                    placeholder="Confirme a senha"
                    className="bg-white"
                    disabled={!isEditing}
                    name="password_confirmation"
                    id="profile_repassword_input"
                  />
                </div> */}
            </form>

            {/* {isEditing ? (
                <Button
                  onPress={() => setIsEditing(false)}
                  className="w-full bg-primary text-white font-semibold mt-6"
                >
                  Salvar Alterações
                </Button>
              ) : (
                <Button
                  onPress={() => setIsEditing(true)}
                  className="w-full bg-primary text-white font-semibold mt-6"
                >
                  Editar Dados
                </Button>
              )} */}
          </div>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Cargos e Permissões
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
                  value={colaborador.cargo}
                  className="bg-white text-black"
                  disabled
                />
              </div>
              <div />
            </div>

            <div className="mt-6">
              <h3 className="text-primary-700 font-semibold text-sm mb-4">
                Permissões
              </h3>
              <div className="flex flex-col gap-3 w-full">
                {colaborador.permissoes.map((permissao) => (
                  <div key={permissao.name} className="flex items-center gap-2">
                    <Checkbox
                      id={`permissions_${permissao.name}`}
                      isSelected={permissao.isEnabled}
                      onChange={() => handlePermissionChange(permissao.name)}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox>

                    <label
                      htmlFor={`permissions_${permissao.name}`}
                      className="text-gray-700 cursor-pointer"
                    >
                      {permissao.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          {" "}
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Treinamentos
            </span>
          </div>
          <div className="bg-primary-50 p-6">
            {treinamentos && treinamentos.length ? (
              <ul className="flex flex-col gap-3">
                {treinamentos.map((t) => (
                  <>
                    {t && (
                      <li
                        key={t.id}
                        className="bg-primary-50 rounded-md p-4 border border-primary-500 flex flex-col gap-3"
                      >
                        <h2 className="text-xl text-primary-500">{t.title}</h2>
                        <span className="text-black">{t.status}</span>
                        <button className="bg-primary-500 w-fit px-4 py-1 rounded-full text-white text-sm hover:bg-primary-300 cursor-pointer">
                          Ver mais
                        </button>
                      </li>
                    )}
                  </>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500 text-sm">
                Nenhum treinamento vinculado
              </span>
            )}
          </div>
        </Card>
      </div>
      {/* </div> */}
    </div>
  );
}
