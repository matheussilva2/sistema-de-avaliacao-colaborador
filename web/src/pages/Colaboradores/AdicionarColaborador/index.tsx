import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Label, Button } from "@heroui/react";
import { UserCircle2 } from "lucide-react";
import { ApiRequestError, getAuthenticatedUser } from "../../../services/authService";
import { createEmployeeForManager } from "../../../services/userService";

export default function AdicionarColaborador() {
  const navigate = useNavigate();
  const [previewUrl, setPreviewUrl] = useState("");
  const [form, setForm] = useState({
    nome: "",
    sobrenome: "",
    cpf: "",
    email: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    situacao: "Ativo",
    dataContratacao: "",
    dataRegistro: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    const nextValue = field === "cpf" ? formatCpf(value) : value;

    setForm((prev) => ({ ...prev, [field]: nextValue }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPreviewUrl("");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    setErrorMessage("");
    const validationErrors = validateCollaboratorForm(form, true);

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setErrorMessage("Corrija os campos destacados antes de salvar.");
      return;
    }

    setIsLoading(true);

    const manager = getAuthenticatedUser();

    if (!manager || manager.userRole !== "MANAGER") {
      setErrorMessage("Faca login como gestor para cadastrar colaboradores.");
      setIsLoading(false);
      return;
    }

    try {
      await createEmployeeForManager(manager.id, {
        name: form.nome,
        lastName: form.sobrenome,
        cpf: form.cpf,
        email: form.email,
        phone: form.telefone,
        passWord: form.senha,
        hireDate: form.dataContratacao,
        registrationDate: form.dataRegistro,
        userRole: "EMPLOYEE",
        active: form.situacao === "Ativo",
      });

      navigate("/painel/colaboradores");
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 409) {
        setErrorMessage("Ja existe uma conta cadastrada com esse e-mail.");
        setFieldErrors((prev) => ({ ...prev, email: "Ja existe uma conta cadastrada com esse e-mail." }));
      } else {
        setErrorMessage("Nao foi possivel cadastrar o usuario. Confira os dados.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 bg-neutral-50 min-h-screen">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Adicionar colaborador</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preencha os dados abaixo para cadastrar um novo colaborador.
          </p>
        </div>
        <Button
          className="bg-white text-primary border border-primary font-semibold px-6"
          onPress={() => navigate("/painel/colaboradores")}
        >
          Voltar à lista
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <Card className="rounded-3xl bg-white shadow-sm p-6 flex flex-col items-center gap-6">
            <div className="w-40 h-40 rounded-full bg-primary-50 overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircle2 className="text-primary-400 size-20" />
              )}
            </div>

            <div className="w-full">
              <Label className="text-primary-700 font-semibold text-sm mb-2 block">
                Foto de perfil
              </Label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-sm text-gray-700 file:bg-primary-500 file:text-white file:px-4 file:py-2 file:rounded-full border border-gray-200 rounded-xl cursor-pointer"
              />
            </div>

            <p className="text-center text-sm text-gray-500">
              Envie uma foto para facilitar a identificação do colaborador.
            </p>
          </Card>
        </div>

        <form onSubmit={handleSave} className="col-span-12 xl:col-span-8 space-y-6">
          <Card className="rounded-3xl bg-white shadow-sm overflow-hidden">
            <div className="bg-primary text-white px-6 py-4">
              <h2 className="font-semibold">Dados pessoais</h2>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="nome" className="text-primary-700 font-semibold text-sm">
                  Nome
                </Label>
                <Input
                  id="nome"
                  type="text"
                  value={form.nome}
                  onChange={(e) => handleFieldChange("nome", e.target.value)}
                  placeholder="Digite o nome"
                  className="bg-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sobrenome" className="text-primary-700 font-semibold text-sm">
                  Sobrenome
                </Label>
                <Input
                  id="sobrenome"
                  type="text"
                  value={form.sobrenome}
                  onChange={(e) => handleFieldChange("sobrenome", e.target.value)}
                  placeholder="Digite o sobrenome"
                  className="bg-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="cpf" className="text-primary-700 font-semibold text-sm">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  type="text"
                  value={form.cpf}
                  onChange={(e) => handleFieldChange("cpf", e.target.value)}
                  placeholder="000.000.000-00"
                  className="bg-white"
                  required
                />
                <FieldError message={fieldErrors.cpf} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-primary-700 font-semibold text-sm">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder="email@empresa.com"
                  className="bg-white"
                  required
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="telefone" className="text-primary-700 font-semibold text-sm">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="tel"
                  value={form.telefone}
                  onChange={(e) => handleFieldChange("telefone", e.target.value)}
                  placeholder="(XX) XXXXX-XXXX"
                  className="bg-white"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="senha" className="text-primary-700 font-semibold text-sm">
                  Senha inicial
                </Label>
                <Input
                  id="senha"
                  type="password"
                  value={form.senha}
                  onChange={(e) => handleFieldChange("senha", e.target.value)}
                  placeholder="Senha para primeiro acesso"
                  className="bg-white"
                  required
                />
                <PasswordRequirements password={form.senha} />
                <FieldError message={fieldErrors.senha} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmarSenha" className="text-primary-700 font-semibold text-sm">
                  Confirmar senha
                </Label>
                <Input
                  id="confirmarSenha"
                  type="password"
                  value={form.confirmarSenha}
                  onChange={(e) => handleFieldChange("confirmarSenha", e.target.value)}
                  placeholder="Digite a senha novamente"
                  className="bg-white"
                  required
                />
                <FieldError message={fieldErrors.confirmarSenha} />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-primary-700 font-semibold text-sm">
                  Tipo de usuario
                </Label>
                <Input
                  value="Colaborador"
                  className="bg-white"
                  readOnly
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="situacao" className="text-primary-700 font-semibold text-sm">
                  Situacao
                </Label>
                <select
                  id="situacao"
                  value={form.situacao}
                  onChange={(e) => handleFieldChange("situacao", e.target.value)}
                  className="bg-white border rounded-xl h-10 px-3"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataContratacao" className="text-primary-700 font-semibold text-sm">
                  Data de contratação
                </Label>
                <Input
                  id="dataContratacao"
                  type="date"
                  value={form.dataContratacao}
                  onChange={(e) => handleFieldChange("dataContratacao", e.target.value)}
                  className="bg-white"
                  required
                />
                <FieldError message={fieldErrors.dataContratacao} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="dataRegistro" className="text-primary-700 font-semibold text-sm">
                  Data de registro
                </Label>
                <Input
                  id="dataRegistro"
                  type="date"
                  value={form.dataRegistro}
                  onChange={(e) => handleFieldChange("dataRegistro", e.target.value)}
                  className="bg-white"
                  required
                />
                <FieldError message={fieldErrors.dataRegistro} />
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
            <Button
              type="submit"
              className="bg-primary text-white px-8"
              isDisabled={isLoading}
            >
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
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

type CollaboratorForm = {
  nome: string;
  sobrenome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  confirmarSenha: string;
  situacao: string;
  dataContratacao: string;
  dataRegistro: string;
};

function validateCollaboratorForm(form: CollaboratorForm, requirePassword: boolean) {
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
