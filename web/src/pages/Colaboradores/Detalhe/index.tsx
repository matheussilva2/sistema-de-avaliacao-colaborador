import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, Input, Label, Button, Skeleton } from "@heroui/react";
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
    confirmarSenha: "",
    dataContratacao: "",
    dataRegistro: "",
    userRole: "EMPLOYEE" as ApiUserRole,
    situacao: "Ativo",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
          cpf: formatCpf(userData.cpf),
          email: userData.email,
          telefone: userData.phone,
          senha: "",
          confirmarSenha: "",
          dataContratacao: userData.hireDate ?? "",
          dataRegistro: userData.registrationDate ?? "",
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
    const nextValue = field === "cpf" ? formatCpf(value) : value;

    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();

    if (!id) {
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    const validationErrors = validateCollaboratorForm(form, false);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de salvar.");
      setIsSaving(false);
      return;
    }

    try {
      const updatedUser = await updateUser(id, {
        name: form.nome,
        lastName: form.sobrenome,
        cpf: form.cpf,
        email: form.email,
        phone: form.telefone,
        passWord: form.senha || undefined,
        hireDate: form.dataContratacao,
        registrationDate: form.dataRegistro,
        userRole: "EMPLOYEE",
        active: form.situacao === "Ativo",
      });

      setUser(updatedUser);
      navigate("/painel/colaboradores");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        const message = getUpdateConflictMessage(error.message);
        setErrorMessage(message.global);
        setFieldErrors((prev) => ({ ...prev, [message.field]: message.fieldMessage }));
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
    return <CollaboratorDetailSkeleton />;
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
              <FieldError message={fieldErrors.cpf} />
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
              <FieldError message={fieldErrors.email} />
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
                placeholder="Opcional"
              />
              {form.senha && <PasswordRequirements password={form.senha} />}
              <FieldError message={fieldErrors.senha} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_confirmar_senha_input" className="text-primary-700 font-semibold text-sm">
                Confirmar nova senha
              </Label>
              <Input
                id="profile_confirmar_senha_input"
                type="password"
                className="bg-white"
                value={form.confirmarSenha}
                onChange={(e) => handleFieldChange("confirmarSenha", e.target.value)}
                placeholder="Repita apenas se alterar a senha"
              />
              <FieldError message={fieldErrors.confirmarSenha} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_data_contratacao_input" className="text-primary-700 font-semibold text-sm">
                Data de contratação
              </Label>
              <Input
                id="profile_data_contratacao_input"
                type="date"
                className="bg-white"
                value={form.dataContratacao}
                onChange={(e) => handleFieldChange("dataContratacao", e.target.value)}
                required
              />
              <FieldError message={fieldErrors.dataContratacao} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="profile_data_registro_input" className="text-primary-700 font-semibold text-sm">
                Data de registro
              </Label>
              <Input
                id="profile_data_registro_input"
                type="date"
                className="bg-white"
                value={form.dataRegistro}
                onChange={(e) => handleFieldChange("dataRegistro", e.target.value)}
                required
              />
              <FieldError message={fieldErrors.dataRegistro} />
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

        <div className="flex flex-col items-end gap-2">
          {errorMessage && (
            <p className="text-sm font-semibold text-red-600">
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

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-xs font-semibold text-red-600">{message}</p>;
}

function PasswordRequirements({ password }: { password: string }) {
  const requirements = getPasswordRequirements(password);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs">
      <p className="mb-2 font-semibold text-neutral-700">Requisitos da senha</p>
      <div className="grid gap-1">
        {requirements.map((requirement) => (
          <span
            key={requirement.label}
            className={requirement.valid ? "text-green-700" : "text-red-600"}
          >
            {requirement.valid ? "✓" : "x"} {requirement.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function validateCollaboratorForm(
  form: {
    cpf: string;
    email: string;
    senha: string;
    confirmarSenha: string;
    dataContratacao: string;
    dataRegistro: string;
  },
  requirePassword: boolean,
) {
  const errors: Record<string, string> = {};

  if (!isValidEmail(form.email)) {
    errors.email = "Informe um e-mail valido.";
  }

  if (!isValidCpf(form.cpf)) {
    errors.cpf = "Informe um CPF valido.";
  }

  if (!form.dataRegistro) {
    errors.dataRegistro = "Informe a data de registro.";
  }

  if (!form.dataContratacao) {
    errors.dataContratacao = "Informe a data de contratacao.";
  } else {
    const hireDateError = validateHireDate(form.dataContratacao, form.dataRegistro);

    if (hireDateError) {
      errors.dataContratacao = hireDateError;
    }
  }

  if (requirePassword || form.senha || form.confirmarSenha) {
    if (!isValidPassword(form.senha)) {
      errors.senha = "A senha nao atende aos requisitos minimos.";
    }

    if (form.senha !== form.confirmarSenha) {
      errors.confirmarSenha = "As senhas nao conferem.";
    }
  }

  return errors;
}

function getPasswordRequirements(password: string) {
  return [
    { label: "Minimo de 8 caracteres", valid: password.length >= 8 },
    { label: "Uma letra maiuscula", valid: /[A-Z]/.test(password) },
    { label: "Uma letra minuscula", valid: /[a-z]/.test(password) },
    { label: "Um numero", valid: /\d/.test(password) },
  ];
}

function isValidPassword(password: string) {
  return getPasswordRequirements(password).every((requirement) => requirement.valid);
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateHireDate(hireDateValue: string, registrationDateValue: string) {
  const hireDate = parseDate(hireDateValue);
  const registrationDate = parseDate(registrationDateValue);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyYearsAgo = new Date(today);
  thirtyYearsAgo.setFullYear(today.getFullYear() - 30);

  if (!hireDate) {
    return "Informe uma data de contratacao valida.";
  }

  if (registrationDate && hireDate < registrationDate) {
    return "A data de contratacao nao pode ser anterior a data de registro.";
  }

  if (hireDate < thirtyYearsAgo) {
    return "A data de contratacao nao pode ser inferior a 30 anos.";
  }

  if (hireDate > today) {
    return "A data de contratacao nao pode ser superior ao dia de hoje.";
  }

  return "";
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isValidCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const calculateDigit = (base: string, weight: number) => {
    const sum = base
      .split("")
      .reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateDigit(`${digits.slice(0, 9)}${firstDigit}`, 11);

  return firstDigit === Number(digits[9]) && secondDigit === Number(digits[10]);
}

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function getUpdateConflictMessage(message: string) {
  if (message.includes("Email already registered")) {
    return {
      field: "email",
      fieldMessage: "Ja existe uma conta cadastrada com esse e-mail.",
      global: "Ja existe uma conta cadastrada com esse e-mail.",
    };
  }

  if (message.includes("Invalid CPF")) {
    return {
      field: "cpf",
      fieldMessage: "Informe um CPF valido.",
      global: "Corrija os campos destacados antes de salvar.",
    };
  }

  return {
    field: "email",
    fieldMessage: "Nao foi possivel salvar esse campo.",
    global: "Nao foi possivel salvar as alteracoes.",
  };
}

function CollaboratorDetailSkeleton() {
  return (
    <div className="p-8 bg-neutral-50 min-h-screen grid grid-cols-12 gap-6">
      <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
        <Card className="bg-primary-50 rounded-xl shadow-md p-6 flex flex-col items-center gap-4">
          <Skeleton className="size-28 rounded-full" />
          <div className="flex flex-col items-center gap-2">
            <Skeleton className="h-6 w-48 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </Card>

        <Card className="rounded-xl shadow-md p-6 bg-white">
          <Skeleton className="mb-4 h-5 w-36 rounded-md" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full rounded-md" />
            <Skeleton className="h-4 w-52 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
        </Card>
      </div>

      <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
        {[1, 2].map((card) => (
          <Card key={card} className="rounded-xl shadow-md overflow-hidden p-0 gap-0">
            <Skeleton className="h-14 w-full rounded-none" />
            <div className="bg-primary-50 p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </Card>
        ))}

        <div className="flex flex-col md:flex-row justify-end gap-3">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>
    </div>
  );
}

function getUserInitials(name: string, lastName: string) {
  const initials = `${name.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();

  return initials || "C";
}
