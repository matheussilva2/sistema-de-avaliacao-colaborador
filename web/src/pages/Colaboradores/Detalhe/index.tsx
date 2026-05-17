import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { UserCircle2 } from "lucide-react";
import {
  ApiRequestError,
  type ApiUser,
  type ApiUserRole,
} from "../../../services/authService";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "../../../services/userService";

export default function ColaboradorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
    userRole: "EMPLOYEE" as ApiUserRole,
    situacao: "Ativo",
  });

  useEffect(() => {
    async function loadUser() {
      if (!id) {
        return;
      }

      try {
        const userData = await getUserById(id);
        setUser(userData);
        setForm({
          nome: userData.name,
          sobrenome: userData.lastName,
          cpf: userData.cpf,
          email: userData.email,
          telefone: userData.phone,
          senha: "",
          userRole: userData.userRole,
          situacao: userData.active ? "Ativo" : "Inativo",
        });
      } catch {
        setErrorMessage("Nao foi possivel carregar esse usuario.");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [id]);

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");

    try {
      const updatedUser = await updateUser(id, {
        name: form.nome,
        lastName: form.sobrenome,
        cpf: form.cpf,
        email: form.email,
        phone: form.telefone,
        passWord: form.senha,
        userRole: form.userRole,
        active: form.situacao === "Ativo",
      });

      setUser(updatedUser);
      navigate("/painel/colaboradores");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        setErrorMessage("Ja existe uma conta cadastrada com esse e-mail.");
      } else {
        setErrorMessage("Nao foi possivel salvar as alteracoes.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) {
      return;
    }

    try {
      await deleteUser(id);
      navigate("/painel/colaboradores");
    } catch {
      setErrorMessage("Nao foi possivel deletar o usuario.");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-500">Carregando usuario...</div>;
  }

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-red-700">{errorMessage || "Usuario nao encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-neutral-50 min-h-screen grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
        <Card className="bg-primary-50 rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
          <UserCircle2 className="text-primary-400 size-20" />

          <div className="text-center flex flex-col gap-2">
            <span className="text-primary-700 text-lg font-bold">
              {form.nome} {form.sobrenome}
            </span>
            <span className="text-primary-700 text-sm">
              {form.userRole === "MANAGER" ? "Gestor" : "Colaborador"}
            </span>
            <span className="bg-primary-500 rounded-full text-sm text-white py-1 px-3">
              {form.situacao}
            </span>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md p-6 bg-white">
          <h3 className="text-primary-700 font-semibold text-sm mb-4">
            Dados do cadastro
          </h3>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <span>ID: {user.id}</span>
            <span>CPF: {user.cpf}</span>
            <span>E-mail: {user.email}</span>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSave} className="col-span-12 xl:col-span-8 flex flex-col gap-6">
        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Dados pessoais e acesso
            </span>
          </div>
          <div className="bg-primary-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_nome_input" className="text-primary-700 font-semibold text-sm">
                Nome
              </Label>
              <Input
                id="profile_nome_input"
                type="text"
                className="bg-white"
                value={form.nome}
                onChange={(e) => handleFieldChange("nome", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_sobrenome_input" className="text-primary-700 font-semibold text-sm">
                Sobrenome
              </Label>
              <Input
                id="profile_sobrenome_input"
                type="text"
                className="bg-white"
                value={form.sobrenome}
                onChange={(e) => handleFieldChange("sobrenome", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_cpf_input" className="text-primary-700 font-semibold text-sm">
                CPF
              </Label>
              <Input
                id="profile_cpf_input"
                type="text"
                className="bg-white"
                value={form.cpf}
                onChange={(e) => handleFieldChange("cpf", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_email_input" className="text-primary-700 font-semibold text-sm">
                E-mail
              </Label>
              <Input
                id="profile_email_input"
                type="email"
                className="bg-white"
                value={form.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_telefone_input" className="text-primary-700 font-semibold text-sm">
                Telefone
              </Label>
              <Input
                id="profile_telefone_input"
                type="tel"
                className="bg-white"
                value={form.telefone}
                onChange={(e) => handleFieldChange("telefone", e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_senha_input" className="text-primary-700 font-semibold text-sm">
                Nova senha
              </Label>
              <Input
                id="profile_senha_input"
                type="password"
                className="bg-white"
                value={form.senha}
                onChange={(e) => handleFieldChange("senha", e.target.value)}
                placeholder="Obrigatoria para salvar alteracoes"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
          <div className="bg-primary p-4">
            <span className="text-white font-semibold text-base">
              Permissao e situacao
            </span>
          </div>
          <div className="bg-primary-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <Label className="text-primary-700 font-semibold text-sm">
                Tipo de usuario
              </Label>
              <select
                value={form.userRole}
                onChange={(e) => handleFieldChange("userRole", e.target.value)}
                className="bg-white border rounded-xl h-10 px-3"
              >
                <option value="EMPLOYEE">Colaborador</option>
                <option value="MANAGER">Gestor</option>
              </select>
            </div>

            <div className="flex flex-col gap-3">
              <Label className="text-primary-700 font-semibold text-sm">Situacao</Label>
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
        </Card>

        {errorMessage && (
          <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col md:flex-row justify-end gap-3">
          <Button className="bg-red-500 text-white font-semibold px-8" onPress={handleDelete}>
            Deletar usuario
          </Button>
          <Button
            type="submit"
            className="bg-primary text-white font-semibold px-8"
            isDisabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
