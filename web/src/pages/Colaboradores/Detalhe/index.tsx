import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { Undo2, X } from "lucide-react";
import {
  ApiRequestError,
  getAuthenticatedUser,
  type ApiUser,
  type ApiUserRole,
} from "../../../services/authService";
import {
  getUserById,
  updateUser,
} from "../../../services/userService";
import {
  moveEmployeeToTrash,
  restoreEmployeeFromTrash,
} from "../../../services/employeeTrashService";

type PendingUndo = {
  managerId: string;
  user: ApiUser;
};

export default function ColaboradorDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null);
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

  useEffect(() => {
    if (!pendingUndo) {
      return;
    }

    const undoTimer = window.setTimeout(() => {
      navigate("/painel/colaboradores");
    }, 5000);

    return () => window.clearTimeout(undoTimer);
  }, [navigate, pendingUndo]);

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
        userRole: "EMPLOYEE",
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

  const handleDelete = () => {
    const manager = getAuthenticatedUser();

    if (!user || !manager || manager.userRole !== "MANAGER") {
      setErrorMessage("Nao foi possivel mover o colaborador para a lixeira.");
      return;
    }

    moveEmployeeToTrash(manager.id, user);
    setPendingUndo({ managerId: manager.id, user });
  };

  const handleUndoDelete = () => {
    if (!pendingUndo) {
      return;
    }

    restoreEmployeeFromTrash(pendingUndo.managerId, pendingUndo.user.id);
    setPendingUndo(null);
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
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={`${form.nome} ${form.sobrenome}`}
              className="size-28 rounded-full border-4 border-primary object-cover"
            />
          ) : (
            <div className="flex size-28 items-center justify-center rounded-full border-4 border-primary bg-white text-3xl font-bold text-primary">
              {getUserInitials(form.nome, form.sobrenome)}
            </div>
          )}

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
              <Input
                value="Colaborador"
                className="bg-white"
                readOnly
              />
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

      {pendingUndo && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(420px,calc(100vw-3rem))] rounded-md border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-neutral-900">
                Colaborador movido para a lixeira
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {pendingUndo.user.name} {pendingUndo.user.lastName} sera mantido na
                lixeira ate a exclusao definitiva.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPendingUndo(null)}
              className="rounded-md p-1 text-neutral-500 transition hover:bg-gray-100 hover:text-neutral-900"
              aria-label="Fechar aviso"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              className="bg-primary text-white"
              onPress={handleUndoDelete}
            >
              <Undo2 size={16} />
              Desfazer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function getUserInitials(name: string, lastName: string) {
  const initials = `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

  return initials || "C";
}
